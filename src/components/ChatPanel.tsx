"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Button } from './ui/button';
import { Send, Copy, Edit2, Trash2, X, MessageSquare, Check, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { showSuccess } from '../utils/toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, category: 'sinal' | 'meta' | 'anotacao' | 'geral') => void;
  onUpdateMessage: (id: string, text: string) => void;
  onDeleteMessage: (id: string) => void;
  onClearChat: () => void;
  onClose?: () => void;
}

export function ChatPanel({ messages = [], onSendMessage, onUpdateMessage, onDeleteMessage, onClearChat, onClose }: ChatPanelProps) {
  const [inputText, setInputText] = useState('');
  const [activeMessage, setActiveMessage] = useState<ChatMessage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(inputText.trim(), 'geral');
    setInputText('');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess('Copiado para a área de transferência!');
    setActiveMessage(null);
  };

  const handleStartEdit = (msg: ChatMessage) => {
    setIsEditing(true);
    setEditText(msg.text);
  };

  const handleSaveEdit = () => {
    if (!editText.trim() || !activeMessage) return;
    onUpdateMessage(activeMessage.id, editText.trim());
    setIsEditing(false);
    setActiveMessage(null);
    showSuccess('Mensagem atualizada!');
  };

  const handleDelete = (id: string) => {
    onDeleteMessage(id);
    setActiveMessage(null);
    showSuccess('Mensagem excluída.');
  };

  const handleConfirmClear = () => {
    onClearChat();
    setShowClearConfirm(false);
    showSuccess('Todas as anotações foram apagadas.');
  };

  return (
    <div className="flex flex-col h-[60dvh] sm:h-[500px] liquid-glass-panel rounded-t-[32px] sm:rounded-[28px] overflow-hidden shadow-2xl border-white/20">
      
      {/* Header do Chat */}
      <div className="px-5 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-zinc-900 dark:text-zinc-100 border border-white/10">
            <MessageSquare size={16} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 tracking-tight">Anotações</h3>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          {messages.length > 0 && (
            <button 
              onClick={() => setShowClearConfirm(true)}
              className="h-8 w-8 flex items-center justify-center rounded-full text-zinc-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
          {onClose && (
            <button 
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 dark:text-zinc-500 mb-3 border border-white/5">
              <MessageSquare size={20} />
            </div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Nenhuma anotação ainda.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-end"
              >
                <button
                  onClick={() => setActiveMessage(msg)}
                  className="max-w-[85%] text-left liquid-glass-card border-white/10 rounded-[20px] rounded-tr-sm p-3.5 shadow-sm active:scale-[0.98] transition-transform focus:outline-none"
                >
                  <p className="text-xs sm:text-[13px] font-medium text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap break-words leading-relaxed">
                    {msg.text}
                  </p>
                  <div className="flex justify-end mt-1.5">
                    <span className="text-[8px] font-bold text-zinc-400/70 uppercase">
                      {format(parseISO(msg.createdAt), 'HH:mm')}
                    </span>
                  </div>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Barra de Digitação */}
      <div 
        className="p-3 border-t border-white/10 bg-white/5 shrink-0"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
      >
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Digite sua anotação..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-white/20 transition-colors"
          />
          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 rounded-xl bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 shrink-0 shadow-lg border-white/10"
          >
            <Send size={14} />
          </Button>
        </form>
      </div>

      <Dialog open={!!activeMessage} onOpenChange={(open) => {
        if (!open) {
          setActiveMessage(null);
          setIsEditing(false);
        }
      }}>
        <DialogContent className="sm:max-w-xs w-[90vw] rounded-[24px] p-5 liquid-glass-panel border-white/20 shadow-2xl [&>button]:hidden outline-none">
          <DialogTitle className="sr-only">Opções da Mensagem</DialogTitle>
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Editar</h4>
                  <button onClick={() => setIsEditing(false)} className="text-zinc-400 hover:text-zinc-600"><X size={16} /></button>
                </div>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-zinc-900 dark:text-zinc-100 outline-none resize-none h-24"
                />
                <Button onClick={handleSaveEdit} className="w-full h-11 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold">Salvar</Button>
              </motion.div>
            ) : (
              <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
                <div className="flex justify-between items-center mb-3 px-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Ações</span>
                  <button onClick={() => setActiveMessage(null)} className="text-zinc-400"><X size={16} /></button>
                </div>
                <button onClick={() => activeMessage && handleCopy(activeMessage.text)} className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-white/10 text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100"><Copy size={16} /> Copiar Texto</button>
                <button onClick={() => activeMessage && handleStartEdit(activeMessage)} className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-white/10 text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100"><Edit2 size={16} /> Editar</button>
                <div className="h-[1px] bg-white/5 my-1" />
                <button onClick={() => activeMessage && handleDelete(activeMessage.id)} className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-rose-500/10 text-rose-500 text-xs sm:text-sm font-bold"><Trash2 size={16} /> Excluir</button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
}