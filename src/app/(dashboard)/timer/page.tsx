"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Coffee, BookOpen, Trophy, Zap, Sparkles } from "lucide-react";
import { addXP, saveFocusSession } from "@/actions/gamification";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function TimerPage() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"work" | "break">("work");
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  useEffect(() => {
    let interval: any = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          handleTimerEnd();
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  const handleTimerEnd = async () => {
    setIsActive(false);
    if (mode === "work") {
      setSessionsCompleted(prev => prev + 1);
      try {
        await saveFocusSession(25);
      } catch (e) {
        console.error("Erro ao salvar sessão de foco:", e);
      }
      setMode("break");
      setMinutes(5);
    } else {
      setMode("work");
      setMinutes(25);
    }
    setSeconds(0);
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setMode("work");
    setMinutes(25);
    setSeconds(0);
  };

  const progress = mode === "work" ? 
    ((25 * 60 - (minutes * 60 + seconds)) / (25 * 60)) * 100 :
    ((5 * 60 - (minutes * 60 + seconds)) / (5 * 60)) * 100;

  return (
    <div className={cn(
      "fixed inset-0 pt-24 transition-colors duration-1000 flex flex-col items-center justify-center p-6",
      mode === "work" ? "bg-primary-950/20" : "bg-emerald-950/20"
    )}>
      {/* Animated Background Glow */}
      <div className={cn(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] blur-[120px] rounded-full opacity-20 pointer-events-none transition-colors duration-1000",
        mode === "work" ? "bg-primary-500" : "bg-emerald-500"
      )} />

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center space-y-12">
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-white/40"
          >
            {mode === "work" ? <Zap className="w-3.5 h-3.5 text-primary-500" /> : <Coffee className="w-3.5 h-3.5 text-emerald-500" />}
            {mode === "work" ? "Estado de Foco Especial" : "Pausa Restauradora"}
          </motion.div>
          <h1 className="text-5xl font-black text-white tracking-tighter">
            {mode === "work" ? "Hora de Brilhar" : "Hora de Respirar"}
          </h1>
        </div>

        {/* Timer Display Pro Max */}
        <div className="relative flex flex-col items-center group">
          <div className="absolute -inset-10 bg-white/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative flex flex-col items-center justify-center">
            <svg className="w-80 h-80 -rotate-90">
              <circle
                cx="160"
                cy="160"
                r="150"
                className="stroke-white/5 fill-none"
                strokeWidth="8"
              />
              <motion.circle
                cx="160"
                cy="160"
                r="150"
                className={cn(
                  "fill-none transition-colors duration-1000",
                  mode === "work" ? "stroke-primary-500" : "stroke-emerald-500"
                )}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray="942.48"
                animate={{ strokeDashoffset: 942.48 * (1 - progress / 100) }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-8xl font-black text-white tracking-tighter font-mono">
                 {String(minutes).padStart(2, '0')}<span className="text-white/20">:</span>{String(seconds).padStart(2, '0')}
               </span>
               <div className="mt-2 flex items-center gap-2 text-white/30 font-bold uppercase tracking-widest text-[10px]">
                  <Sparkles className="w-3 h-3" /> {sessionsCompleted} Sessões Hoje
               </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-8">
          <button 
            onClick={resetTimer}
            className="p-5 rounded-2xl bg-white/5 text-white/30 hover:bg-white/10 hover:text-white transition-all active:scale-90"
          >
            <RotateCcw className="w-7 h-7" />
          </button>
          
          <button 
            onClick={toggleTimer}
            className={cn(
               "px-16 py-6 rounded-[2.5rem] font-black text-xl text-white shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-4",
               isActive ? "bg-white/10 border border-white/20" : 
               mode === "work" ? "bg-primary-600 shadow-primary-500/20" : "bg-emerald-600 shadow-emerald-500/20"
            )}
          >
            {isActive ? (
              <><Pause className="w-8 h-8 fill-white" /> Pausar</>
            ) : (
              <><Play className="w-8 h-8 fill-white" /> Iniciar Foco</>
            )}
          </button>

          <div className="p-5 rounded-2xl opacity-0">
            <RotateCcw className="w-7 h-7" />
          </div>
        </div>

        {/* Gamification Indicator */}
        <div className="flex items-center gap-4 px-8 py-5 rounded-3xl border border-white/10 bg-white/5 glass-darker">
           <div className="w-12 h-12 rounded-2xl bg-primary-500/20 flex items-center justify-center text-primary-500 shadow-inner">
             <Trophy className="w-7 h-7" />
           </div>
           <div>
              <p className="text-lg font-black text-white leading-none">+25 XP</p>
              <p className="text-xs font-medium text-white/40 mt-1 uppercase tracking-widest">Recompensa por Foco</p>
           </div>
        </div>
      </div>
    </div>
  );
}
