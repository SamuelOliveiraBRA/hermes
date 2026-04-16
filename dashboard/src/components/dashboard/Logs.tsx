"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '../ui/ProgressBar';
import { Thought, HermesAction } from '../../hooks/useHermes';
import { GlassPanel } from '../ui/GlassPanel';
import { Activity } from 'lucide-react';

interface BrainFeedProps {
  thoughts: Thought[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isProcessing: boolean;
  children?: React.ReactNode; 
}

export const BrainFeed = ({ thoughts, activeTab, setActiveTab, isProcessing, children }: BrainFeedProps) => (
  <div className="flex flex-col gap-4 h-full">
    <div className="flex gap-2">
      <button 
        onClick={() => setActiveTab('brain')}
        className={`px-4 py-2 rounded-full text-[12px] font-bold uppercase tracking-widest transition-all border ${activeTab === 'brain' ? 'bg-violet-500/20 border-violet-500/50 text-white' : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'}`}
      >
        Raciocínio Ativo
      </button>
      <button 
        onClick={() => setActiveTab('memory')}
        className={`px-4 py-2 rounded-full text-[12px] font-bold uppercase tracking-widest transition-all border ${activeTab === 'memory' ? 'bg-violet-500/20 border-violet-500/50 text-white' : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'}`}
      >
        Base de Conhecimento
      </button>
    </div>

    <GlassPanel className="flex-1 relative group !p-0 flex flex-col overflow-hidden">
      <div className="p-6 flex flex-col h-full overflow-hidden">
        <ProgressBar active={isProcessing} />
        
        {activeTab === 'brain' ? (
          <div className="font-mono text-sm space-y-2 text-violet-300/80 flex-1 overflow-y-auto pr-2 scrollbar-hide">
            <AnimatePresence>
              {[...thoughts].reverse().map((thought, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: -8 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  key={thoughts.length - i}
                  className="flex gap-3 leading-relaxed border-l border-violet-500/20 pl-4 py-1"
                >
                  <span className="text-white/20 select-none min-w-[70px] text-[12px]">[{thought.timestamp}]</span>
                  <span className="text-[14px]">{thought.message}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            {thoughts.length === 0 && (
              <div className="text-white/10 animate-pulse italic mt-4 text-xs">Aguardando ignição do sistema operacional...</div>
            )}
          </div>
        ) : (
          children
        )}
      </div>
      
      <div className="absolute top-4 right-6 text-[12px] text-emerald-500 flex items-center gap-1 font-bold">
        <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${thoughts.length > 0 ? 'animate-ping' : ''}`} />
        {thoughts.length > 0 ? 'HERMES EM OPERAÇÃO' : 'IDLE'}
      </div>
    </GlassPanel>
  </div>
);

interface DigitalFootprintsProps {
  actions: HermesAction[];
}

export const DigitalFootprints = ({ actions }: DigitalFootprintsProps) => (
  <GlassPanel title="Pegadas Digitais" className="h-full flex flex-col overflow-hidden">
    <div className="space-y-4 pt-2 flex-1 overflow-y-auto pr-2 scrollbar-hide pb-4">
      <AnimatePresence>
        {actions.map((item, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key={i} 
            className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-violet-500/30 transition-all cursor-default text-[13px]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-500/10 rounded-lg">
                <item.icon size={14} className="text-violet-400" />
              </div>
              <span className="font-semibold text-white/70 truncate max-w-[120px]">{item.label}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="px-2 py-0.5 bg-white/5 rounded text-white/40 uppercase font-bold tracking-tighter text-[10px]">{item.action}</span>
              <span className="text-white/20 tabular-nums text-[10px]">{item.time}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {actions.length === 0 && (
        <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl text-white/5 space-y-2">
          <Activity size={24} />
          <span className="text-[11px] uppercase tracking-widest text-center">Nenhuma atividade<br/>identificada no momento</span>
        </div>
      )}
    </div>
  </GlassPanel>
);
