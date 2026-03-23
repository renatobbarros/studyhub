"use client";

import { useState } from "react";
import { Upload, Sparkles, FileText, CheckCircle2, Loader2, AlertCircle, FileUp, X as RemoveIcon } from "lucide-react";
import { parseScheduleWithAI, parseSchedulePDF } from "@/actions/study-plan";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ScheduleUpload() {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!text.trim() && !file) return;
    setLoading(true);
    setError(null);
    try {
      let result;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        result = await parseSchedulePDF(formData);
      } else {
        result = await parseScheduleWithAI(text);
      }

      if (result.success) {
        setSuccess(true);
        setText("");
        setFile(null);
        setTimeout(() => {
          setSuccess(false);
          setIsOpen(false);
        }, 3000);
      } else {
        setError(result.message || "Ocorreu um erro ao processar.");
      }
    } catch (err: any) {
       console.error(err);
       setError("Erro de rede ou falha no servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setText(""); // Limpa o texto se subir arquivo
    }
  };

  return (
    <div className="w-full">
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 p-6 text-left shadow-xl transition hover:scale-[1.02] active:scale-[0.98]"
      >
        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
           <Sparkles className="w-20 h-20 text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col gap-2">
           <div className="flex items-center gap-2 text-white/80 font-bold uppercase tracking-widest text-xs">
              <Sparkles className="w-4 h-4" /> Inteligência Coletiva
           </div>
           <h3 className="text-2xl font-black text-white">Importar Cronograma</h3>
           <p className="text-white/70 text-sm max-w-[250px]">
             Cole seu PDF de aulas ou datas de prova e deixe que a IA organize sua agenda.
           </p>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg rounded-3xl border bg-background p-8 shadow-2xl glass"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-500" />
                  Alimentar o Hub
                </h2>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-foreground/20 hover:text-foreground/50 transition"
                >
                  ✕
                </button>
              </div>

              {success ? (
                <div className="py-12 flex flex-col items-center text-center space-y-4">
                   <div className="w-16 h-16 rounded-full bg-success-500/20 flex items-center justify-center text-success-500 animate-bounce">
                     <CheckCircle2 className="w-10 h-10" />
                   </div>
                   <h3 className="text-xl font-bold text-foreground">Magia Concluída!</h3>
                   <p className="text-foreground/60">Suas datas foram extraídas e adicionadas ao calendário do seu grupo.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Option 1: PDF Upload (New) */}
                  <div className="relative group">
                    <label className={cn(
                      "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all",
                      file ? "border-primary-500 bg-primary-500/5" : "border-foreground/10 hover:border-primary-500/30 bg-foreground/[0.02]"
                    )}>
                      {file ? (
                        <div className="flex flex-col items-center text-primary-600">
                          <CheckCircle2 className="w-8 h-8 mb-2" />
                          <span className="text-sm font-bold truncate max-w-[200px]">{file.name}</span>
                          <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFile(null); }}
                            className="mt-2 text-[10px] font-black uppercase text-foreground/40 hover:text-danger-500"
                          >
                            Remover Arquivo
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-foreground/40">
                          <FileUp className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-bold">Subir Cronograma (PDF)</span>
                          <span className="text-[10px] uppercase font-black tracking-tighter mt-1">Recomendado</span>
                        </div>
                      )}
                      <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                    </label>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-foreground/5" />
                    <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">OU COLD TEXT</span>
                    <div className="h-px flex-1 bg-foreground/5" />
                  </div>

                  <div className="relative">
                    <textarea 
                      value={text}
                      onChange={(e) => { setText(e.target.value); if(e.target.value) setFile(null); }}
                      placeholder="Cole aqui o texto do cronograma, datas de provas ou e-mails dos professores..."
                      className="w-full h-32 bg-foreground/5 border-none rounded-2xl p-4 text-foreground placeholder:text-foreground/30 focus:ring-2 focus:ring-primary-500 transition resize-none"
                    />
                    <div className="absolute bottom-4 right-4 flex items-center gap-2 text-[10px] text-foreground/30 font-bold uppercase tracking-widest">
                       Powered by Gemini <Sparkles className="w-3 h-3" />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-xs text-danger-600">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="flex items-center gap-2 p-3 rounded-xl bg-primary-500/5 border border-primary-500/10 text-xs text-primary-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Estas datas ficarão visíveis para todos os membros da sua Guilda.
                  </div>

                  <button 
                    onClick={handleProcess}
                    disabled={loading || (!text.trim() && !file)}
                    className="w-full bg-primary-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-primary-500 transition disabled:opacity-50"
                  >
                    {loading ? (
                      <> <Loader2 className="w-5 h-5 animate-spin" /> Processando... </>
                    ) : (
                      <> <Sparkles className="w-5 h-5" /> Sincronizar com IA </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
