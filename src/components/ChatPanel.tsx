import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Button } from './ui/button';
import { Send, Copy, Edit2, Trash2, Check, X, MessageSquare, Bookmark, Target, Zap } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { showSuccess } from '../utils/toast';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, category: 'sinal' | 'meta' | 'anotacao' | 'geral') => void;
  onUpdateMessage: (id: string, text: string) => void;
  onDeleteMessage: (id: string) => void;
}

export function ChatPanel({ messages = [], onSendMessage, onUpdateMessage, onDeleteMessage }: ChatPanelProps) {
  const [inputText, setInputText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'sinal' | 'meta' | 'anotacao' | 'geral'>('geral');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Rola para o final sempre que uma nova mensagem chega
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(inputText.trim(), selectedCategory);
    setInputText('');
    setSelectedCategory('geral'); // Reseta para geral após enviar
  };

  const handleStartEdit = (msg: ChatMessage) => {
    setEditingId(msg.id);
    setEditText(msg.text);
  };

  const handleSaveEdit = (id: string) => {
    if (!editText.trim()) return;
    onUpdateMessage(id, editText.trim());
    setEditingId(null);
    setEditText('');
    showSuccess('Mensagem editada!');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess('Copiado para a área de transferência!');
  };

  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case 'sinal':
        return {
          label: 'Sinal ⚡',
          classes: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
          icon: <Zap size={10} />
        };
      case 'meta':
        return {
          label: 'Meta 🎯',
          classes: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
          icon: <Target size={10} />
        };
      case 'anotacao':
        return {
          label: 'Nota 📝',
          classes: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          icon: <Bookmark size={10} />
        };
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] lg:h-[calc(100vh-140px)] bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-[28px] overflow-hidden shadow-sm">
      
      {/* Header do Chat */}
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/30 dark:bg-zinc-800/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
            <MessageSquare size={16} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 tracking-tight">Anotações & Sinais</h3>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Guarde estratégias, copie sinais e registre insights</p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
          {messages.length} msg
        </span>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar bg-zinc-50/30 dark:bg-zinc-950/10">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-400 mb-3">
              <MessageSquare size={20} />
            </div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Nenhuma anotação ainda.</p>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 max-w-[200px] mt-1">Envie sinais de trade, metas ou anotações diárias para consultar quando quiser.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const badge = getCategoryBadge(msg.category);
              const isEditing = editingId === msg.id;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-end group"
                >
                  {/* Balão de Mensagem */}
                  <div className="max-w-[85%] bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/60 rounded-[20px] rounded-tr-sm p-3.5 shadow-sm relative">
                    
                    {/* Categoria / Badge */}
                    {badge && (
                      <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-wider mb-2 ${badge.classes}`}>
                        {badge.icon}
                        {badge.label}
                      </div>
                    )}

                    {/* Texto ou Input de Edição */}
                    {isEditing ? (
                      <div className="space-y-2 min-w-[200px]">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 text-xs font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500 resize-none h-16"
                        />
                        <div className="flex justify-end gap-1.5">
                          <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} className="h-7 w-7 rounded-full text-zinc-400 hover:text-rose-500">
                            <X size={14} />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleSaveEdit(msg.id)} className="h-7 w-7 rounded-full text-zinc-400 hover:text-emerald-500">
                            <Check size={14} />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs sm:text-[13px] font-medium text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap break-words leading-relaxed">
                        {msg.text}
                      </p>
                    )}

                    {/* Rodapé do Balão (Hora + Ações) */}
                    <div className="flex items-center justify-between gap-4 mt-2.5 pt-1.5 border-t border-zinc-100/50 dark:border-zinc-800/30">
                      <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500">
                        {format(parseISO(msg.createdAt), 'HH:mm')}
                        {msg.updatedAt && ' (editado)'}
                      </span>

                      {/* Ações Rápidas */}
                      {!isEditing && (
                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleCopy(msg.text)}
                            className="p-1 text-zinc-400 hover:text-blue-500 transition-colors"
                            title="Copiar Mensagem"
                          >
                            <Copy size={11} />
                          </button>
                          <button
                            onClick={() => handleStartEdit(msg)}
                            className="p-1 text-zinc-400 hover:text-amber-500 transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={11} />
                          </button>
                          <button
                            onClick={() => onDeleteMessage(msg.id)}
                            className="p-1 text-zinc-400 hover:text-rose-500 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Barra de Digitação */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 shrink-0">
        
        {/* Seleção de Categoria */}
        <div className="flex gap-1.5 mb-2.5 overflow-x-auto no-scrollbar pb-1">
          {(['geral', 'sinal', 'meta', 'anotacao'] as const).map((cat) => {
            const isActive = selectedCategory === cat;
            let style = 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400';
            if (isActive) {
              if (cat === 'sinal') style = 'bg-amber-500 text-white shadow-sm';
              else if (cat === 'meta') style = 'bg-emerald-500 text-white shadow-sm';
              else if (cat === 'anotacao') style = 'bg-blue-500 text-white shadow-sm';
              else style = 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm';
            }

            const labels = { geral: 'Geral 💬', sinal: 'Sinal ⚡', meta: 'Meta 🎯', anotacao: 'Nota 📝' };

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shrink-0 ${style}`}
              >
                {labels[cat]}
              </button>
            );
          })}
        </div>

        {/* Input e Botão de Enviar */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Digite sua anotação ou cole um sinal..."
            className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
          />
          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shrink-0 shadow-sm"
          >
            <Send size={14} />
          </Button>
        </form>
      </div>

    </div>
  );
}