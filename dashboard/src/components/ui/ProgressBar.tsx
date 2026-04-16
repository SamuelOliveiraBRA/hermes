"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { DESIGN_TOKENS } from '../../lib/design-system';

interface ProgressBarProps {
  active: boolean;
}

export const ProgressBar = ({ active }: ProgressBarProps) => (
  <div className="h-0.5 w-full bg-white/5 overflow-hidden rounded-full mb-6">
    <motion.div 
      initial={{ x: "-100%" }}
      animate={{ x: active ? "0%" : "-100%" }}
      transition={DESIGN_TOKENS.animations.transitions.flow}
      className="h-full w-full bg-gradient-to-r from-transparent via-violet-500 to-transparent shadow-[0_0_10px_rgba(139,92,246,0.5)]"
    />
  </div>
);
