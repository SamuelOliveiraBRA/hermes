"use client";

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Cpu, Terminal, Database, Code, Trash2, Sparkles } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { Thought, HermesAction, Message } from '../../hooks/useHermes';

interface HermesChatProps {
  messages: Message[];
  thoughts: Thought[];
  actions: HermesAction[];
  isThinking: boolean;
  onClear: () => void;
}

export const HermesChat = ({ messages, thoughts, actions, isThinking, onClear }: HermesChatProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thoughts]);

  return (
    <div className="col-span-8 row-span-12 flex flex-col gap-4 pt-12 h-full overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-600/20 rounded-xl border border-violet-500/30">
            <Cpu className="text-violet-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tighter text-white uppercase italic">Sovereign Chat</h2>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Hermes Local Protocol \u2022 v9.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
            <button 
              onClick={onClear}
              className="p-2 hover:bg-white/5 rounded-lg text-white/20 hover:text-red-400 transition-all flex items-center gap-2 text-[10px] font-bold uppercase"
            >
              <Trash2 size={14} />
              Limpar
            </button>
            <div className={`px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold text-white/40 flex items-center gap-2`}>
              <motion.div 
                animate={isThinking ? { scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-1.5 h-1.5 rounded-full ${isThinking ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]' : 'bg-white/20'}`} 
              />
              {isThinking ? 'HERMES PENSANDO' : 'PRONTO'}
            </div>
        </div>
      </div>

      <GlassPanel className="flex-1 flex flex-col p-0 overflow-hidden border-white/5 group relative bg-black/20">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 via-transparent to-transparent pointer-events-none" />
        
        {/* Área de Diálogo */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div 
                key="empty-chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30"
              >
                <Sparkles size={40} className="text-violet-500" />
                <p className="text-sm font-medium tracking-wide">
                  Conexão Soberana Estabelecida.<br/>
                  <span className="text-[10px] uppercase font-black text-violet-400">Inicie o diálogo com o Agente Hermes.</span>
                </p>
              </motion.div>
            ) : (
              messages.map((msg, i) => (
                <motion.div 
                  key={`msg-${i}-${msg.timestamp}`}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 ${msg.role === 'user' ? 'bg-white/10 border-white/10' : 'bg-violet-600/20 border-violet-500/40 text-violet-400 font-black italic'}`}>
                      {msg.role === 'user' ? <User size={14} /> : 'H'}
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <div className={`p-4 rounded-2xl shadow-xl ${
                        msg.role === 'user' 
                        ? 'bg-white/5 border border-white/10 text-white rounded-tr-none' 
                        : 'bg-violet-600/10 border border-violet-500/20 text-violet-50 shadow-violet-500/5 rounded-tl-none'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest px-2">
                        {msg.role === 'user' ? 'Você' : 'Hermes'} • {msg.timestamp}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}

            {/* Pensamento em tempo real */}
            {isThinking && thoughts.length > 0 && (
              <motion.div 
                key="thinking-indicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 text-white/20 px-4"
              >
                 <div className="animate-spin w-3 h-3 border border-white/20 border-t-white rounded-full" />
                 <span className="text-[9px] font-mono italic">{thoughts[thoughts.length - 1].message}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pegadas Digitais (Atividade Técnica) */}
        <div className="h-[100px] bg-black/40 border-t border-white/5 p-4 overflow-y-auto scrollbar-hide shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
               <Code size={12} className="text-violet-400" />
               <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Processamento do Agente</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {actions.map((action, i) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={`action-${i}-${action.time}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5"
              >
                 <div className="w-1.5 h-1.5 rounded-full bg-violet-500/50" />
                 <span className="text-[9px] font-bold text-white/40">{action.label}: </span>
                 <span className="text-[9px] font-black text-violet-500/60 uppercase">{action.action}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </GlassPanel>
    </div>
  );
};
