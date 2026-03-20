"use client";

import { useState, useEffect } from "react";
import { Youtube, Brain, ChevronRight, X, PlayCircle, Loader2, CheckCircle2 } from "lucide-react";
import { getReinforcementVideos, getUserDifficulties } from "@/actions/study-plan";
import { toggleSubjectDifficulty } from "@/actions/gamification";

import AIQuizModal from "./AIQuizModal";

export default function ReinforcementSection() {
  const [difficulties, setDifficulties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    loadDifficulties();
  }, []);

  async function loadDifficulties() {
    const res = await getUserDifficulties();
    if (res.success) {
      setDifficulties(res.difficulties);
    }
    setLoading(false);
  }

  async function handleSelectSubject(subject: string) {
    if (selectedSubject === subject) {
      setSelectedSubject(null);
      setVideos([]);
      return;
    }
    setSelectedSubject(subject);
    setLoadingVideos(true);
    const res = await getReinforcementVideos(subject);
    if (res.success) {
      setVideos(res.videos);
    }
    setLoadingVideos(false);
  }

  if (loading) return <div className="animate-pulse h-40 bg-foreground/5 rounded-2xl" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reforço com IA</h2>
          <p className="text-foreground/60 text-sm">Foque no que você tem mais dificuldade.</p>
        </div>
        <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 ring-1 ring-orange-500/20">
          <Brain className="w-5 h-5" />
        </div>
      </div>

      {difficulties.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-foreground/10 rounded-2xl text-center space-y-2">
          <p className="text-foreground/40 italic">Nenhuma matéria marcada como dificuldade ainda.</p>
          <p className="text-xs text-foreground/30">Marque matérias no seu cronograma para vê-las aqui.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {difficulties.map((subject) => (
            <div key={subject} className="space-y-4">
              <button
                onClick={() => handleSelectSubject(subject)}
                className={`w-full text-left p-4 rounded-2xl border transition-all glass flex items-center justify-between group ${
                  selectedSubject === subject 
                  ? "border-primary-500/50 ring-2 ring-primary-500/20 bg-primary-500/5" 
                  : "border-foreground/10 hover:border-primary-500/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    selectedSubject === subject ? "bg-primary-500 text-white" : "bg-foreground/5 text-foreground/40"
                  }`}>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{subject}</h4>
                    <p className="text-xs text-foreground/50">Clique para ver reforços</p>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 transition-transform ${selectedSubject === subject ? "rotate-90 text-primary-500" : "text-foreground/20"}`} />
              </button>

              {/* Videos and Quiz Sub-section */}
              {selectedSubject === subject && (
                <div className="pl-4 border-l-2 border-primary-500/20 space-y-4 animate-in slide-in-from-left duration-300">
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {loadingVideos ? (
                      <div className="flex items-center gap-2 text-xs text-foreground/40 py-4">
                        <Loader2 className="w-4 h-4 animate-spin" /> Buscando vídeos recomendados...
                      </div>
                    ) : (
                      videos.map((video, idx) => (
                        <a
                          key={idx}
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-w-[200px] group block space-y-2"
                        >
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-foreground/5 ring-1 ring-foreground/10">
                            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <PlayCircle className="w-8 h-8 text-white" />
                            </div>
                          </div>
                          <p className="text-xs font-medium text-foreground/80 line-clamp-2 leading-relaxed">{video.title}</p>
                        </a>
                      ))
                    )}
                  </div>
                  
                  <button 
                    className="w-full py-3 rounded-xl bg-primary-600 text-white font-bold text-sm hover:bg-primary-500 transition shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2"
                    onClick={() => setShowQuiz(true)}
                  >
                    <Brain className="w-4 h-4" /> Validar Conhecimento (Quiz IA)
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showQuiz && selectedSubject && (
          <AIQuizModal subject={selectedSubject} onClose={() => setShowQuiz(false)} />
      )}
    </div>
  );
}
