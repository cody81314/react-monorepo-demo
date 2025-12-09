import { Player, Position, RoundState, Wind, GameSettings } from '@react-monorepo-demo/shared-types';

export const INITIAL_PLAYERS: Player[] = [
  {
    id: 'A',
    name: 'Player A',
    position: Position.Bottom,
    score: 0,
    avatarUrl: 'https://picsum.photos/100/100?random=1',
  },
  {
    id: 'B',
    name: 'Player B',
    position: Position.Right,
    score: 0,
    avatarUrl: 'https://picsum.photos/100/100?random=2',
  },
  {
    id: 'C',
    name: 'Player C',
    position: Position.Top,
    score: 0,
    avatarUrl: 'https://picsum.photos/100/100?random=3',
  },
  {
    id: 'D',
    name: 'Player D',
    position: Position.Left,
    score: 0,
    avatarUrl: 'https://picsum.photos/100/100?random=4',
  },
];

export const INITIAL_ROUND_STATE: RoundState = {
  prevailingWind: Wind.East,
  dealerId: 'A',
  renchan: 0,
  dealerSequence: 0,
};

export const INITIAL_SETTINGS: GameSettings = {
  baseScore: 100,
  pointPerTai: 20,
};
