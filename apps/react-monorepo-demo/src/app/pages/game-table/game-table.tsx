import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { INITIAL_PLAYERS, INITIAL_SETTINGS, INITIAL_ROUND_STATE } from './constants';
import { Player, Transaction, RoundState, Wind, HandRecord } from '@react-monorepo-demo/shared-types';
import PlayerSeat from './components/player-seat';
import TransactionModal from './components/TransactionModal';
import RuleAssistant from './components/RuleAssistant';
import { History, CheckCheck, Loader2 } from 'lucide-react';

// Helper to get next wind
const getNextWind = (current: Wind): Wind => {
  const winds = [Wind.East, Wind.South, Wind.West, Wind.North];
  const idx = winds.indexOf(current);
  return winds[(idx + 1) % 4];
};

export default function GameTable() {
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [settings] = useState(INITIAL_SETTINGS);
  const [roundState, setRoundState] = useState<RoundState>(INITIAL_ROUND_STATE);
  
  // Interaction State
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [transactionModal, setTransactionModal] = useState<{
    isOpen: boolean;
    fromId?: string;
    toId?: string;
  }>({ isOpen: false });
  
  // Current Hand State
  const [currentHandTransactions, setCurrentHandTransactions] = useState<Transaction[]>([]);
  const [completedHands, setCompletedHands] = useState<HandRecord[]>([]); // New History State
  const [isProcessingRoundEnd, setIsProcessingRoundEnd] = useState(false);

  // Auto-scroll for history
  const historyEndRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const activePlayer = players.find(p => p.id === activeDragId);

  // Derived Round Name Logic
  const dealerWinds = [Wind.East, Wind.South, Wind.West, Wind.North];
  const currentDealerWind = dealerWinds[roundState.dealerSequence % 4];
  const baseRoundName = `${roundState.prevailingWind}風${currentDealerWind}`;
  const fullRoundName = roundState.renchan > 0 ? `${baseRoundName}連${roundState.renchan}` : baseRoundName;

  // --- Logic: Analyze current hand status ---
  // --- Logic: Analyze current hand status ---
  const handStatus = useMemo(() => {
    if (currentHandTransactions.length === 0) return null;

    // Filter for round-ending transactions (Winning moves)
    const roundEndingTxs = currentHandTransactions.filter(t => !t.disableRoundEnd);
    
    // If we have winners, prioritize showing them
    if (roundEndingTxs.length > 0) {
      const fromIds = new Set(roundEndingTxs.map(t => t.fromId));
      const toIds = new Set(roundEndingTxs.map(t => t.toId));

      // Self-Draw: 1 Winner (toId), 3 Losers (fromId)
      if (toIds.size === 1 && fromIds.size === 3) {
        const winnerId = Array.from(toIds)[0];
        const winner = players.find(p => p.id === winnerId);
        return { type: 'SELF_DRAW', text: `[自摸] ${winner?.name} 向大家收錢`, color: 'text-purple-400', label: '自摸' };
      }

      // Multi-Gun: 1 Loser (fromId), >1 Winners (toId)
      if (fromIds.size === 1 && toIds.size > 1) {
        const loserId = Array.from(fromIds)[0];
        const loser = players.find(p => p.id === loserId);
        const countText = toIds.size === 2 ? '雙響' : '三響';
        return { type: 'MULTI_GUN', text: `[${countText}] ${loser?.name} 一炮多響`, color: 'text-red-500', label: countText };
      }

      // Regular Gun
      if (roundEndingTxs.length === 1) {
        const tx = roundEndingTxs[0];
        const from = players.find(p => p.id === tx.fromId);
        const to = players.find(p => p.id === tx.toId);
        return { type: 'GUN', text: `[放槍] ${from?.name} 給 ${to?.name} ${tx.tai}台`, color: 'text-yellow-400', label: '放槍' };
      }
      
      // Mixed/Incomplete State for Round Ending
      return { type: 'MIXED', text: '結算中...', color: 'text-slate-300', label: '結算' };
    }

    // Only if no round-ending events, check for Ka La Pong
    const kaLaPongTx = currentHandTransactions.find(t => t.disableRoundEnd);
    if (kaLaPongTx) {
      const from = players.find(p => p.id === kaLaPongTx.fromId);
      const to = players.find(p => p.id === kaLaPongTx.toId);
      return { 
        type: 'KALAPONG', 
        text: `[卡拉碰] ${from?.name} 付給 ${to?.name} ${kaLaPongTx.tai}台 (不結束牌局)`, 
        color: 'text-amber-500', 
        label: '卡拉碰' 
      };
    }

    return { type: 'MIXED', text: '結算中...', color: 'text-slate-300', label: '結算' };
  }, [currentHandTransactions, players]);


  // --- Logic: Round End & Rotation ---
  useEffect(() => {
    // Check if we should end the round automatically
    // Condition: All transactions are confirmed AND there is at least one "Scoring" transaction (not disableRoundEnd).
    if (currentHandTransactions.length > 0) {
      const allConfirmed = currentHandTransactions.every(t => t.confirmed);
      const hasRoundEndingTx = currentHandTransactions.some(t => !t.disableRoundEnd);

      if (allConfirmed && hasRoundEndingTx) {
        if (!isProcessingRoundEnd) {
          setIsProcessingRoundEnd(true);
          // Delay to allow users to see the "Confirmed" state before switching
          const timer = setTimeout(() => {
            advanceRound();
            setIsProcessingRoundEnd(false);
          }, 3000); 
          return () => clearTimeout(timer);
        }
      }
    }
  }, [currentHandTransactions]);

  useEffect(() => {
    // Scroll history to bottom when new hand is added
    if (historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [completedHands]);

  const advanceRound = () => {
    // 1. Snapshot current round data for history
    const dealerName = players.find(p => p.id === roundState.dealerId)?.name || '?';
    const resultLabel = handStatus?.label || '流局';
    
    // Calculate net score changes for this hand
    const changes: Record<string, number> = { 'A': 0, 'B': 0, 'C': 0, 'D': 0 };
    currentHandTransactions.forEach(tx => {
       changes[tx.fromId] = (changes[tx.fromId] || 0) - tx.amount;
       changes[tx.toId] = (changes[tx.toId] || 0) + tx.amount;
    });

    const record: HandRecord = {
      id: Date.now().toString(),
      roundName: fullRoundName,
      dealerName: dealerName,
      resultType: resultLabel,
      scoreChanges: changes,
      timestamp: Date.now()
    };

    setCompletedHands(prev => [...prev, record]);

    // 2. Logic to rotate dealer
    setRoundState(prev => {
      // Identify Winners
      const winners = new Set(currentHandTransactions.map(t => t.toId));
      
      // Check if Dealer Won
      const dealerWon = winners.has(prev.dealerId);

      const nextState = { ...prev };

      if (dealerWon) {
        // Dealer stays, Renchan increases
        nextState.renchan += 1;
      } else {
        // Dealer rotates
        nextState.renchan = 0;
        
        // Find current dealer index
        const currentDealerIdx = players.findIndex(p => p.id === prev.dealerId);
        const nextDealerIdx = (currentDealerIdx + 1) % 4; // A->B->C->D->A
        
        nextState.dealerId = players[nextDealerIdx].id;
        nextState.dealerSequence += 1;

        // Check if prevailing wind needs to change (every 4 dealers)
        if (nextState.dealerSequence > 0 && nextState.dealerSequence % 4 === 0) {
          nextState.prevailingWind = getNextWind(prev.prevailingWind);
        }
      }
      return nextState;
    });

    // Clear current transactions for next hand
    setCurrentHandTransactions([]);
  };


  // --- Handlers ---

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (over && active.id !== over.id) {
      // Open Modal
      setTransactionModal({
        isOpen: true,
        fromId: active.id as string,
        toId: over.id as string,
      });
    }
  };

  // Handle Yan Pai Toggle
  const handleToggleYanPai = (playerId: string) => {
    setPlayers(prev => prev.map(p => 
      p.id === playerId ? { ...p, isYanPai: !p.isYanPai } : p
    ));
  };

  const handleTransactionSubmit = (tai: number, amount: number, disableRoundEnd = false) => {
    if (!transactionModal.fromId || !transactionModal.toId) return;

    setCurrentHandTransactions(prev => {
      const payerId = transactionModal.fromId!;
      const payeeId = transactionModal.toId!;


      // Check for existing pending transaction from same payer to same payee
      const existingTxIndex = prev.findIndex(t => 
        t.fromId === payerId && 
        t.toId === payeeId && 
        !t.confirmed
      );

      // Calculate Amount including Yan Pai Self-Penalty if Payer is Eye
      // Note: User says "Yan Pai player pays extra 1 tai to collecting player"
      // If Payer IS Yan Pai, does he pay +1 Tai? Yes usually.
      // But 'amount' is already calculated by modal using (base + tai*point).
      // If we just add 1 tai to the description or logic, we might need to recalculate?
      // Actually, if Payer is Yan Pai, the modal calculation creates the base 'amount'.
      // If we want to add penalty, we should add a separate transaction OR modify this one.
      // Current modal already captures 'tai' and 'amount'.
      // Strategy: Create MAIN transaction with value from modal.
      // THEN check Yan Pai status of ALL players.
      
      const newTransactions: Transaction[] = [];

      // 1. Create/Update Main Transaction
      const mainTxId = existingTxIndex !== -1 ? prev[existingTxIndex].id : (Date.now().toString() + Math.random());
      
      const mainTx: Transaction = {
        id: mainTxId,
        fromId: payerId,
        toId: payeeId,
        tai,
        amount, 
        confirmed: false,
        timestamp: Date.now(),
        description: disableRoundEnd ? `卡拉碰` : `${tai}台`,
        disableRoundEnd: disableRoundEnd
      };

      if (existingTxIndex !== -1) {
        // We will rebuild the list anyway
      } else {
        newTransactions.push(mainTx);
      }

      // 2. Handle Yan Pai Penalties
      // Only generate penalties if this is a "Round Ending" transaction (NOT disableRoundEnd)
      if (!disableRoundEnd) {
        players.forEach(p => {
          // Skip winner (Payee)
          if (p.id === payeeId) return;

          // Condition: Is Yan Pai?
          if (p.isYanPai) {
             const penaltyTai = 1;
             // ... existing logic ...
 
           // Wait, usually penalty is just '1 Tai' worth? Or Base + 1 Tai?
           // Standard: "Pays 1 Tai". This implies just the point value of 1 Tai? Or standard scoring?
           // User phrasing: "pay extra 1 tai". Usually implies Points.
           // However, simple implementation: Create a transaction described as "眼牌費".
           // Standard practice: Yan Pai penalty is often treated as full payment or specific fine.
           // Let's assume it's a full valid payment unit: Base + 1 Tai? Or just 1 Tai * Point?
           // Let's stick to "1 Tai" text in description, and amount = settings.pointPerTai (Assuming just the unit value)
           // OR standard formula: Base + 1*Point.
           // Let's use Base + 1*Point for safety unless user says otherwise, as "Payment" implies a full calculation.
           // BUT, if Payer A is already paying 5 Tai, and is Yan Pai...
           // If we add another transaction A->B for 1 Tai...
           // It might be confusing.
           // Let's refine:
           // If Payer A is Yan Pai -> We increase the MAIN TX amount?
           // The modal already set the amount.
           // Better to spawn a SEPARATE "Yan Pai" transaction for clarity.
           // Is it possible to have multiple transactions A->B? Yes.
           
           // We only generate Yan Pai tx if it doesn't already exist for this 'round' of payments?
           // Or just generate it now.
           
           // Logic: Generate Yan Pai TX for Payer (A) if A is Yan Pai.
           // Logic: Generate Yan Pai TX for Bystander (C) if C is Yan Pai.
           
           // Check if we already have a pending Yan Pai tx for this person?
           const existingYanPai = prev.find(t => t.fromId === p.id && t.toId === payeeId && !t.confirmed && t.description.includes('眼牌'));
           
           if (!existingYanPai) {
             const yanPaiTx: Transaction = {
               id: Date.now().toString() + Math.random() + '_yanpai',
               fromId: p.id,
               toId: payeeId,
               tai: 1,
               amount: settings.pointPerTai, // Assuming just the 1 Tai value, no base? Or Base+Point? Let's use Base+Point to be safe as 'Penalty'.
               confirmed: false,
               timestamp: Date.now() + 1,
               description: `眼牌費`
             };
             newTransactions.push(yanPaiTx);
          }
          }
        });
      }
      
      // Merge:
      // Remove old pending Main Tx if existing
      const cleanPrev = prev.filter(t => !(t.fromId === payerId && t.toId === payeeId && !t.confirmed && !t.description.includes('眼牌')));
      
      return [...cleanPrev, ...newTransactions];
    });

    // Close modal after submitting
    setTransactionModal({ isOpen: false });
  };

  const handleConfirmTransaction = (txId: string) => {
    const tx = currentHandTransactions.find(t => t.id === txId);
    if (!tx || tx.confirmed) return;

    // Apply score changes immediately upon individual confirmation
    setPlayers(prev => prev.map(p => {
      if (p.id === tx.fromId) return { ...p, score: p.score - tx.amount };
      if (p.id === tx.toId) return { ...p, score: p.score + tx.amount };
      return p;
    }));

    // Mark as confirmed
    setCurrentHandTransactions(prev => 
      prev.map(t => t.id === txId ? { ...t, confirmed: true } : t)
    );
  };

  const handleConfirmAllTransactions = (txIds: string[]) => {
    // Filter out already confirmed transactions to avoid double counting
    const validTxs = currentHandTransactions.filter(t => txIds.includes(t.id) && !t.confirmed);
    if (validTxs.length === 0) return;

    // Apply score changes for all valid transactions
    setPlayers(prev => {
      const newPlayers = [...prev];
      validTxs.forEach(tx => {
         const fromIdx = newPlayers.findIndex(p => p.id === tx.fromId);
         if (fromIdx !== -1) newPlayers[fromIdx] = { ...newPlayers[fromIdx], score: newPlayers[fromIdx].score - tx.amount };
         
         const toIdx = newPlayers.findIndex(p => p.id === tx.toId);
         if (toIdx !== -1) newPlayers[toIdx] = { ...newPlayers[toIdx], score: newPlayers[toIdx].score + tx.amount };
      });
      return newPlayers;
    });

    // Mark all as confirmed
    setCurrentHandTransactions(prev => 
      prev.map(t => txIds.includes(t.id) ? { ...t, confirmed: true } : t)
    );
  };

  const getPlayer = (id?: string) => players.find(p => p.id === id);


  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center relative select-none overflow-hidden font-sans">
      
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, gray 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

      {/* Top HUD */}
      <div className="absolute top-0 w-full p-4 flex flex-col items-center z-30 pointer-events-none gap-2">
         
         {/* Game Info */}
         <div className="bg-slate-800/90 backdrop-blur text-white px-6 py-2 rounded-full border border-slate-700 pointer-events-auto shadow-lg flex items-center gap-4">
            <h1 className="font-bold text-emerald-400 text-lg flex items-center gap-2">
              🀄️ <span className="font-mono">{fullRoundName}</span>
            </h1>
            <div className="h-4 w-px bg-slate-600"></div>
            <div className="text-xs text-slate-400 flex gap-2">
              <span>底: <span className="text-white font-mono">{settings.baseScore}</span></span>
              <span>台: <span className="text-white font-mono">{settings.pointPerTai}</span></span>
            </div>
         </div>

         {/* Active Hand Status Banner */}
         {handStatus && (
           <div className={`
             animate-in slide-in-from-top-4 
             bg-slate-900/95 backdrop-blur-md px-8 py-4 rounded-xl shadow-2xl border-l-4 
             pointer-events-auto max-w-2xl w-full text-center
             ${handStatus.type === 'SELF_DRAW' ? 'border-purple-500' : 
               handStatus.type === 'MULTI_GUN' ? 'border-red-500' : 'border-yellow-500'}
           `}>
             <div className={`text-2xl font-bold mb-2 ${handStatus.color}`}>
               {isProcessingRoundEnd ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin"/> 下一局準備中...</span> : handStatus.text}
             </div>
             
             {/* Pending Transactions List (Compact) */}
             <div className="flex flex-wrap justify-center gap-2 mt-2">
                {currentHandTransactions.map(tx => {
                  const from = getPlayer(tx.fromId);
                  const to = getPlayer(tx.toId);
                  return (
                    <div key={tx.id} className={`
                      flex items-center gap-2 px-3 py-1 rounded border text-sm transition-all duration-300
                      ${tx.confirmed 
                        ? 'bg-green-900/50 border-green-500 text-green-200' 
                        : 'bg-slate-800 border-slate-600 text-slate-300'}
                    `}>
                      <span>{from?.name}</span>
                      <span className="text-xs opacity-50">➜</span>
                      <span>{to?.name}</span>
                      <span className="font-mono font-bold bg-black/20 px-1 rounded">{tx.amount}</span>
                      
                      {tx.confirmed ? (
                        <CheckCheck size={14} className="text-green-400" />
                      ) : (
                        <span className="text-xs italic opacity-70">等待確認...</span>
                      )}
                    </div>
                  );
                })}
             </div>
           </div>
         )}
      </div>

      {/* Main 2.5D Table Area */}
      <DndContext 
        sensors={sensors}
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEnd}
      >
        <div className="perspective-container w-full h-full absolute inset-0 flex items-center justify-center">
          
          <div className="table-surface w-[600px] h-[600px] bg-emerald-800 rounded-3xl relative border-[12px] border-emerald-900 shadow-2xl mt-12">
            {/* Texture */}
            <div className="absolute inset-0 bg-emerald-700 opacity-50 rounded-2xl m-2 border border-emerald-600/30"></div>
            
            {/* Center Info (Round & Dealer) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0 transform -rotate-12 opacity-80">
               <div className="text-6xl font-black text-emerald-900/40 select-none tracking-widest whitespace-nowrap">{baseRoundName}</div>
               {roundState.renchan > 0 && (
                 <div className="text-4xl font-bold text-red-900/30 mt-2 select-none">連 {roundState.renchan}</div>
               )}
               {/* Decorative Center */}
               <div className="absolute w-32 h-32 border-4 border-emerald-900/20 rounded-lg"></div>
            </div>

            {/* Players */}
            {players.map(player => (
              <PlayerSeat 
                key={player.id} 
                player={player}
                isDealer={player.id === roundState.dealerId}
                renchanCount={player.id === roundState.dealerId ? roundState.renchan : 0}
                // Pass transactions waiting for THIS player to confirm
                pendingTransactions={currentHandTransactions.filter(t => t.toId === player.id && !t.confirmed)}
                onConfirmTransaction={handleConfirmTransaction}
                onConfirmAll={handleConfirmAllTransactions}
                onToggleYanPai={handleToggleYanPai}
              />
            ))}

          </div>
        </div>

        <DragOverlay>
           {activePlayer ? (
             <div className="w-24 h-24 rounded-full border-4 border-blue-400 bg-slate-800 shadow-2xl overflow-hidden opacity-90 cursor-grabbing">
               <img src={activePlayer.avatarUrl} alt={activePlayer.name} className="w-full h-full object-cover" />
             </div>
           ) : null}
        </DragOverlay>
      </DndContext>

      {/* Transaction Modal */}
      {transactionModal.isOpen && transactionModal.fromId && transactionModal.toId && (
        <TransactionModal
          isOpen={transactionModal.isOpen}
          fromPlayer={getPlayer(transactionModal.fromId)!}
          toPlayer={getPlayer(transactionModal.toId)!}
          settings={settings}
          roundState={roundState}
          onClose={() => setTransactionModal({ isOpen: false })}
          onSubmit={handleTransactionSubmit}
        />
      )}

      {/* NEW: Round History Table */}
      <div className="absolute bottom-6 left-6 z-30 flex flex-col gap-2 max-w-lg w-full">
        <div className="bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg shadow-xl overflow-hidden">
           {/* Header */}
           <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
             <h3 className="text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
               <History size={14} /> 牌局紀錄
             </h3>
             <span className="text-[10px] text-slate-500">最近 20 局</span>
           </div>
           
           {/* Table Header */}
           <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-3 py-2 bg-slate-800/50 text-[10px] font-bold text-slate-400 border-b border-slate-700/50 text-center">
             <div className="text-left">風位</div>
             <div>莊家</div>
             <div>說明</div>
             <div className="text-slate-300">A</div>
             <div className="text-slate-300">B</div>
             <div className="text-slate-300">C</div>
             <div className="text-slate-300">D</div>
           </div>

           {/* Table Body */}
           <div className="max-h-40 overflow-y-auto custom-scrollbar bg-slate-900/50">
             {completedHands.length === 0 ? (
               <div className="p-4 text-center text-slate-600 text-xs italic">
                 尚未有完成的牌局
               </div>
             ) : (
               completedHands.map((hand) => (
                 <div key={hand.id} className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-3 py-1.5 border-b border-slate-800 text-[11px] items-center text-center hover:bg-white/5 transition-colors">
                   <div className="text-left font-mono text-emerald-500 whitespace-nowrap overflow-hidden text-ellipsis">{hand.roundName}</div>
                   <div className="text-slate-300">{hand.dealerName}</div>
                   <div className={`font-medium ${hand.resultType === '自摸' ? 'text-purple-400' : 'text-yellow-400'}`}>{hand.resultType}</div>
                   
                   {['A', 'B', 'C', 'D'].map(pid => {
                     const score = hand.scoreChanges[pid] || 0;
                     return (
                       <div key={pid} className={`font-mono font-bold ${score > 0 ? 'text-green-400' : score < 0 ? 'text-red-400' : 'text-slate-600'}`}>
                         {score}
                       </div>
                     );
                   })}
                 </div>
               ))
             )}
             <div ref={historyEndRef} />
           </div>
        </div>
      </div>

      <RuleAssistant />

      <div className="absolute bottom-4 w-full text-center text-slate-500 text-[10px] pointer-events-none opacity-50">
        將輸家拖曳至贏家頭像 • 系統自動偵測自摸/多響 • 全數確認後自動換莊
      </div>

    </div>
  );
}
