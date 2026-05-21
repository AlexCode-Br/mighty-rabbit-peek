import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../components/AuthProvider';
import { AppData, OperationDay, Cycle, Operation, ChatMessage } from '../types';
import { format } from 'date-fns';
import { calculateOperationProfit, calculateCycleProfit } from '../utils/calculations';

const DEFAULT_SETTINGS = {
  dailyGoal: 0,
  stopLoss: 0,
  defaultMaeDeposit: 0,
  defaultFilhaDeposit: 0
};

export function useOperationDays() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AppData>({
    settings: DEFAULT_SETTINGS,
    history: {},
    chatMessages: []
  });

  // Carregar dados iniciais
  useEffect(() => {
    if (!user) return;

    async function loadData() {
      try {
        const { data: appData, error } = await supabase
          .from('app_data')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (appData) {
          setData({
            settings: appData.settings || DEFAULT_SETTINGS,
            history: appData.history || {},
            chatMessages: appData.chat_messages || []
          });
        } else {
          const initialData = {
            user_id: user.id,
            settings: DEFAULT_SETTINGS,
            history: {},
            chat_messages: []
          };
          await supabase.from('app_data').insert(initialData);
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  const persistData = useCallback(async (newData: Partial<AppData>) => {
    if (!user) return;

    const updatePayload: any = {};
    if (newData.settings) updatePayload.settings = newData.settings;
    if (newData.history) updatePayload.history = newData.history;
    if (newData.chatMessages) updatePayload.chat_messages = newData.chatMessages;

    try {
      const { error } = await supabase
        .from('app_data')
        .update(updatePayload)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (err) {
      console.error("Erro ao persistir dados:", err);
    }
  }, [user]);

  const getDayData = (dateId: string): OperationDay => {
    if (data.history[dateId]) return data.history[dateId];
    return {
      id: dateId,
      date: dateId,
      cycles: [],
      dailyProfit: 0,
      goalReached: false,
      stopLossReached: false
    };
  };

  const updateSettings = (newSettings: any) => {
    const updated = { ...data, settings: newSettings };
    setData(updated);
    persistData({ settings: newSettings });
  };

  const addCycle = (dateId: string, config: any, timestamp: string) => {
    const day = getDayData(dateId);
    const newCycle: Cycle = {
      id: crypto.randomUUID(),
      createdAt: timestamp,
      completed: false,
      totalProfit: 0,
      operations: [
        { 
          id: crypto.randomUUID(), 
          type: 'MAE', 
          deposit: config.maeDeposit, 
          withdraw: config.maeWithdraw, 
          bau: config.maeBau, 
          profit: 0 
        },
        { 
          id: crypto.randomUUID(), 
          type: 'FILHA', 
          deposit: config.filhaDeposit, 
          withdraw: config.filhaWithdraw, 
          profit: 0 
        }
      ]
    };

    const newHistory = {
      ...data.history,
      [dateId]: { ...day, cycles: [newCycle, ...day.cycles] }
    };

    setData(prev => ({ ...prev, history: newHistory }));
    persistData({ history: newHistory });
  };

  const updateOperation = (dateId: string, cycleId: string, operationId: string, updates: Partial<Operation>) => {
    const day = getDayData(dateId);
    const newCycles = day.cycles.map(c => {
      if (c.id !== cycleId) return c;
      
      const updatedOps = c.operations.map(o => {
        if (o.id !== operationId) return o;
        const newOp = { ...o, ...updates };
        // Recalcular lucro da operação individual
        newOp.profit = calculateOperationProfit(
          newOp.deposit, 
          newOp.withdraw, 
          newOp.type === 'MAE', 
          newOp.bau
        );
        return newOp;
      }) as [Operation, Operation];

      const allCompleted = updatedOps.every(o => o.withdraw !== null);
      const totalCycleProfit = calculateCycleProfit(updatedOps[0].profit, updatedOps[1].profit);

      return { 
        ...c, 
        operations: updatedOps, 
        completed: allCompleted,
        totalProfit: totalCycleProfit
      };
    });

    const dailyProfit = newCycles.reduce((acc, c) => acc + c.totalProfit, 0);

    const newHistory = {
      ...data.history,
      [dateId]: { 
        ...day, 
        cycles: newCycles, 
        dailyProfit,
        goalReached: dailyProfit >= data.settings.dailyGoal && data.settings.dailyGoal > 0,
        stopLossReached: dailyProfit <= -data.settings.stopLoss && data.settings.stopLoss > 0
      }
    };

    setData(prev => ({ ...prev, history: newHistory }));
    persistData({ history: newHistory });
  };

  const deleteCycle = (dateId: string, cycleId: string) => {
    const day = getDayData(dateId);
    const newCycles = day.cycles.filter(c => c.id !== cycleId);
    const dailyProfit = newCycles.reduce((acc, c) => acc + c.totalProfit, 0);

    const newHistory = {
      ...data.history,
      [dateId]: { 
        ...day, 
        cycles: newCycles, 
        dailyProfit,
        goalReached: dailyProfit >= data.settings.dailyGoal && data.settings.dailyGoal > 0,
        stopLossReached: dailyProfit <= -data.settings.stopLoss && data.settings.stopLoss > 0
      }
    };

    setData(prev => ({ ...prev, history: newHistory }));
    persistData({ history: newHistory });
  };

  const addChatMessage = (text: string, category: string) => {
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      text,
      category: category as any,
      createdAt: new Date().toISOString()
    };
    const newMessages = [...(data.chatMessages || []), newMessage];
    setData(prev => ({ ...prev, chatMessages: newMessages }));
    persistData({ chatMessages: newMessages });
  };

  const updateChatMessage = (id: string, text: string) => {
    const newMessages = (data.chatMessages || []).map(m => m.id === id ? { ...m, text } : m);
    setData(prev => ({ ...prev, chatMessages: newMessages }));
    persistData({ chatMessages: newMessages });
  };

  const deleteChatMessage = (id: string) => {
    const newMessages = (data.chatMessages || []).filter(m => m.id !== id);
    setData(prev => ({ ...prev, chatMessages: newMessages }));
    persistData({ chatMessages: newMessages });
  };

  const clearChatMessages = () => {
    setData(prev => ({ ...prev, chatMessages: [] }));
    persistData({ chatMessages: [] });
  };

  return {
    data,
    loading,
    getDayData,
    updateSettings,
    addCycle,
    updateOperation,
    deleteCycle,
    addChatMessage,
    updateChatMessage,
    deleteChatMessage,
    clearChatMessages
  };
}