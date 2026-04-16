"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Cpu } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';

interface SystemHealthProps {
  telemetry: { cpu: string; ram: number };
  isActive: boolean;
}

export const SystemHealth = ({ telemetry, isActive }: SystemHealthProps) => {
  return (
    <GlassPanel title="Saúde Central do Sistema" className="col-span-4 row-span-7 overflow-hidden">
      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 relative group overflow-hidden">
          <div className="absolute inset-0 bg-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-[10px] text-white/30 font-bold mb-1 uppercase tracking-tighter">Carga de CPU</div>
          <div className="text-2xl font-bold text-white tabular-nums tracking-tighter">{telemetry.cpu}</div>
          <div className="h-1 w-full bg-white/5 mt-4 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(parseFloat(telemetry.cpu) * 10, 100)}%` }}
              className="h-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]" 
            />
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 relative group overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-[10px] text-white/30 font-bold mb-1 uppercase tracking-tighter">Uso de RAM</div>
          <div className="text-2xl font-bold text-white tabular-nums tracking-tighter">{telemetry.ram}%</div>
          <div className="h-1 w-full bg-white/5 mt-4 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${telemetry.ram}%` }}
              className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
            />
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex items-center justify-center relative scale-110">
        <div className={`absolute w-32 h-32 ${isActive ? 'bg-emerald-500/10' : 'bg-violet-600/10'} rounded-full blur-3xl animate-pulse transition-colors`} />
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="relative w-28 h-28 border border-dashed border-white/10 rounded-full flex items-center justify-center"
        >
          <div className="w-24 h-24 border border-violet-500/20 rounded-full flex items-center justify-center animate-pulse">
            <Cpu className={isActive ? 'text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-violet-500'} size={32} />
          </div>
        </motion.div>
        <div className="absolute text-[8px] font-bold text-white/40 tracking-[0.4em] uppercase mt-36 text-center leading-relaxed whitespace-nowrap">
          Integração Hermes Soberano<br/>
          <span className="text-violet-500/50">Núcleo Soberano Ativo</span>
        </div>
      </div>
    </GlassPanel>
  );
};
