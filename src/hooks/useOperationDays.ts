import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../components/AuthProvider';
import { AppData, OperationDay, Cycle, Operation, ChatMessage } from '../types';
import { format } from 'date-fns';

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
            chatMessages: appData.chat_messages || [] // Carregando da nova coluna
          });
        } else {
          // Criar registro inicial se não existir
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

  // Salvar dados no Supabase (Debounced ou por ação)
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
      date: dateId,
      cycles: [],
      dailyProfit: 0,
      completed: false
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
      timestamp,
      completed: false,
      operations: [
        { id: crypto.randomUUID(), type: 'mae', deposit: config.maeDeposit, withdraw: config.maeWithdraw, bau: config.maeBau, completed: false, profit: 0 },
        { id: crypto.randomUUID(), type: 'filha', deposit: config.filhaDeposit, withdraw: config.filhaWithdraw, completed: false, profit: 0 }
      ]
    };

    const newHistory = {
      ...data.history,
      [dateId]: { ...day, cycles: [newCycle, ...day.cycles] }
    };

    const updated = { ...data, history: newHistory };
    setData(updated);
    persistData({ history: newHistory });
  };

  const updateOperation = (dateId: string, cycleId: string, operationId: string, updates: Partial<Operation>) => {
    const day = getDayData(dateId);
    const newCycles = day.cycles.map(c => {
      if (c.id !== cycleId) return c;
      const newOps = c.operations.map(o => o.id === operationId ? { ...o, ...updates } : o);
      const allCompleted = newOps.every(o => o.completed);
      return { ...c, operations: newOps, completed: allCompleted };
    });

    const dailyProfit = newCycles.reduce((acc, c) => 
      acc + c.operations.reduce((oAcc, o) => oAcc + (o.profit || 0), 0), 0
    );

    const newHistory = {
      ...data.history,
      [dateId]: { ...day, cycles: newCycles, dailyProfit }
    };

    const updated = { ...data, history: newHistory };
    setData(updated);
    persistData({ history: newHistory });
  };

  const deleteCycle = (dateId: string, cycleId: string) => {
    const day = getDayData(dateId);
    const newCycles = day.cycles.filter(c => c.id !== cycleId);
    const dailyProfit = newCycles.reduce((acc, c) => 
      acc + c.operations.reduce((oAcc, o) => oAcc + (o.profit || 0), 0), 0
    );

    const newHistory = {
      ...data.history,
      [dateId]: { ...day, cycles: newCycles, dailyProfit }
    };

    const updated = { ...data, history: newHistory };
    setData(updated);
    persistData({ history: newHistory });
  };

  // CHAT LOGIC
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