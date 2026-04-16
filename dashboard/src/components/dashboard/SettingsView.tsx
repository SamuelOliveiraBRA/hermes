"use client";

import React from 'react';
import { Shield, Cpu, RefreshCw, Lock } from 'lucide-react';

export const SettingsView = () => {
  const guidelines = [
    { icon: Shield, title: "Soberania Local", desc: "Operação 100% isolada no Mac Mini M4." },
    { icon: RefreshCw, title: "Auto-Evolução", desc: "Permissão para refatorar UI/UX e expandir skills." },
    { icon: Lock, title: "Protocolo de Backup", desc: "Criação obrigatória de snapshots antes de edições." },
    { icon: Cpu, title: "Otimização M4", desc: "Prioridade para processos nativos e eficientes." }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-4 border-b border-white/10 pb-4">
        <h3 className="text-xs font-black text-violet-400 uppercase tracking-[0.3em]">Córtex de Configuração</h3>
        <p className="text-[10px] text-white/30 mt-1 uppercase">Governança Hermes 0.0.7</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {guidelines.map((item, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-violet-500/20 transition-all group">
            <div className="p-3 bg-violet-500/10 rounded-xl group-hover:bg-violet-500/20 transition-colors">
              <item.icon size={18} className="text-violet-400" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-white tracking-wide">{item.title}</div>
              <div className="text-[10px] text-white/40 mt-0.5">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 rounded-2xl border border-dashed border-white/10 bg-black/20">
        <div className="flex items-center gap-2 mb-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
          Status das Diretrizes
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-white/40">Integridade de Código</span>
            <span className="text-emerald-500 font-bold uppercase">Verificado</span>
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-white/40">Consciência de Hardware</span>
            <span className="text-emerald-500 font-bold uppercase">Ativo</span>
          </div>
        </div>
      </div>
    </div>
  );
};
