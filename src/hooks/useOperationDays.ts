import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { AppData, AppSettings, Cycle, OperationDay, Operation } from '../types';
import { calculateCycleProfit, calculateDailyProfit, calculateOperationProfit, checkDailyStatus } from '../utils/calculations';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../components/AuthProvider';

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

export interface AddCycleData {
  maeDeposit: number;
  maeWithdraw: number | null;
  maeBau: boolean;
  filhaDeposit: number;
  filhaWithdraw: number | null;
}

export const useOperationDays = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const dataRef = useRef<AppData>(INITIAL_DATA);

  useEffect(() => {
    if (!user) return;
    
    const loadData = async () => {
      setLoading(true);
      const { data: remoteData, error } = await supabase
        .from('app_data')
        .select('settings, history')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading data', error);
      }

      if (remoteData) {
        const mergedData = {
          settings: remoteData.settings || DEFAULT_SETTINGS,
          history: remoteData.history || {},
        };
        setData(mergedData);
        dataRef.current = mergedData;
      } else {
        await supabase.from('app_data').insert({
          user_id: user.id,
          settings: DEFAULT_SETTINGS,
          history: {}
        });
        setData(INITIAL_DATA);
        dataRef.current = INITIAL_DATA;
      }
      setLoading(false);
    };

    loadData();
  }, [user]);

  const saveToDatabase = async (newData: AppData) => {
    if (!user) return;
    
    setData(newData);
    dataRef.current = newData;

    const { error } = await supabase
      .from('app_data')
      .update({
        settings: newData.settings,
        history: newData.history,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Save error:', error);
    }
  };

  const updateData = (updater: (prev: AppData) => AppData) => {
    const newData = updater(dataRef.current);
    saveToDatabase(newData);
  };

  const getDayData = (dateId: string): OperationDay => {
    if (data.history[dateId]) {
      return data.history[dateId];
    }
    return {
      id: dateId,
      date: new Date(`${dateId}T12:00:00`).toISOString(),
      cycles: [],
      dailyProfit: 0,
      goalReached: false,
      stopLossReached: false,
    };
  };

  const updateSettings = (newSettings: AppSettings) => {
    updateData((prev) => ({ ...prev, settings: newSettings }));
  };

  const addCycle = (dateId: string, customData?: AddCycleData, creationDateIso?: string) => {
    const dayData = getDayData(dateId);
    
    const newCycle: Cycle = {
      id: crypto.randomUUID(),
      createdAt: creationDateIso || new Date().toISOString(),
      operations: [
        { 
          id: crypto.randomUUID(), 
          type: 'MAE', 
          deposit: customData ? customData.maeDeposit : data.settings.defaultMaeDeposit, 
          withdraw: customData ? customData.maeWithdraw : null, 
          profit: 0, 
          bau: customData ? customData.maeBau : true 
        },
        { 
          id: crypto.randomUUID(), 
          type: 'FILHA', 
          deposit: customData ? customData.filhaDeposit : data.settings.defaultFilhaDeposit, 
          withdraw: customData ? customData.filhaWithdraw : null, 
          profit: 0 
        },
      ],
      totalProfit: 0,
      completed: false,
    };

    if (customData) {
      newCycle.operations[0].profit = calculateOperationProfit(newCycle.operations[0].deposit, newCycle.operations[0].withdraw, true, newCycle.operations[0].bau ?? false);
      newCycle.operations[1].profit = calculateOperationProfit(newCycle.operations[1].deposit, newCycle.operations[1].withdraw, false, false);
      newCycle.totalProfit = calculateCycleProfit(newCycle.operations[0].profit, newCycle.operations[1].profit);
      newCycle.completed = newCycle.operations[0].withdraw !== null && newCycle.operations[1].withdraw !== null;
    }

    const newCycles = [newCycle, ...dayData.cycles];
    const newDailyProfit = calculateDailyProfit(newCycles);
    const { goalReached, stopLossReached } = checkDailyStatus(newDailyProfit, data.settings.dailyGoal, data.settings.stopLoss);

    updateData((prev) => ({
      ...prev,
      history: {
        ...prev.history,
        [dateId]: {
          ...dayData,
          cycles: newCycles,
          dailyProfit: newDailyProfit,
          goalReached,
          stopLossReached,
        },
      },
    }));
  };

  const updateOperation = (dateId: string, cycleId: string, operationId: string, updates: Partial<Operation>) => {
    const dayData = getDayData(dateId);

    const newCycles = dayData.cycles.map(cycle => {
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

    updateData((prev) => ({
      ...prev,
      history: {
        ...prev.history,
        [dateId]: {
          ...dayData,
          cycles: newCycles,
          dailyProfit: newDailyProfit,
          goalReached,
          stopLossReached,
        },
      },
    }));
  };

  const deleteCycle = (dateId: string, cycleId: string) => {
    const dayData = getDayData(dateId);
    
    const newCycles = dayData.cycles.filter(c => c.id !== cycleId);
    const newDailyProfit = calculateDailyProfit(newCycles);
    const { goalReached, stopLossReached } = checkDailyStatus(newDailyProfit, data.settings.dailyGoal, data.settings.stopLoss);

    updateData((prev) => ({
      ...prev,
      history: {
        ...prev.history,
        [dateId]: {
          ...dayData,
          cycles: newCycles,
          dailyProfit: newDailyProfit,
          goalReached,
          stopLossReached,
        },
      },
    }));
  }

  return {
    data,
    loading,
    getDayData,
    updateSettings,
    addCycle,
    updateOperation,
    deleteCycle,
  };
};