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
    showSuccess('Copiado!');
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
    showSuccess('Atualizado!');
  };

  const handleDelete = (id: string) => {
    onDeleteMessage(id);
    setActiveMessage(null);
    showSuccess('Excluído.');
  };

  const handleConfirmClear = () => {
    onClearChat();
    setShowClearConfirm(false);
    showSuccess('Tudo apagado.');
  };

  return (
    <div className="flex flex-col h-[70dvh] sm:h-[600px] liquid-glass border-none rounded-t-[40px] sm:rounded-[40px] overflow-hidden shadow-2xl">
      
      {/* Header do Chat */}
      <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
            <MessageSquare size={20} strokeWidth={2.5} />
          </div>
          <h3 className="font-black text-base text-zinc-900 dark:text-zinc-100 tracking-tight uppercase">Anotações</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button 
              onClick={() => setShowClearConfirm(true)}
              className="h-9 w-9 flex items-center justify-center rounded-2xl text-zinc-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all active:scale-90"
            >
              <Trash2 size={18} />
            </button>
          )}
          {onClose && (
            <button 
              onClick={onClose}
              className="h-9 w-9 flex items-center justify-center rounded-2xl text-zinc-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all active:scale-90"
            >
              <X size={22} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-transparent">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-[24px] bg-black/5 dark:bg-white/5 flex items-center justify-center text-zinc-300 dark:text-zinc-700 mb-4">
              <MessageSquare size={28} />
            </div>
            <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">Nenhuma anotação.</p>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-2 max-w-[220px]">Suas estratégias e observações aparecem aqui.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-end"
              >
                <button
                  onClick={() => setActiveMessage(msg)}
                  className="max-w-[90%] text-left bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-black/5 dark:border-white/5 rounded-[24px] rounded-tr-lg p-4 shadow-xl shadow-black/[0.03] active:scale-[0.97] transition-all focus:outline-none"
                >
                  <p className="text-[13px] sm:text-[14px] font-bold text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap break-words leading-relaxed">
                    {msg.text}
                  </p>
                  <div className="flex justify-end mt-2">
                    <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                      {format(parseISO(msg.createdAt), 'HH:mm')}
                      {msg.updatedAt && ' • EDITADO'}
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
        className="p-5 border-t border-black/5 dark:border-white/5 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl shrink-0"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)' }}
      >
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escreva algo..."
            className="flex-1 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-2xl px-5 py-3.5 text-sm font-bold text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-all"
          />
          <Button
            type="submit"
            size="icon"
            className="h-12 w-12 rounded-2xl bg-zinc-900 dark:bg-zinc-100 hover:opacity-90 text-white dark:text-zinc-900 shrink-0 shadow-2xl shadow-black/10 active:scale-90 transition-all"
          >
            <Send size={18} strokeWidth={2.5} />
          </Button>
        </form>
      </div>

      {/* DIALOG DE AÇÕES DA MENSAGEM */}
      <Dialog open={!!activeMessage} onOpenChange={(open) => { if (!open) { setActiveMessage(null); setIsEditing(false); } }}>
        <DialogContent className="liquid-glass border-none sm:max-w-xs w-[90vw] rounded-[32px] p-6 text-center outline-none">
          <DialogTitle className="sr-only">Opções</DialogTitle>
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div key="edit" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
                <div className="flex justify-between items-center px-1">
                  <h4 className="text-base font-black text-zinc-900 dark:text-zinc-100 tracking-tight uppercase">Editar</h4>
                  <button onClick={() => setIsEditing(false)} className="text-zinc-400 hover:text-zinc-900"><X size={20} /></button>
                </div>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-[20px] p-4 text-sm font-bold text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-400 resize-none h-32"
                />
                <Button onClick={handleSaveEdit} className="w-full h-14 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black shadow-xl">SALVAR</Button>
              </motion.div>
            ) : (
              <motion.div key="menu" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-2">
                <div className="flex justify-between items-center mb-4 px-1">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Ações</span>
                  <button onClick={() => setActiveMessage(null)} className="text-zinc-400 hover:text-zinc-900"><X size={20} /></button>
                </div>
                <button onClick={() => activeMessage && handleCopy(activeMessage.text)} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-black/5 dark:bg-white/5 text-zinc-800 dark:text-zinc-200 hover:bg-black/10 dark:hover:bg-white/10 text-sm font-bold transition-all"><Copy size={18} /> Copiar</button>
                <button onClick={() => activeMessage && handleStartEdit(activeMessage)} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-black/5 dark:bg-white/5 text-zinc-800 dark:text-zinc-200 hover:bg-black/10 dark:hover:bg-white/10 text-sm font-bold transition-all"><Edit2 size={18} /> Editar</button>
                <div className="h-px bg-black/5 dark:bg-white/5 my-2" />
                <button onClick={() => activeMessage && handleDelete(activeMessage.id)} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-sm font-bold transition-all"><Trash2 size={18} /> Excluir</button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* CONFIRMAÇÃO CLEAR ALL */}
      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent className="liquid-glass border-none sm:max-w-xs w-[90vw] rounded-[32px] p-8 text-center outline-none">
          <div className="mx-auto w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center mb-5"><AlertTriangle className="text-rose-500" size={28} /></div>
          <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 uppercase tracking-tight">Apagar tudo?</DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400 text-sm mb-8 leading-relaxed">Você perderá <strong>todas as suas anotações</strong> permanentemente.</DialogDescription>
          <div className="flex gap-3">
            <Button onClick={() => setShowClearConfirm(false)} variant="outline" className="flex-1 rounded-2xl h-12 bg-black/5 dark:bg-white/5 border-none font-bold">CANCELAR</Button>
            <Button onClick={handleConfirmClear} className="flex-1 rounded-2xl h-12 bg-rose-500 text-white font-bold shadow-xl shadow-rose-500/20">APAGAR</Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}