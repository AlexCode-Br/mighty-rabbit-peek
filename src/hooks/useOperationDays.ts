import { format } from 'date-fns';
import { useLocalStorage } from './useLocalStorage';
import { AppData, AppSettings, Cycle, OperationDay, Operation } from '../types';
import { calculateCycleProfit, calculateDailyProfit, calculateOperationProfit, checkDailyStatus } from '../utils/calculations';

const DEFAULT_SETTINGS: AppSettings = {
  dailyGoal: 100,
  stopLoss: 50,
  defaultMaeDeposit: 30,
  defaultFilhaDeposit: 20,
};

const INITIAL_DATA: AppData = {
  settings: DEFAULT_SETTINGS,
  history: {},
};

export const useOperationDays = () => {
  const [data, setData] = useLocalStorage<AppData>('controle-ciclos-data', INITIAL_DATA);

  const getTodayId = () => format(new Date(), 'yyyy-MM-dd');

  const getTodayData = (): OperationDay => {
    const todayId = getTodayId();
    if (data.history[todayId]) {
      return data.history[todayId];
    }
    return {
      id: todayId,
      date: new Date().toISOString(),
      cycles: [],
      dailyProfit: 0,
      goalReached: false,
      stopLossReached: false,
    };
  };

  const updateSettings = (newSettings: AppSettings) => {
    setData((prev) => ({ ...prev, settings: newSettings }));
  };

  const addCycle = () => {
    const todayId = getTodayId();
    const todayData = getTodayData();
    const newCycle: Cycle = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      operations: [
        { id: crypto.randomUUID(), type: 'MAE', deposit: data.settings.defaultMaeDeposit, withdraw: null, profit: 0, bau: true },
        { id: crypto.randomUUID(), type: 'FILHA', deposit: data.settings.defaultFilhaDeposit, withdraw: null, profit: 0 },
      ],
      totalProfit: 0,
      completed: false,
    };

    setData((prev) => ({
      ...prev,
      history: {
        ...prev.history,
        [todayId]: {
          ...todayData,
          cycles: [newCycle, ...todayData.cycles],
        },
      },
    }));
  };

  const updateOperation = (cycleId: string, operationId: string, updates: Partial<Operation>) => {
    const todayId = getTodayId();
    const todayData = getTodayData();

    const newCycles = todayData.cycles.map(cycle => {
      if (cycle.id !== cycleId) return cycle;

      const newOperations = cycle.operations.map(op => {
        if (op.id !== operationId) return op;
        const updatedOp = { ...op, ...updates };
        const profit = calculateOperationProfit(updatedOp.deposit, updatedOp.withdraw, updatedOp.type === 'MAE', updatedOp.bau ?? false);
        return { ...updatedOp, profit };
      }) as [Operation, Operation];

      const totalProfit = calculateCycleProfit(newOperations[0].profit, newOperations[1].profit);
      const completed = newOperations[0].withdraw !== null && newOperations[1].withdraw !== null;

      return { ...cycle, operations: newOperations, totalProfit, completed };
    });

    const newDailyProfit = calculateDailyProfit(newCycles);
    const { goalReached, stopLossReached } = checkDailyStatus(newDailyProfit, data.settings.dailyGoal, data.settings.stopLoss);

    setData((prev) => ({
      ...prev,
      history: {
        ...prev.history,
        [todayId]: {
          ...todayData,
          cycles: newCycles,
          dailyProfit: newDailyProfit,
          goalReached,
          stopLossReached,
        },
      },
    }));
  };

  const deleteCycle = (cycleId: string) => {
    const todayId = getTodayId();
    const todayData = getTodayData();
    
    const newCycles = todayData.cycles.filter(c => c.id !== cycleId);
    const newDailyProfit = calculateDailyProfit(newCycles);
    const { goalReached, stopLossReached } = checkDailyStatus(newDailyProfit, data.settings.dailyGoal, data.settings.stopLoss);

    setData((prev) => ({
      ...prev,
      history: {
        ...prev.history,
        [todayId]: {
          ...todayData,
          cycles: newCycles,
          dailyProfit: newDailyProfit,
          goalReached,
          stopLossReached,
        },
      },
    }));
  }

  const importData = (importedData: AppData) => {
    setData(importedData);
  }

  return {
    data,
    todayData: getTodayData(),
    updateSettings,
    addCycle,
    updateOperation,
    deleteCycle,
    importData,
  };
};
