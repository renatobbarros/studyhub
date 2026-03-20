"use client";

import { useState } from "react";
import { X, CheckCircle2, AlertCircle, Loader2, Trophy } from "lucide-react";
import { generateReinforcementQuestions } from "@/actions/study-plan";
import { addXP } from "@/actions/gamification";

interface AIQuizModalProps {
  subject: string;
  onClose: () => void;
}

export default function AIQuizModal({ subject, onClose }: AIQuizModalProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState<"loading" | "quiz" | "result">("loading");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isShowingCorrect, setIsShowingCorrect] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useState(() => {
    startQuiz();
  });

  async function startQuiz() {
    setError(null);
    setCurrentStep("loading");
    const res = await generateReinforcementQuestions(subject);
    if (res.success && res.questions) {
      setQuestions(res.questions);
      setCurrentStep("quiz");
    } else {
      setError(res.message || "Erro inesperado.");
    }
  }

  const handleOptionSelect = (index: number) => {
    if (isShowingCorrect) return;
    setSelectedOption(index);
    setIsShowingCorrect(true);

    const isCorrect = index === questions[currentQuestionIndex].correctIndex;
    if (isCorrect) {
      setScore(s => s + 1);
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(i => i + 1);
        setSelectedOption(null);
        setIsShowingCorrect(false);
      } else {
        handleFinish();
      }
    }, 1500);
  };

  async function handleFinish() {
    setCurrentStep("result");
    if (score >= 3) {
      await addXP(30); // Bonus for good score
    } else {
      await addXP(10); // Minimum XP for participation
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-background border border-foreground/10 rounded-[2.5rem] w-full max-w-lg overflow-hidden glass shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-foreground/5 text-foreground/40 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-10">
          {currentStep === "loading" && (
            <div className="py-20 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin" />
                <Brain className="absolute inset-0 m-auto w-6 h-6 text-primary-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">A IA está pensando...</h3>
                <p className="text-sm text-foreground/40">Gerando questões baseadas no seu nível.</p>
              </div>
              {error && (
                <div className="mt-4 p-4 rounded-xl bg-danger-500/10 text-danger-500 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}
            </div>
          )}

          {currentStep === "quiz" && questions[currentQuestionIndex] && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary-500">
                  Questão {currentQuestionIndex + 1} de {questions.length}
                </span>
                <h3 className="text-xl font-bold text-foreground leading-tight">
                  {questions[currentQuestionIndex].text}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {questions[currentQuestionIndex].options.map((option: string, idx: number) => {
                  const isCorrect = idx === questions[currentQuestionIndex].correctIndex;
                  const isSelected = selectedOption === idx;
                  
                  let stateStyle = "border-foreground/10 hover:border-primary-500/30";
                  if (isShowingCorrect) {
                    if (isCorrect) stateStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-600 ring-4 ring-emerald-500/10";
                    else if (isSelected) stateStyle = "border-danger-500 bg-danger-500/10 text-danger-600";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isShowingCorrect}
                      onClick={() => handleOptionSelect(idx)}
                      className={`w-full text-left p-4 rounded-2xl border font-medium transition-all flex items-center justify-between group ${stateStyle}`}
                    >
                      <span className="flex-1">{option}</span>
                      {isShowingCorrect && isCorrect && <CheckCircle2 className="w-5 h-5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === "result" && (
            <div className="py-10 text-center space-y-6 animate-in zoom-in duration-500">
              <div className="w-24 h-24 rounded-full bg-accent-500/10 flex items-center justify-center text-accent-500 mx-auto ring-8 ring-accent-500/5">
                <Trophy className="w-12 h-12" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-foreground">Treino Concluído!</h3>
                <p className="text-foreground/60">Você acertou <span className="text-primary-600 font-bold">{score} de {questions.length}</span> questões.</p>
              </div>
              <div className="p-4 rounded-2xl bg-primary-500/5 border border-primary-500/10 text-primary-700 font-bold text-sm">
                +{score >= 3 ? "30" : "10"} XP de Reforço Adicionado!
              </div>
              <button 
                onClick={onClose}
                className="w-full py-4 rounded-2xl bg-foreground text-background font-bold hover:opacity-90 transition shadow-xl"
              >
                Voltar para o Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Brain(props: any) {
    return (
        <svg
          {...props}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .52 8.125A3 3 0 0 0 7 21h10a3 3 0 0 0 3-3 4 4 0 0 0-.52-8.125 4 4 0 0 0-2.526-5.77A3 3 0 0 0 12 5" />
          <path d="M9 13a4.5 4.5 0 0 0 3-4" />
          <path d="M15 13a4.5 4.5 0 0 1-3-4" />
          <path d="M12 13V21" />
        </svg>
    )
}
