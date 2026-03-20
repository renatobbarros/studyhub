"use client";

import { useState } from "react";
import { Sparkles, Calendar, ArrowRight, Book, CheckCircle2, Wand2, Loader2 } from "lucide-react";
import { generateStudyPlan } from "@/actions/study-plan";

export default function StudyPlanPage() {
  const [subject, setSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any[] | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !examDate) return;

    try {
      setLoading(true);
      const result = await generateStudyPlan(subject, new Date(examDate));
      if (result.success) {
        setPlan(result.plan);
      }
    } catch (error) {

      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-left">
        <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary-500" />
          Plano de Estudo I.A.
        </h1>
        <p className="text-foreground/60 mt-2">Nossa IA cria o cronograma perfeito baseado na sua data de prova.</p>
      </div>

      {/* Generator Form */}
      <div className="rounded-3xl border bg-background/50 p-8 glass shadow-2xl shadow-primary-500/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <Wand2 className="w-32 h-32" />
        </div>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <div className="space-y-3">
             <label className="text-sm font-bold text-foreground/70 flex items-center gap-2">
               <Book className="w-4 h-4" /> Qual matéria você quer estudar?
             </label>
             <input 
               type="text" 
               placeholder="Ex: Cálculo I, Anatomia, Direito Civil..."
               value={subject}
               onChange={(e) => setSubject(e.target.value)}
               className="w-full bg-foreground/5 border-none rounded-2xl px-4 py-4 text-foreground placeholder:text-foreground/30 focus:ring-2 focus:ring-primary-500 transition"
               required
             />
          </div>

          <div className="space-y-3">
             <label className="text-sm font-bold text-foreground/70 flex items-center gap-2">
               <Calendar className="w-4 h-4" /> Quando é a prova?
             </label>
             <input 
               type="date" 
               value={examDate}
               onChange={(e) => setExamDate(e.target.value)}
               className="w-full bg-foreground/5 border-none rounded-2xl px-4 py-4 text-foreground focus:ring-2 focus:ring-primary-500 transition"
               required
             />
          </div>

          <div className="md:col-span-2">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold py-5 rounded-2xl shadow-lg hover:shadow-primary-500/25 transition transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-3"
            >
              {loading ? (
                <> <Loader2 className="w-6 h-6 animate-spin" /> Mapeando neurônios... </>
              ) : (
                <> <Sparkles className="w-6 h-6" /> Gerar Plano Otimizado </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Plan Result */}
      {plan && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="flex items-center gap-3 border-b border-foreground/10 pb-4">
              <h2 className="text-xl font-bold text-foreground">Seu Roteiro de Sucesso</h2>
              <span className="bg-primary-500/20 text-primary-600 text-xs font-bold px-2 py-1 rounded-full uppercase">IA Ativada</span>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {plan.map((item, idx) => (
               <div key={idx} className="rounded-2xl border bg-background/50 p-5 glass flex items-start gap-4 hover:border-primary-500/30 transition group">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold shrink-0 text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-primary-600 uppercase tracking-widest">{item.day}</p>
                    <h4 className="font-bold text-foreground mt-1">{item.topic}</h4>
                    <p className="text-sm text-foreground/50 mt-1">{item.method}</p>
                  </div>
               </div>
             ))}
           </div>

           <div className="p-6 rounded-3xl bg-accent-500/10 border border-accent-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent-500 flex items-center justify-center text-white shadow-lg">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Dica da IA: Repetição Espaçada</p>
                  <p className="text-sm text-foreground/60">Revisamos os conceitos mais difíceis a cada 3 dias para solidificar a memória.</p>
                </div>
              </div>
              <button className="flex items-center gap-2 text-accent-600 font-bold hover:underline">
                Exportar para Agenda <ArrowRight className="w-4 h-4" />
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
