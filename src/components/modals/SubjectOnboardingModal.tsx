"use client";

import { useState } from "react";
import { X, Plus, Check, Loader2, Sparkles, Brain, BookOpen } from "lucide-react";
import { updateUserSubjects } from "@/actions/subjects";
import type { Subject } from "@/actions/subjects";
import { motion, AnimatePresence } from "framer-motion";

interface SubjectOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_SUBJECTS = [
  "Cálculo I", "Anatomia II", "Direito Civil", "Algoritmos", 
  "História da Arte", "Bioquímica", "Microeconomia", "Física Geral"
];

const WEEK_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export default function SubjectOnboardingModal({ isOpen, onClose }: SubjectOnboardingModalProps) {
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
  const [customSubject, setCustomSubject] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleSubject = (name: string) => {
    if (selectedSubjects.find((s: Subject) => s.name === name)) {
      setSelectedSubjects(selectedSubjects.filter((s: Subject) => s.name !== name));
    } else {
      setSelectedSubjects([...selectedSubjects, { 
        id: Math.random().toString(36).substring(7), 
        name, 
        days: ["Seg"] // Default day
      }]);
    }
  };

  const toggleDay = (subjectId: string, day: string) => {
    setSelectedSubjects(selectedSubjects.map((s: Subject) => {
      if (s.id === subjectId) {
        const days = s.days.includes(day) 
          ? s.days.filter((d: string) => d !== day) 
          : [...s.days, day];
        return { ...s, days };
      }
      return s;
    }));
  };

  const handleSave = async () => {
    if (selectedSubjects.length === 0) return;
    setLoading(true);
    try {
      await updateUserSubjects(selectedSubjects);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl rounded-[3rem] border bg-background/90 p-10 glass shadow-2xl ring-1 ring-white/10"
      >
        <div className="space-y-8">
          <div className="text-center space-y-4">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-primary-600">
                <Sparkles className="w-3 h-3" /> Configuração Inicial
             </div>
             <h2 className="text-4xl font-black tracking-tighter text-foreground">Quais matérias você tem?</h2>
             <p className="text-foreground/40 font-medium">Selecione as disciplinas que você está cursando este semestre.</p>
          </div>

          <div className="space-y-6 max-h-[400px] overflow-y-auto px-2 scrollbar-hide">
            {/* Presets */}
            <div className="flex flex-wrap gap-2">
              {PRESET_SUBJECTS.map(name => {
                const isSelected = selectedSubjects.find(s => s.name === name);
                return (
                  <button
                    key={name}
                    onClick={() => toggleSubject(name)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                      isSelected 
                      ? "bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-600/20" 
                      : "bg-foreground/5 border-transparent text-foreground/40 hover:bg-foreground/10 hover:text-foreground/60"
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
              
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-foreground/5 border border-dashed border-foreground/10">
                <input 
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Outra..."
                  className="bg-transparent border-none text-sm font-bold outline-none w-24 text-foreground"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customSubject.trim()) {
                      toggleSubject(customSubject.trim());
                      setCustomSubject("");
                    }
                  }}
                />
                <Plus className="w-4 h-4 text-foreground/20" />
              </div>
            </div>

            {/* Selection with Days */}
            <AnimatePresence>
              {selectedSubjects.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-foreground/5">
                  <h3 className="text-xs font-black uppercase tracking-widest text-foreground/30">Configure os dias de cada uma:</h3>
                  {selectedSubjects.map(subject => (
                    <motion.div 
                      key={subject.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="p-4 rounded-2xl bg-foreground/5 border border-foreground/5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-foreground">{subject.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {WEEK_DAYS.map(day => (
                          <button
                            key={day}
                            onClick={() => toggleDay(subject.id, day)}
                            className={`w-9 h-9 rounded-lg text-[10px] font-black transition-all ${
                              subject.days.includes(day)
                              ? "bg-primary-500 text-white"
                              : "bg-background text-foreground/20 hover:text-foreground/40"
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleSave}
            disabled={loading || selectedSubjects.length === 0}
            className="w-full bg-primary-600 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-sm hover:bg-primary-500 transition shadow-2xl shadow-primary-600/30 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <Check className="w-5 h-5" /> Começar Agora
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
