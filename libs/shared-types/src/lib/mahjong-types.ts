import { Position, Wind } from './mahjong-enums.js';


export interface Player {
  id: string;
  name: string;
  position: Position;
  score: number;
  avatarUrl: string;
}

export interface Transaction {
  id: string;
  fromId: string;
  toId: string;
  tai: number;
  amount: number;
  confirmed: boolean;
  timestamp: number;
  description: string;
}

export interface RoundState {
  prevailingWind: Wind;
  dealerId: string;
  renchan: number; // 連莊計數
  dealerSequence: number; // To track when to change prevailing wind (0-3)
}

export interface PlayerSeatProps {
  player: Player;
  isDealer?: boolean;
  renchanCount?: number;
  pendingTransactions?: Transaction[];
  onConfirmTransaction?: (txId: string) => void;
  onConfirmAll?: (txIds: string[]) => void;
}
