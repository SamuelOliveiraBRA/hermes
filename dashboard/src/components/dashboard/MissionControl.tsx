"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ChevronRight, Zap, Trash2, User, Sparkles, Code } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { Message, HermesAction, Thought } from '../../hooks/useHermes';

interface MissionControlProps {
  command: string;
  setCommand: (val: string) => void;
  startMission: () => void;
  isStarting: boolean;
  statusMessage: string;
  messages: Message[];
  thoughts: Thought[];
  actions: HermesAction[];
  onClear: () => void;
  isThinking: boolean;
}

export const MissionControl = ({ 
  command, 
  setCommand, 
  startMission, 
  isStarting, 
  statusMessage,
  messages,
  thoughts,
  actions,
  onClear,
  isThinking
}: MissionControlProps) => {
  const [thinkingTime, setThinkingTime] = React.useState(0);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Timer de Raciocínio
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isThinking) {
      const startTime = Date.now();
      interval = setInterval(() => {
        setThinkingTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      setThinkingTime(0);
    }
    return () => clearInterval(interval);
  }, [isThinking]);

  // Auto-scroll
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thoughts]);

  return (
    <GlassPanel className="col-span-4 row-span-12 flex flex-col p-0 border-violet-500/10 h-full overflow-hidden bg-black/40">
      {/* Header do Chat */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${isThinking ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-violet-500'}`} />
           <span className="text-[12px] font-black uppercase tracking-widest text-white/60">Cérebro Hermes</span>
        </div>
        <button 
          onClick={onClear}
          className="p-1.5 hover:bg-white/5 rounded-lg text-white/20 hover:text-red-400 transition-all"
          title="Limpar Conversa"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Área de Mensagens (Persistente) */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth scrollbar-hide">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-10">
            <Sparkles size={24} className="text-violet-500 mb-2" />
            <p className="text-[11px] uppercase font-bold tracking-widest">Aguardando Ordens...</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <motion.div 
              key={`side-msg-${i}-${msg.timestamp}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-[90%] p-3 rounded-xl border text-[13px] leading-relaxed ${
                msg.role === 'user' 
                ? 'bg-white/5 border-white/10 text-white/80 rounded-tr-none' 
                : 'bg-violet-600/10 border-violet-500/20 text-violet-100 rounded-tl-none shadow-sm'
              }`}>
                {msg.content}
              </div>
              <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1 px-1">
                {msg.role === 'user' ? 'Você' : 'Hermes'}
              </span>
            </motion.div>
          ))
        )}

        {/* Indicador de Digitação (Estilo WhatsApp/Hermes) */}
        {isThinking && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            className="flex flex-col items-start"
          >
            <div className="bg-violet-600/10 border border-violet-500/20 p-3 rounded-xl rounded-tl-none flex gap-1 items-center shadow-sm">
              {[0, 1, 2].map((dot) => (
                <motion.div
                  key={dot}
                  animate={{ 
                    y: [0, -4, 0],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: dot * 0.2
                  }}
                  className="w-1.5 h-1.5 bg-violet-400 rounded-full"
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-1 px-1">
              <span className="text-[9px] font-bold text-violet-400/40 uppercase tracking-widest">
                Hermes está raciocinando...
              </span>
              <span className="text-[9px] font-mono font-bold text-violet-500/60 bg-violet-500/5 px-1.5 rounded tabular-nums">
                {thinkingTime}s
              </span>
            </div>
          </motion.div>
        )}

        {/* Pensamento em tempo real (Mini) */}
        {isThinking && thoughts.length > 0 && (
          <motion.div 
            key="side-thinking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-white/20 px-1"
          >
             <div className="animate-spin w-2 h-2 border border-white/20 border-t-violet-500 rounded-full" />
             <span className="text-[10px] font-mono italic text-white/40 break-all">
               {thoughts[thoughts.length - 1].message}
             </span>
          </motion.div>
        )}
      </div>

      {/* Atividade Técnica (Compacta) */}
      {actions.length > 0 && (
        <div className="px-4 py-2 border-t border-white/5 bg-black/20 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <div className="flex gap-2">
            {actions.slice(-3).map((action, i) => (
              <div key={`side-act-${i}`} className="flex items-center gap-1.5 opacity-40">
                 <div className="w-1 h-1 rounded-full bg-violet-500" />
                 <span className="text-[9px] font-bold uppercase tracking-widest text-white">{action.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input de Comando (Rodapé) */}
      <div className="p-4 border-t border-white/5 bg-white/5 backdrop-blur-md">
        <div className="relative group">
          <textarea 
            rows={1}
            value={command}
            onChange={(e) => {
              setCommand(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                startMission();
              }
            }}
            placeholder="Dite a missão..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 transition-all resize-none max-h-24 scrollbar-hide font-medium"
          />
          <button 
            onClick={startMission}
            disabled={isStarting}
            className="absolute right-2 bottom-2.5 p-1.5 text-violet-500/50 hover:text-violet-400 disabled:opacity-30 transition-all"
          >
            <Zap size={14} className={isStarting ? "animate-pulse" : ""} fill="currentColor" />
          </button>
        </div>
        <p className="text-[8px] text-white/10 uppercase font-black tracking-[0.2em] text-center mt-3">
          Sovereign Control Protocol v11.1
        </p>
      </div>
    </GlassPanel>
  );
};
