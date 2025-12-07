
export function GameTable() {
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
            🀄️ <span className="font-mono">東風東</span>
          </h1>
          <div className="h-4 w-px bg-slate-600"></div>
          <div className="text-xs text-slate-400 flex gap-2">
            <span>底: <span className="text-white font-mono">100</span></span>
            <span>台: <span className="text-white font-mono">20</span></span>
          </div>
        </div>

        {/* Active Hand Status Banner */}
        {/* TODO Hand Status Banner */}

      </div>

      {/* Main 2.5D Table Area */}
      {/* TODO DndContext */}
      <div className="perspective-container w-full h-full absolute inset-0 flex items-center justify-center">
        <div className="table-surface w-[600px] h-[600px] bg-emerald-800 rounded-3xl relative border-[12px] border-emerald-900 shadow-2xl">
          {/* Texture */}
          <div className="absolute inset-0 bg-emerald-700 opacity-50 rounded-2xl m-2 border border-emerald-600/30"></div>

          {/* Center Info (Round & Dealer) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0 transform -rotate-12 opacity-80">
            <div className="text-6xl font-black text-emerald-900/40 select-none tracking-widest whitespace-nowrap">東風東</div>
            {/* TODO 連莊 > 0 */}
            { (
              <div className="text-4xl font-bold text-red-900/30 mt-2 select-none">連 1</div>
            )}
            {/* Decorative Center */}
            <div className="absolute w-32 h-32 border-4 border-emerald-900/20 rounded-lg"></div>
          </div>

        </div>
      </div>

    </div>
  );
}

export default GameTable;
