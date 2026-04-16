"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';

interface ThinkingPresenceProps {
  isVisible: boolean;
}

export const ThinkingPresence: React.FC<ThinkingPresenceProps> = ({ isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed top-6 right-6 z-[100] pointer-events-none"
        >
          <GlassPanel className="p-3 flex items-center gap-3 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-emerald-500 blur-lg rounded-full"
              />
              <div className="relative bg-black/40 p-2 rounded-lg border border-white/10">
                <motion.div
                  animate={{
                    color: ['#8b5cf6', '#10b981', '#8b5cf6'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <Brain size={20} />
                </motion.div>
              </div>
            </div>
            
            <div className="pr-2">
              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Hermes Operando</h4>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[8px] text-emerald-400 font-bold uppercase">Raciocínio Ativo</span>
                <motion.span 
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-1 h-1 rounded-full bg-emerald-500"
                />
              </div>
            </div>
          </GlassPanel>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
