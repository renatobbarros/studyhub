"use client";

import { useState } from "react";
import { Brain, Loader2 } from "lucide-react";
import { toggleSubjectDifficulty } from "@/actions/gamification";
import { useRouter } from "next/navigation";

interface DifficultyToggleProps {
  subject: string;
  isInitialDifficulty?: boolean;
}

export default function DifficultyToggle({ subject, isInitialDifficulty = false }: DifficultyToggleProps) {
  const [isDifficulty, setIsDifficulty] = useState(isInitialDifficulty);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleToggle() {
    setLoading(true);
    const res = await toggleSubjectDifficulty(subject);
    if (res.success) {
      setIsDifficulty(res.added ?? false);
      router.refresh(); // Refresh to update the ReinforcementSection if it's on the same page
    }
    setLoading(false);
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleToggle();
      }}
      disabled={loading}
      className={`p-2 rounded-xl transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${
        isDifficulty 
        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
        : "bg-foreground/5 text-foreground/40 hover:bg-orange-500/10 hover:text-orange-500"
      }`}
      title={isDifficulty ? "Remover dos reforços" : "Marcar para reforço IA"}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Brain className={`w-3 h-3 ${isDifficulty ? "fill-white" : ""}`} />
      )}
      {isDifficulty ? "Em Reforço" : "Reforço IA"}
    </button>
  );
}
