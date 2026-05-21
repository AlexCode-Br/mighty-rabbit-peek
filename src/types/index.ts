export interface Operation {
  id: string;
  type: 'MAE' | 'FILHA';
  deposit: number;
  withdraw: number | null;
  profit: number;
  bau?: boolean;
}

export interface Cycle {
  id: string;
  operations: [Operation, Operation]; // Sempre MÃE e FILHA
  totalProfit: number;
  completed: boolean;
  createdAt?: string;
}

export interface OperationDay {
  id: string; // YYYY-MM-DD
  date: string; // ISO string
  cycles: Cycle[];
  dailyProfit: number;
  goalReached: boolean;
  stopLossReached: boolean;
}

export interface AppSettings {
  dailyGoal: number;
  stopLoss: number;
  defaultMaeDeposit: number;
  defaultFilhaDeposit: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  category?: 'sinal' | 'meta' | 'anotacao' | 'geral';
  createdAt: string;
  updatedAt?: string;
}

export interface AppData {
  settings: AppSettings;
  history: Record<string, OperationDay>; // mapped by date ID YYYY-MM-DD
  chatMessages?: ChatMessage[]; // Mensagens do chat de anotações
}