import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../components/AuthProvider';
import { AppData, OperationDay, Cycle, Operation, ChatMessage } from '../types';
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
    
    const loadData = async () => {
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
        }
      } catch (err) {
        console.error("[useOperationDays] Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);

  // Função de persistência aprimorada (evita sobrescrever dados com nulo)
  const persistData = useCallback(async (updates: Partial<AppData>) => {
    if (!user) return;
    
    const payload: any = {};
    if (updates.settings) payload.settings = updates.settings;
    if (updates.history) payload.history = updates.history;
    if (updates.chatMessages !== undefined) payload.chat_messages = updates.chatMessages;

    try {
      // Tenta primeiro o update (mais seguro para updates parciais)
      const { error: updateError } = await supabase
        .from('app_data')
        .update(payload)
        .eq('user_id', user.id);
        
      // Se não existir o registro (usuário novo), faz o insert/upsert
      if (updateError) {
        await supabase.from('app_data').upsert({
          user_id: user.id,
          settings: updates.settings || data.settings,
          history: updates.history || data.history,
          chat_messages: updates.chatMessages || data.chatMessages || []
        });
      }
    } catch (err) {
      console.error("[useOperationDays] Persist Error:", err);
    }
  }, [user, data.settings, data.history, data.chatMessages]);

  const getDayData = useCallback((dateId: string): OperationDay => {
    return data.history[dateId] || {
      id: dateId,
      date: dateId,
      cycles: [],
      dailyProfit: 0,
      goalReached: false,
      stopLossReached: false
    };
  }, [data.history]);

  const updateSettings = (settings: any) => {
    setData(prev => ({ ...prev, settings }));
    persistData({ settings });
  };

  const addCycle = (dateId: string, config: any, timestamp: string) => {
    const day = getDayData(dateId);
    const newCycle: Cycle = {
      id: crypto.randomUUID(),
      createdAt: timestamp,
      completed: false,
      totalProfit: 0,
      operations: [
        { id: crypto.randomUUID(), type: 'MAE', deposit: config.maeDeposit, withdraw: null, bau: config.maeBau, profit: 0 },
        { id: crypto.randomUUID(), type: 'FILHA', deposit: config.filhaDeposit, withdraw: null, profit: 0 }
      ]
    };
    const newHistory = { ...data.history, [dateId]: { ...day, cycles: [newCycle, ...day.cycles] } };
    setData(prev => ({ ...prev, history: newHistory }));
    persistData({ history: newHistory });
  };

  const updateOperation = (dateId: string, cycleId: string, opId: string, updates: Partial<Operation>) => {
    const day = getDayData(dateId);
    const newCycles = day.cycles.map(c => {
      if (c.id !== cycleId) return c;
      const updatedOps = c.operations.map(o => {
        if (o.id !== opId) return o;
        const op = { ...o, ...updates };
        op.profit = calculateOperationProfit(op.deposit, op.withdraw, op.type === 'MAE', op.bau);
        return op;
      }) as [Operation, Operation];
      return { 
        ...c, 
        operations: updatedOps, 
        completed: updatedOps.every(o => o.withdraw !== null),
        totalProfit: calculateCycleProfit(updatedOps[0].profit, updatedOps[1].profit)
      };
    });

    const profit = newCycles.reduce((acc, c) => acc + c.totalProfit, 0);
    const newHistory = {
      ...data.history,
      [dateId]: { 
        ...day, 
        cycles: newCycles, 
        dailyProfit: profit,
        goalReached: profit >= data.settings.dailyGoal && data.settings.dailyGoal > 0,
        stopLossReached: profit <= -data.settings.stopLoss && data.settings.stopLoss > 0
      }
    };
    setData(prev => ({ ...prev, history: newHistory }));
    persistData({ history: newHistory });
  };

  const deleteCycle = (dateId: string, id: string) => {
    const day = getDayData(dateId);
    const cycles = day.cycles.filter(c => c.id !== id);
    const profit = cycles.reduce((acc, c) => acc + c.totalProfit, 0);
    const newHistory = { ...data.history, [dateId]: { ...day, cycles, dailyProfit: profit } };
    setData(prev => ({ ...prev, history: newHistory }));
    persistData({ history: newHistory });
  };

  // --- FUNÇÕES DE CHAT COM PERSISTÊNCIA CORRIGIDA ---

  const addChatMessage = (text: string, category: string) => {
    const msg: ChatMessage = { 
      id: crypto.randomUUID(), 
      text, 
      category: category as any, 
      createdAt: new Date().toISOString() 
    };
    
    setData(prev => {
      const newList = [...(prev.chatMessages || []), msg];
      // Side effect fora do setter para garantir consistência
      persistData({ chatMessages: newList });
      return { ...prev, chatMessages: newList };
    });
  };

  const updateChatMessage = (id: string, text: string) => {
    setData(prev => {
      const newList = (prev.chatMessages || []).map(m => m.id === id ? { ...m, text } : m);
      persistData({ chatMessages: newList });
      return { ...prev, chatMessages: newList };
    });
  };

  const deleteChatMessage = (id: string) => {
    setData(prev => {
      const newList = (prev.chatMessages || []).filter(m => m.id !== id);
      persistData({ chatMessages: newList });
      return { ...prev, chatMessages: newList };
    });
  };

  const clearChatMessages = () => {
    setData(prev => {
      persistData({ chatMessages: [] });
      return { ...prev, chatMessages: [] };
    });
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