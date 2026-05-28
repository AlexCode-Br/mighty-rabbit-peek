export interface Operation {
  readonly id: string;
  readonly type: 'MAE' | 'FILHA';
  readonly deposit: number;
  readonly withdraw: number | null;
  readonly profit: number;
  readonly bau?: boolean;
}

export interface Cycle {
  readonly id: string;
  readonly operations: readonly [Operation, Operation]; // Contrato imutável de tupla [MÃE, FILHA]
  readonly totalProfit: number;
  readonly completed: boolean;
  readonly createdAt?: string;
}

export interface OperationDay {
  readonly id: string; // Formato YYYY-MM-DD
  readonly date: string; // ISO String
  readonly cycles: readonly Cycle[];
  readonly dailyProfit: number;
  readonly goalReached: boolean;
  readonly stopLossReached: boolean;
}

export interface AppSettings {
  readonly dailyGoal: number;
  readonly stopLoss: number;
  readonly defaultMaeDeposit: number;
  readonly defaultFilhaDeposit: number;
}

export type ChatMessageCategory = 'sinal' | 'meta' | 'anotacao' | 'geral';

export interface ChatMessage {
  readonly id: string;
  readonly text: string;
  readonly category?: ChatMessageCategory;
  readonly createdAt: string;
  readonly updatedAt?: string;
}

export interface AppData {
  readonly settings: AppSettings;
  readonly history: Record<string, OperationDay>;
  readonly chatMessages?: readonly ChatMessage[];
}