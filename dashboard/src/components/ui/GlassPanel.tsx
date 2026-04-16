"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { DESIGN_TOKENS } from '../../lib/design-system';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const GlassPanel = ({ children, className = "", title }: GlassPanelProps) => (
  <motion.div 
    initial={DESIGN_TOKENS.animations.variants.fadeInUp.initial}
    animate={DESIGN_TOKENS.animations.variants.fadeInUp.animate}
    whileHover={{ 
      borderColor: DESIGN_TOKENS.colors.primary.glow, 
      backgroundColor: "rgba(255, 255, 255, 0.05)" 
    }}
    className={`relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 transition-colors ${className}`}
  >
    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
    {title && (
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{title}</h3>
        <div className="flex space-x-1">
          <div className="w-1 h-1 rounded-full bg-violet-500/40" />
          <div className="w-1 h-1 rounded-full bg-violet-500/20" />
        </div>
      </div>
    )}
    {children}
  </motion.div>
);
