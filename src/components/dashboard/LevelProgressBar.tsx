"use client";

import { motion } from "framer-motion";

interface LevelProgressBarProps {
  level: number;
  levelProgress: number;
  levelTitle: string;
}

export function LevelProgressBar({ level, levelProgress, levelTitle }: LevelProgressBarProps) {
  return (
    <div className="mt-8 space-y-2 max-w-sm">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
        <span className="text-primary-300">{levelTitle}</span>
        <span className="text-white/40">Nível {level} • {Math.round(levelProgress)}%</span>
      </div>
      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${levelProgress}%` }}
          className="h-full bg-gradient-to-r from-primary-400 to-accent-400"
        />
      </div>
    </div>
  );
}
