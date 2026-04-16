"use client";

import React from 'react';

import { GlassPanel } from '../ui/GlassPanel';
import { Database, Clock } from 'lucide-react';

export const KnowledgeBase = () => {
  return (
    <GlassPanel title="Base de Conhecimento Cerebral" className="h-full flex flex-col overflow-hidden border-violet-500/10">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/10 backdrop-blur-sm group hover:border-violet-500/30 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Database size={12} className="text-violet-400" />
            <h4 className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Última Lição Aprendida</h4>
          </div>
          <p className="text-[15px] text-white/80 leading-relaxed font-medium italic">
            "Arquitetura Modular 0.0.7 implementada para suporte a auto-evolução autônoma e escalabilidade de componentes."
          </p>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[9px] text-white/20 uppercase tracking-widest">
              <Clock size={10} />
              <span>Registrado em: {new Date().toLocaleDateString()}</span>
            </div>
            <span className="text-[9px] px-2 py-0.5 bg-violet-500/10 rounded-full text-violet-400 font-bold">V11.7.1</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
           <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center space-y-1">
              <span className="text-white/20 text-[9px] uppercase font-black">Missões</span>
              <span className="text-xl font-mono font-bold text-white/60">42</span>
           </div>
           <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center space-y-1">
              <span className="text-white/20 text-[9px] uppercase font-black">Evoluções</span>
              <span className="text-xl font-mono font-bold text-white/60">0.0.7</span>
           </div>
        </div>

        <div className="text-[10px] text-white/5 text-center py-12 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center gap-2">
          <div className="animate-spin w-4 h-4 border border-white/10 border-t-violet-500/50 rounded-full" />
          <span className="uppercase tracking-[0.2em] font-bold">Consultando banco SQLite cerebral...</span>
        </div>
      </div>
    </GlassPanel>
  );
};
