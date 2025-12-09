import { RoundState, Wind } from '@react-monorepo-demo/shared-types';

export function nextRound(
  current: RoundState,
  winnerId: string | null, // null means draw (Liuju)
  playerIds: string[] // Assumed ordered [Bottom, Right, Top, Left] matching dealer rotation
): RoundState {
  const isDealerWin = winnerId === current.dealerId;
  const isDraw = winnerId === null;

  const nextState: RoundState = { ...current };

  if (isDealerWin) {
    // Dealer wins: Renchan + 1, Dealer stays
    nextState.renchan += 1;
  } else if (isDraw) {
    // Draw: Renchan + 1, Dealer stays (Taiwan MJ "San jia kao shou" or just standard Liuju)
    // Standard Taiwan rules: Dealer stays on Liuju, renchan adds up.
    nextState.renchan += 1;
  } else {
    // Dealer loses: Change Dealer
    nextState.renchan = 0;
    
    // Find next dealer
    const currentDealerIndex = playerIds.indexOf(current.dealerId);
    const nextDealerIndex = (currentDealerIndex + 1) % 4;
    nextState.dealerId = playerIds[nextDealerIndex];
    
    // Update sequence to track Wind changes
    nextState.dealerSequence++;
    
    // Check for Wind Change (after 4 dealer changes? Or just standard round tracking?)
    // A "Round" (Quan) ends when dealer returns to original starter.
    // Usually dealerSequence isn't just a number, it calculates when to switch prevailing wind.
    // For simplicity: If dealer goes back to 'East' player (A) and completes a full circle...
    // Let's assume playerIds[0] is the starting dealer of the game.
    
    if (nextState.dealerSequence >= 4) {
      nextState.dealerSequence = 0;
      nextState.prevailingWind = getNextWind(nextState.prevailingWind);
    }
  }

  return nextState;
}

function getNextWind(current: Wind): Wind {
  switch (current) {
    case Wind.East: return Wind.South;
    case Wind.South: return Wind.West;
    case Wind.West: return Wind.North;
    case Wind.North: return Wind.East; // Or End Game?
    default: return Wind.East;
  }
}
