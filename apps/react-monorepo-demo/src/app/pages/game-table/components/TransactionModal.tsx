import React, { useState, useEffect } from 'react';
import { Player, GameSettings, RoundState } from '@react-monorepo-demo/shared-types';
import { X, Calculator, Crown } from 'lucide-react';

interface TransactionModalProps {
  fromPlayer: Player;
  toPlayer: Player;
  settings: GameSettings;
  roundState: RoundState;
  isOpen: boolean;
  onClose: () => void;
  onClose: () => void;
  onSubmit: (tai: number, amount: number, disableRoundEnd?: boolean) => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  fromPlayer,
  toPlayer,
  settings,
  roundState,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [tai, setTai] = useState<number>(1);
  const [calculatedAmount, setCalculatedAmount] = useState<number>(0);
  const [isDealerBonusApplied, setIsDealerBonusApplied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Logic: If Dealer is involved, default Tai = 1 + (2 * Renchan)
      // Otherwise default is 0 (User Request)
      const isDealerInvolved = fromPlayer.id === roundState.dealerId || toPlayer.id === roundState.dealerId;
      
      let defaultTai = 0;
      let appliedBonus = false;

      if (isDealerInvolved) {
        // Dealer Bonus logic
        defaultTai = 1 + (2 * roundState.renchan);
        appliedBonus = true;
      }

      setTai(defaultTai);
      setIsDealerBonusApplied(appliedBonus);
    }
  }, [isOpen, fromPlayer.id, toPlayer.id, roundState.dealerId, roundState.renchan]);

  useEffect(() => {
    // Auto calculate amount when tai changes
    setCalculatedAmount(settings.baseScore + (tai * settings.pointPerTai));
  }, [tai, settings]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(tai, calculatedAmount, false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 p-4 flex justify-between items-center border-b border-slate-700">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-red-400">結算</span> 確認
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div className="flex items-center justify-between text-lg">
            <div className="flex flex-col items-center">
              <img src={fromPlayer.avatarUrl} alt={fromPlayer.name} className="w-12 h-12 rounded-full border-2 border-red-500 mb-2" />
              <span className="font-bold text-red-400">{fromPlayer.name}</span>
              {fromPlayer.id === roundState.dealerId && <span className="text-[10px] bg-red-600 text-white px-1 rounded mt-1">莊家</span>}
            </div>
            <div className="text-slate-400 flex flex-col items-center">
              <span>支付給</span>
              <span className="text-2xl mt-1">➔</span>
            </div>
            <div className="flex flex-col items-center">
              <img src={toPlayer.avatarUrl} alt={toPlayer.name} className="w-12 h-12 rounded-full border-2 border-green-500 mb-2" />
              <span className="font-bold text-green-400">{toPlayer.name}</span>
              {toPlayer.id === roundState.dealerId && <span className="text-[10px] bg-red-600 text-white px-1 rounded mt-1">莊家</span>}
            </div>
          </div>

          <div className="bg-slate-700/50 p-4 rounded-lg space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                 <label className="text-sm font-medium text-slate-300">台數 (Tai)</label>
                 {isDealerBonusApplied && (
                   <span className="text-xs text-yellow-400 flex items-center gap-1">
                     <Crown size={12} /> 
                     已套用莊家連{roundState.renchan}台數
                   </span>
                 )}
              </div>
              <div className="flex items-center gap-4">
                <button 
                  type="button" 
                  onClick={() => setTai(Math.max(0, tai - 1))}
                  className="w-10 h-10 rounded bg-slate-600 hover:bg-slate-500 flex items-center justify-center text-xl font-bold"
                >-</button>
                <input
                  type="number"
                  min="0"
                  value={tai}
                  onChange={(e) => setTai(parseInt(e.target.value) || 0)}
                  className="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-center text-xl font-mono text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <button 
                  type="button" 
                  onClick={() => setTai(tai + 1)}
                  className="w-10 h-10 rounded bg-slate-600 hover:bg-slate-500 flex items-center justify-center text-xl font-bold"
                >+</button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-600">
               <span className="text-slate-400 text-sm">計算公式: {settings.baseScore}底 + {tai} × {settings.pointPerTai}</span>
               <div className="text-right">
                 <span className="block text-xs text-slate-400">總金額</span>
                 <span className="text-2xl font-bold text-yellow-400">{calculatedAmount}</span>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                // Ka La Pong: 0 Base + 1 Tai.
                // Does NOT end round.
                onSubmit(1, settings.pointPerTai, true); // Amount = just 1 Tai (0 Base)
                onClose();
              }}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center whitespace-nowrap"
              title="支付1台(卡拉碰)，不結束牌局"
            >
              卡拉碰
            </button>

            <button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Calculator size={20} />
              發送付款請求
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
