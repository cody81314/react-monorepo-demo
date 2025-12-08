// @ts-ignore
import {
  Player,
  Transaction,
  PlayerSeatProps,
  Position,
} from '@react-monorepo-demo/shared-types';
import { Banknote, CheckCircle, CheckCircle2 } from 'lucide-react';

export function PlayerSeat({
  player,
  isDealer,
  renchanCount = 0,
  pendingTransactions = [],
  onConfirmTransaction,
  onConfirmAll,
}: PlayerSeatProps) {
  // TODO Draggable (Paying)
  const isDragging = false;

  // TODO Droppable (Receiving)
  const isOver = false;

  const positionStyles: Record<Position, string> = {
    [Position.Bottom]: 'bottom-4 left-1/2 -translate-x-1/2',
    [Position.Top]: 'top-4 left-1/2 -translate-x-1/2',
    [Position.Left]: 'left-4 top-1/2 -translate-y-1/2',
    [Position.Right]: 'right-4 top-1/2 -translate-y-1/2',
  };

  return (
    <div
      // TODO
      // ref={setRefs}
      // style={style}
      // {...listeners}
      // {...attributes}
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
        {/* Floating Confirm Buttons */}
        {/*TODO Floating Confirm Buttons*/}
      </div>
    </div>
  );
}

export default PlayerSeat;
