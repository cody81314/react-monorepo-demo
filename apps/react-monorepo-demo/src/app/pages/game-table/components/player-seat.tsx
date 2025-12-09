// @ts-ignore
import { useDraggable, useDroppable } from '@dnd-kit/core';
import {
  Player,
  Transaction,
  Position,
  PlayerSeatProps, // Ensure this handles the new onToggleYanPai
} from '@react-monorepo-demo/shared-types';
import { Banknote, CheckCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export function PlayerSeat({
  player,
  isDealer,
  renchanCount = 0,
  pendingTransactions = [],
  onConfirmTransaction,
  onConfirmAll,
  onToggleYanPai,
}: PlayerSeatProps & { onToggleYanPai?: (id: string) => void }) {
  // Draggable (Paying)
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging,
  } = useDraggable({
    id: player.id,
    data: { player },
  });

  // Droppable (Receiving)
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: player.id,
    data: { player },
  });

  const positionStyles: Record<Position, string> = {
    [Position.Bottom]: 'bottom-16 left-1/2 -translate-x-1/2', // Moved up from bottom-4
    [Position.Top]: 'top-4 left-1/2 -translate-x-1/2',
    [Position.Left]: 'left-4 top-1/2 -translate-y-1/2',
    [Position.Right]: 'right-4 top-1/2 -translate-y-1/2',
  };

  const setRefs = (node: HTMLElement | null) => {
    setDragRef(node);
    setDropRef(node);
  };

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  // Transaction Grouping Logic
  const totalAmount = pendingTransactions.reduce(
    (sum, tx) => sum + tx.amount,
    0
  );
  const txCount = pendingTransactions.length;

  return (
    <div
      ref={setRefs}
      style={style}
      {...listeners}
      {...attributes}
      className={`absolute ${
        positionStyles[player.position]
      } z-10 transition-colors duration-200 touch-none`}
    >
      <div className="relative group cursor-grab active:cursor-grabbing">
        {/* Drop Zone Highlight */}
        {isOver && !isDragging && (
          <div className="absolute inset-0 -m-4 bg-yellow-400/30 rounded-full animate-pulse border-2 border-yellow-400 z-0" />
        )}

        {/* Dealer Indicator */}
        {isDealer && (
          <div className="absolute -top-3 -right-3 z-20 flex flex-col items-center animate-in zoom-in">
            <div className="w-8 h-8 bg-red-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center font-bold text-white text-sm">
              莊
            </div>
            {renchanCount > 0 && (
              <div className="bg-red-800 text-white text-[10px] px-1.5 rounded-full mt-[-4px] border border-white font-mono shadow-sm z-30">
                連{renchanCount}
              </div>
            )}
          </div>
        )}

        {/* Avatar */}
        <div
          className={`
          relative w-24 h-24 rounded-full border-4 shadow-xl overflow-hidden bg-slate-800
          flex items-center justify-center
          ${
            isDragging
              ? 'opacity-50 scale-95 border-blue-400'
              : isDealer
              ? 'border-red-500'
              : 'border-slate-600'
          }
          ${isOver ? 'scale-110 border-yellow-400' : ''}
          transition-all duration-200
        `}
        >
          <img
            src={player.avatarUrl}
            alt={player.name}
            className="w-full h-full object-cover pointer-events-none"
          />
        </div>

        {/* Player Name & Score */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-md border border-slate-700 flex items-center gap-2 z-20">
          <span>{player.name}</span>
          <span
            className={`flex items-center gap-1 ${
              player.score >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            <Banknote size={12} />
            {player.score}
          </span>
        </div>

        {/* Eye Toggle (Yan Pai) */}
        <button
          onClick={(e) => {
             e.stopPropagation();
             if (onToggleYanPai) onToggleYanPai(player.id);
          }}
          className={`
            absolute -bottom-14 left-1/2 -translate-x-1/2 
            flex flex-row items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold shadow-sm transition-all z-20 whitespace-nowrap
            ${player.isYanPai 
              ? 'bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.6)] scale-105' 
              : 'bg-slate-800 text-slate-500 border border-slate-600 grayscale hover:grayscale-0'}
          `}
        >
          {player.isYanPai ? <Eye size={14} /> : <EyeOff size={14} />}
          <span>眼牌</span>
        </button>

      {/* Floating Confirm Buttons */}
      {txCount > 0 && (
        <div 
          className={`
            absolute flex gap-1 z-50 w-40 items-center justify-center animate-in fade-in zoom-in
            ${player.position === Position.Bottom ? '-top-20 left-1/2 -translate-x-1/2 flex-col-reverse' : ''}
            ${player.position === Position.Top ? 'top-36 left-1/2 -translate-x-1/2 flex-col' : ''}
            ${player.position === Position.Left ? 'left-28 top-1/2 -translate-y-1/2 flex-col' : ''}
            ${player.position === Position.Right ? 'right-28 top-1/2 -translate-y-1/2 flex-col' : ''}
          `}
        >
          {txCount > 1 && onConfirmAll ? (
            // Batch Confirm Button
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                const allIds = pendingTransactions.map((t) => t.id);
                onConfirmAll(allIds);
              }}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl font-bold shadow-xl flex items-center justify-center gap-2 text-sm border border-violet-400 whitespace-nowrap ring-2 ring-white/20"
            >
              <CheckCircle2 size={16} />
              <span>
                全收 {totalAmount} ({txCount})
              </span>
            </button>
          ) : (
            // Single Confirm Button
            pendingTransactions.map((tx) => (
              <button
                key={tx.id}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onConfirmTransaction) onConfirmTransaction(tx.id);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-bold shadow-lg animate-bounce flex items-center justify-center gap-2 text-xs border border-white/20 whitespace-nowrap"
              >
                <CheckCircle size={14} />
                <span>收 {tx.amount}</span>
              </button>
            ))
          )}
        </div>
      )}
      </div>
    </div>
  );
}

export default PlayerSeat;
