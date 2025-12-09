import { calculateScore, calculateTai } from './score-calculator';
import { nextRound } from './game-flow';
import { RoundState, Wind } from '@react-monorepo-demo/shared-types';

describe('Mahjong Logic', () => {
  describe('Score Calculator', () => {
    const config = { base: 100, pointValue: 20 };

    it('should calculate base score correctly', () => {
      // 0 Tai
      const tai = calculateTai(0, false, 0);
      expect(calculateScore(tai, config)).toBe(100);
    });

    it('should calculate tai score correctly', () => {
      // 5 Tai: 100 + 5*20 = 200
      const tai = calculateTai(5, false, 0);
      expect(calculateScore(tai, config)).toBe(200);
    });

    it('should add dealer bonus', () => {
      // Dealer 0 Tai: (0 + 1) Tai = 1 Tai -> 120
      const tai = calculateTai(0, true, 0);
      expect(tai).toBe(1);
      expect(calculateScore(tai, config)).toBe(120);
    });

    it('should add dealer renchan bonus', () => {
      // Dealer Renchan 1, 0 Card Tai: (0 + 1 + 2) = 3 Tai -> 160
      const tai = calculateTai(0, true, 1);
      expect(tai).toBe(3);
      expect(calculateScore(tai, config)).toBe(160);
    });

    it('should accumulate card tai with dealer bonus', () => {
      // Dealer Renchan 2, 5 Card Tai: (5 + 1 + 4) = 10 Tai -> 300
      const tai = calculateTai(5, true, 2);
      expect(tai).toBe(10);
      expect(calculateScore(tai, config)).toBe(300);
    });
  });

  describe('Game Flow', () => {
    const playerIds = ['A', 'B', 'C', 'D'];
    const initialState: RoundState = {
      prevailingWind: Wind.East,
      dealerId: 'A',
      renchan: 0,
      dealerSequence: 0,
    };

    it('should increment renchan if dealer wins', () => {
      const next = nextRound(initialState, 'A', playerIds);
      expect(next.dealerId).toBe('A');
      expect(next.renchan).toBe(1);
      expect(next.dealerSequence).toBe(0);
    });

    it('should increment renchan if draw (Liu Ju)', () => {
      const next = nextRound(initialState, null, playerIds);
      expect(next.dealerId).toBe('A');
      expect(next.renchan).toBe(1);
    });

    it('should rotate dealer if dealer loses', () => {
      const next = nextRound(initialState, 'B', playerIds);
      expect(next.dealerId).toBe('B');
      expect(next.renchan).toBe(0);
      expect(next.dealerSequence).toBe(1);
    });

    it('should change wind after 4 dealer rotations', () => {
      const stateBeforeWindChange: RoundState = {
        prevailingWind: Wind.East,
        dealerId: 'D',
        renchan: 0,
        dealerSequence: 3,
      };
      
      // D loses to A (or anyone)
      const next = nextRound(stateBeforeWindChange, 'A', playerIds);
      
      expect(next.dealerId).toBe('A');
      expect(next.dealerSequence).toBe(0);
      expect(next.prevailingWind).toBe(Wind.South);
    });
  });
});
