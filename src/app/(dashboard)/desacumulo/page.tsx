"use client";

import { useState, useEffect } from "react";
import { Send, Zap, User, Video, ExternalLink, Loader2, Sparkles } from "lucide-react";
import { addDesacumuloEntry, getDesacumuloFeed } from "@/actions/desacumulo";
import { useAuth } from "@/components/providers/AuthProvider";

export default function DesacumuloPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [newContent, setNewContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFeed();
  }, []);

  async function loadFeed() {
    const res = await getDesacumuloFeed();
    if (res.success) {
      setEntries(res.entries);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newContent.trim() || submitting) return;

    setSubmitting(true);
    const res = await addDesacumuloEntry(newContent);
    if (res.success) {
      setNewContent("");
      await loadFeed();
    }
    setSubmitting(false);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
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
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="O que foi passado na aula hoje? Ex: 'Vimos leis de Newton e exercícios de atrito'"
            className="w-full h-32 bg-transparent border-none outline-none text-xl font-medium text-foreground placeholder:text-foreground/20 resize-none"
          />
          <div className="flex items-center justify-between border-t border-foreground/5 pt-6">
            <div className="flex items-center gap-2 text-primary-600/60 text-sm font-bold">
                <Sparkles className="w-4 h-4" /> IA pronta para buscar vídeos
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

      {/* Feed Section */}
      <section className="space-y-8 pb-32">
        <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
            Explicações Recentes
            <span className="px-2 py-1 rounded-full bg-foreground/5 text-foreground/40 text-xs font-bold uppercase tracking-widest">{entries.length}</span>
        </h2>

        {loading ? (
          <div className="space-y-4">
            <div className="h-40 bg-foreground/5 rounded-3xl animate-pulse" />
            <div className="h-40 bg-foreground/5 rounded-3xl animate-pulse" />
          </div>
        ) : entries.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-foreground/10 rounded-3xl">
            <p className="text-foreground/40 font-medium italic">Ninguém postou hoje. Seja o primeiro a desacumular!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry) => (
              <div key={entry.id} className="rounded-3xl border bg-background/40 backdrop-blur-md p-6 glass hover:border-primary-500/20 transition-all group shadow-xl">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white ring-4 ring-primary-500/10">
                    {entry.avatar ? <img src={entry.avatar} className="w-full h-full rounded-full" /> : <User className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-foreground text-lg">{entry.userName}</h3>
                        <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">
                            {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <p className="text-foreground/80 leading-relaxed mt-2">{entry.content}</p>
                  </div>
                </div>

                {/* AI Results */}
                {entry.videos && entry.videos.length > 0 && (
                  <div className="bg-primary-500/5 rounded-2xl p-4 border border-primary-500/10">
                    <div className="flex items-center gap-2 mb-4 text-primary-600 text-xs font-black uppercase tracking-widest">
                        <Video className="w-4 h-4" /> Vídeos de Reforço Encontrados pela IA:
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {entry.videos.map((vid: any, i: number) => (
                        <a 
                          key={i} 
                          href={vid.url} 
                          target="_blank" 
                          className="flex items-center gap-3 p-3 rounded-xl bg-background/80 hover:bg-primary-500/10 transition border border-transparent hover:border-primary-500/20 group/vid"
                        >
                          <div className="relative w-20 aspect-video rounded-lg overflow-hidden bg-foreground/5">
                            <img src={vid.thumbnail} className="w-full h-full object-cover group-hover/vid:scale-110 transition duration-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground line-clamp-2 leading-snug group-hover/vid:text-primary-600 transition">{vid.title}</p>
                            <span className="flex items-center gap-1 text-[10px] text-foreground/40 mt-1 uppercase font-black tracking-tighter">YouTube <ExternalLink className="w-2 h-2" /></span>
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
    </div>
  );
}
