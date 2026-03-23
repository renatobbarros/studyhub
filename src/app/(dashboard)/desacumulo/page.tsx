"use client";

import { useState, useEffect } from "react";
import { Send, Zap, User, Video, ExternalLink, Loader2, Sparkles, Trash2, Filter, Pencil } from "lucide-react";
import { addDesacumuloEntry, getDesacumuloFeed, deleteDesacumuloEntry } from "@/actions/desacumulo";
import { useAuth } from "@/components/providers/AuthProvider";
import { getSubjects } from "@/actions/subjects";
import type { Subject } from "@/actions/subjects";
import { SubjectCrudModal } from "@/components/subjects/SubjectCrudModal";

export default function DesacumuloPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [newContent, setNewContent] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Geral");
  const [filterSubject, setFilterSubject] = useState("Geral");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadSubjects = async () => {
    const res = await getSubjects();
    if (res.success && res.subjects) {
      setSubjects(res.subjects);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    loadFeed();
  }, [filterSubject]);

  async function loadFeed() {
    setLoading(true);
    const res = await getDesacumuloFeed(filterSubject);
    if (res.success) {
      setEntries(res.entries);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newContent.trim() || submitting) return;

    setSubmitting(true);
    const res = await addDesacumuloEntry(newContent, selectedSubject);
    if (res.success) {
      setNewContent("");
      await loadFeed();
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta explicação?")) return;
    const res = await deleteDesacumuloEntry(id);
    if (res.success) {
      await loadFeed();
    }
  }

  // Função para formatar o conteúdo em bullet points se houver quebras de linha ou houver sido solicitado
  const renderContent = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    return (
      <ul className="list-disc list-inside space-y-1">
        {lines.map((line, i) => (
          <li key={i} className="text-foreground/80 leading-relaxed text-sm md:text-base">
            {line.replace(/^[•\-\*]\s*/, '')}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-600 text-white shadow-lg shadow-primary-600/30">
                <Zap className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-foreground">Desacumulo Relâmpago</h1>
        </div>
        <p className="text-foreground/60 text-lg">Compartilhe o conteúdo da aula e a IA trará reforços para todos.</p>
      </header>

      {/* Input Section */}
      <section className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-accent-500 rounded-[2.5rem] blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
        <form onSubmit={handleSubmit} className="relative rounded-[2rem] border bg-background/80 backdrop-blur-xl p-8 glass flex flex-col gap-6 ring-1 ring-primary-500/10 shadow-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1.5 rounded-full text-xs font-bold transition-all border bg-foreground/5 border-transparent text-foreground/40 hover:bg-foreground/10 flex items-center gap-1"
              title="Gerenciar Matérias"
            >
              <Pencil className="w-3.5 h-3.5" /> Editar Matérias
            </button>
            {subjects.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedSubject(s.name)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                  selectedSubject === s.name 
                    ? "bg-primary-600 border-primary-600 text-white" 
                    : "bg-foreground/5 border-transparent text-foreground/40 hover:bg-foreground/10"
                )}
              >
                {s.name}
              </button>
            ))}
          </div>

          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder={`O que vimos em ${selectedSubject === "Geral" ? "aula" : selectedSubject} hoje? (A IA transformará tudo em bullet points técnicos)`}
            className="w-full h-32 bg-transparent border-none outline-none text-lg md:text-xl font-medium text-foreground placeholder:text-foreground/20 resize-none"
          />
          
          <div className="flex items-center justify-between border-t border-foreground/5 pt-6">
            <div className="flex items-center gap-2 text-primary-600/60 text-xs font-black uppercase tracking-tighter">
                <Sparkles className="w-4 h-4" /> Formatação Automática: Bullet Points
            </div>
            <button
              disabled={submitting || !newContent.trim()}
              className="px-8 py-4 rounded-2xl bg-primary-600 text-white font-bold hover:bg-primary-500 transition disabled:opacity-50 flex items-center gap-2 shadow-xl shadow-primary-600/20"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Compartilhar</>}
            </button>
          </div>
        </form>
      </section>

      {/* Filter Section */}
      <section className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex items-center gap-2 text-foreground/40 font-bold text-sm whitespace-nowrap">
          <Filter className="w-4 h-4" /> Filtrar:
        </div>
        <button
          onClick={() => setFilterSubject("Geral")}
          className={cn(
            "px-5 py-2 rounded-2xl text-sm font-bold transition-all border whitespace-nowrap",
            filterSubject === "Geral" 
              ? "bg-accent-500 border-accent-500 text-white shadow-lg shadow-accent-500/20" 
              : "bg-background/40 border-foreground/5 text-foreground/60 hover:bg-background/60"
          )}
        >
          Geral
        </button>
        {subjects.map(s => (
          <button
            key={s.id}
            onClick={() => setFilterSubject(s.name)}
            className={cn(
              "px-5 py-2 rounded-2xl text-sm font-bold transition-all border whitespace-nowrap",
              filterSubject === s.name 
                ? "bg-accent-500 border-accent-500 text-white shadow-lg shadow-accent-500/20" 
                : "bg-background/40 border-foreground/5 text-foreground/60 hover:bg-background/60"
            )}
          >
            {s.name}
          </button>
        ))}
      </section>

      {/* Feed Section */}
      <section className="space-y-8 pb-32">
        <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
            {filterSubject === "Geral" ? "Explicações Recentes" : `Posts de ${filterSubject}`}
            <span className="px-2 py-1 rounded-full bg-foreground/5 text-foreground/40 text-xs font-bold uppercase tracking-widest">{entries.length}</span>
        </h2>

        {loading ? (
          <div className="space-y-4">
            <div className="h-40 bg-foreground/5 rounded-3xl animate-pulse" />
            <div className="h-40 bg-foreground/5 rounded-3xl animate-pulse" />
          </div>
        ) : entries.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-foreground/10 rounded-3xl">
            <p className="text-foreground/40 font-medium italic">Nenhum post encontrado para este filtro.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry) => (
              <div key={entry.id} className="rounded-3xl border bg-background/40 backdrop-blur-md p-6 glass hover:border-primary-500/20 transition-all group shadow-xl relative overflow-hidden">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white ring-4 ring-primary-500/10 shrink-0">
                    {entry.avatar ? <img src={entry.avatar} className="w-full h-full rounded-full" /> : <User className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-foreground text-lg">{entry.userName}</h3>
                          <span className="px-2 py-0.5 rounded-md bg-primary-500/10 text-primary-600 text-[10px] font-black uppercase tracking-tighter">
                            {entry.subject || "Geral"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">
                              {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {user?.uid === entry.userId && (
                            <button 
                              onClick={() => handleDelete(entry.id)}
                              className="p-2 rounded-lg text-danger-500/40 hover:text-danger-500 hover:bg-danger-500/10 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                    </div>
                    <div className="mt-3">
                      {renderContent(entry.content)}
                    </div>
                  </div>
                </div>

                {/* AI Results */}
                {entry.videos && entry.videos.length > 0 && (
                  <div className="bg-primary-500/5 rounded-2xl p-4 border border-primary-500/10 ml-0 md:ml-16">
                    <div className="flex items-center gap-2 mb-4 text-primary-600 text-xs font-black uppercase tracking-widest">
                        <Video className="w-4 h-4" /> Vídeos de Reforço ({entry.subject}):
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {entry.videos.map((vid: any, i: number) => (
                        <a 
                          key={i} 
                          href={vid.url} 
                          target="_blank" 
                          className="flex items-center gap-3 p-3 rounded-xl bg-background/80 hover:bg-primary-500/10 transition border border-transparent hover:border-primary-500/20 group/vid"
                        >
                          <div className="relative w-16 aspect-video rounded-lg overflow-hidden bg-foreground/5 shrink-0">
                            <img src={vid.thumbnail} className="w-full h-full object-cover group-hover/vid:scale-110 transition duration-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-foreground line-clamp-2 leading-tight group-hover/vid:text-primary-600 transition">{vid.title}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
      <SubjectCrudModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        subjects={subjects} 
        onUpdate={loadSubjects} 
      />
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
