"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Terminal, PieChart, Database, Settings, Monitor, Coins, MessageSquare } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  return (
    <aside className="w-20 flex flex-col items-center py-8 gap-8 border border-white/10 rounded-2xl bg-black/40 backdrop-blur-xl relative h-full">
      <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-violet-500/5 to-transparent rounded-t-2xl pointer-events-none" />
      
      <div className="relative group">
        <div className="absolute inset-0 bg-violet-500 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
        <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-blue-700 flex flex-col items-center justify-center shadow-lg border border-white/10 group-active:scale-95 transition-transform">
          <Brain className="text-white" size={20} />
          <span className="text-[10px] font-black text-white/50 mt-1 uppercase tracking-tighter">0.0.7</span>
        </div>
      </div>

      <nav className="flex flex-col gap-6 relative z-10">
        <button 
          onClick={() => setActiveTab('brain')} 
          className={`group flex flex-col items-center gap-1 transition-all ${activeTab === 'brain' ? 'text-violet-400' : 'text-white/20 hover:text-white/40'}`}
        >
          <div className={`p-3 rounded-xl transition-all ${activeTab === 'brain' ? 'bg-white/5 shadow-[0_0_15px_rgba(139,92,246,0.1)] border border-white/10' : ''}`}>
            <MessageSquare size={20} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Inteligência</span>
          {activeTab === 'brain' && (
            <motion.div layoutId="activeTab" className="absolute left-[-10px] top-1/4 w-1 h-1/2 bg-violet-500 rounded-full" />
          )}
        </button>

        <button 
          onClick={() => setActiveTab('blockchain')} 
          className={`group flex flex-col items-center gap-1 transition-all ${activeTab === 'blockchain' ? 'text-violet-400' : 'text-white/20 hover:text-white/40'}`}
        >
          <div className={`p-3 rounded-xl transition-all ${activeTab === 'blockchain' ? 'bg-white/5 shadow-[0_0_15px_rgba(139,92,246,0.1)] border border-white/10' : ''}`}>
            <Coins size={20} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Scanner</span>
          {activeTab === 'blockchain' && (
            <motion.div layoutId="activeTab" className="absolute left-[-10px] top-1/4 w-1 h-1/2 bg-violet-500 rounded-full" />
          )}
        </button>

        <button 
          onClick={() => setActiveTab('memory')} 
          className={`group flex flex-col items-center gap-1 transition-all ${activeTab === 'memory' ? 'text-violet-400' : 'text-white/20 hover:text-white/40'}`}
        >
          <div className={`p-3 rounded-xl transition-all ${activeTab === 'memory' ? 'bg-white/5 shadow-[0_0_15px_rgba(139,92,246,0.1)] border border-white/10' : ''}`}>
            <Database size={20} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Memória</span>
          {activeTab === 'memory' && (
            <motion.div layoutId="activeTab" className="absolute left-[-10px] top-1/4 w-1 h-1/2 bg-violet-500 rounded-full" />
          )}
        </button>

        <button 
          onClick={() => setActiveTab('stats')} 
          className={`group flex flex-col items-center gap-1 transition-all ${activeTab === 'stats' ? 'text-violet-400' : 'text-white/20 hover:text-white/40'}`}
        >
          <div className={`p-3 rounded-xl transition-all ${activeTab === 'stats' ? 'bg-white/5 shadow-[0_0_15px_rgba(139,92,246,0.1)] border border-white/10' : ''}`}>
            <PieChart size={20} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Dados</span>
          {activeTab === 'stats' && (
            <motion.div layoutId="activeTab" className="absolute left-[-10px] top-1/4 w-1 h-1/2 bg-violet-500 rounded-full" />
          )}
        </button>

        <button 
          onClick={() => setActiveTab('network')} 
          className={`group flex flex-col items-center gap-1 transition-all ${activeTab === 'network' ? 'text-violet-400' : 'text-white/20 hover:text-white/40'}`}
        >
          <div className={`p-3 rounded-xl transition-all ${activeTab === 'network' ? 'bg-white/5 shadow-[0_0_15px_rgba(139,92,246,0.1)] border border-white/10' : ''}`}>
            <Monitor size={20} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Sistema</span>
          {activeTab === 'network' && (
            <motion.div layoutId="activeTab" className="absolute left-[-10px] top-1/4 w-1 h-1/2 bg-violet-500 rounded-full" />
          )}
        </button>
      </nav>

      <div className="mt-auto pb-6">
        <button 
          onClick={() => setActiveTab('settings')} 
          className={`group flex flex-col items-center gap-1 transition-all ${activeTab === 'settings' ? 'text-violet-400' : 'text-white/20 hover:text-white/40'}`}
        >
          <div className={`p-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-white/5 shadow-[0_0_15px_rgba(139,92,246,0.1)] border border-white/10' : ''}`}>
            <Settings size={20} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Ajustes</span>
          {activeTab === 'settings' && (
            <motion.div layoutId="activeTab" className="absolute left-[-10px] top-1/4 w-1 h-1/2 bg-violet-500 rounded-full" />
          )}
        </button>
      </div>
    </aside>
  );
};
