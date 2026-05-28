import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../components/AuthProvider';
import { AppData, OperationDay, Cycle, Operation, ChatMessage, AppSettings } from '../types';
import { calculateOperationProfit, calculateCycleProfit } from '../utils/calculations';

const DEFAULT_SETTINGS: AppSettings = {
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

  useEffect(() => {
    if (!user) return;
    
    let isMounted = true;
    
    const loadData = async () => {
      try {
        const { data: appData, error } = await supabase
          .from('app_data')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (isMounted && appData) {
          setData({
            settings: appData.settings || DEFAULT_SETTINGS,
            history: appData.history || {},
            chatMessages: appData.chat_messages || []
          });
        }
      } catch (err) {
        console.error("[useOperationDays] Erro de carregamento de dados:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [user]);

  const persistData = useCallback(async (updates: Partial<AppData>) => {
    if (!user) return;
    
    // Evita chamadas redundantes de upsert se não houver alterações
    const payload: Record<string, any> = {
      user_id: user.id,
      updated_at: new Date().toISOString()
    };
    
    if (updates.settings !== undefined) payload.settings = updates.settings;
    if (updates.history !== undefined) payload.history = updates.history;
    if (updates.chatMessages !== undefined) payload.chat_messages = updates.chatMessages;

    try {
      // O Supabase lida nativamente com upsert baseado na chave estrangeira primária user_id
      const { error } = await supabase
        .from('app_data')
        .upsert(payload, { onConflict: 'user_id' });
        
      if (error) throw error;
    } catch (err) {
      console.error("[useOperationDays] Erro de persistência remota:", err);
    }
  }, [user]);

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

  const updateSettings = useCallback((settings: AppSettings) => {
    setData(prev => {
      const nextData = { ...prev, settings };
      persistData({ settings });
      return nextData;
    });
  }, [persistData]);

  const addCycle = useCallback((dateId: string, config: { maeDeposit: number; filhaDeposit: number; maeBau: boolean }, timestamp: string) => {
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
    
    setData(prev => {
      const newHistory = { 
        ...prev.history, 
        [dateId]: { 
          ...day, 
          cycles: [newCycle, ...day.cycles] 
        } 
      };
      persistData({ history: newHistory });
      return { ...prev, history: newHistory };
    });
  }, [getDayData, persistData]);

  const updateOperation = useCallback((dateId: string, cycleId: string, opId: string, updates: Partial<Operation>) => {
    const day = getDayData(dateId);
    const newCycles = day.cycles.map(c => {
      if (c.id !== cycleId) return c;
      const updatedOps = c.operations.map(o => {
        if (o.id !== opId) return o;
        const op = { ...o, ...updates };
        const profit = calculateOperationProfit(op.deposit, op.withdraw, op.type === 'MAE', op.bau);
        return { ...op, profit };
      }) as unknown as [Operation, Operation];
      
      return { 
        ...c, 
        operations: updatedOps, 
        completed: updatedOps.every(o => o.withdraw !== null),
        totalProfit: calculateCycleProfit(updatedOps[0].profit, updatedOps[1].profit)
      };
    });

    const profit = newCycles.reduce((acc, c) => acc + c.totalProfit, 0);
    
    setData(prev => {
      const newHistory = {
        ...prev.history,
        [dateId]: { 
          ...day, 
          cycles: newCycles, 
          dailyProfit: profit,
          goalReached: prev.settings.dailyGoal > 0 && profit >= prev.settings.dailyGoal,
          stopLossReached: prev.settings.stopLoss > 0 && profit <= -prev.settings.stopLoss
        }
      };
      persistData({ history: newHistory });
      return { ...prev, history: newHistory };
    });
  }, [getDayData, persistData]);

  const deleteCycle = useCallback((dateId: string, id: string) => {
    const day = getDayData(dateId);
    const cycles = day.cycles.filter(c => c.id !== id);
    const profit = cycles.reduce((acc, c) => acc + c.totalProfit, 0);
    
    setData(prev => {
      const newHistory = { 
        ...prev.history, 
        [dateId]: { 
          ...day, 
          cycles, 
          dailyProfit: profit,
          goalReached: prev.settings.dailyGoal > 0 && profit >= prev.settings.dailyGoal,
          stopLossReached: prev.settings.stopLoss > 0 && profit <= -prev.settings.stopLoss
        } 
      };
      persistData({ history: newHistory });
      return { ...prev, history: newHistory };
    });
  }, [getDayData, persistData]);

  const addChatMessage = useCallback((text: string, category: string) => {
    const msg: ChatMessage = { 
      id: crypto.randomUUID(), 
      text, 
      category: category as any, 
      createdAt: new Date().toISOString() 
    };
    
    setData(prev => {
      const newList = [...(prev.chatMessages || []), msg];
      persistData({ chatMessages: newList });
      return { ...prev, chatMessages: newList };
    });
  }, [persistData]);

  const updateChatMessage = useCallback((id: string, text: string) => {
    setData(prev => {
      const newList = (prev.chatMessages || []).map(m => m.id === id ? { ...m, text } : m);
      persistData({ chatMessages: newList });
      return { ...prev, chatMessages: newList };
    });
  }, [persistData]);

  const deleteChatMessage = useCallback((id: string) => {
    setData(prev => {
      const newList = (prev.chatMessages || []).filter(m => m.id !== id);
      persistData({ chatMessages: newList });
      return { ...prev, chatMessages: newList };
    });
  }, [persistData]);

  const clearChatMessages = useCallback(() => {
    setData(prev => {
      persistData({ chatMessages: [] });
      return { ...prev, chatMessages: [] };
    });
  }, [persistData]);

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