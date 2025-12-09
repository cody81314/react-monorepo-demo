export interface ScoreConfig {
  base: number; // 底 (e.g., 100)
  pointValue: number; // 台 (e.g., 20)
}

export function calculateTai(
  cardTai: number,
  isDealer: boolean,
  renchan: number
): number {
  let totalTai = cardTai;

  // Dealer wins/loses adds 1 tai + 2*renchan
  // In Taiwan MJ, the dealer bonus applies to the *result* calculation generally.
  // Actually, standard is:
  // If Dealer: add (1 + 2*n) tai to the transaction.
  if (isDealer) {
    totalTai += 1 + renchan * 2;
  }
  
  return totalTai;
}

export function calculateScore(
  totalTai: number,
  config: ScoreConfig
): number {
  return config.base + totalTai * config.pointValue;
}
