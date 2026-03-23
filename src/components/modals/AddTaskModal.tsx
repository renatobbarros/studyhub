"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { X, Calendar as CalendarIcon, Star, Plus, Loader2 } from "lucide-react";
import { createTask } from "@/actions/tasks";
import type { Subject } from "@/actions/subjects";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
}

export default function AddTaskModal({ isOpen, onClose, subjects }: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [loading, setLoading] = useState(false);

  // Sync subjectId when subjects load
  useEffect(() => {
    if ((!subjectId || subjectId === "") && subjects.length > 0) {
      setSubjectId(subjects[0].id);
    }
  }, [subjects, subjectId]);

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await createTask({
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        subjectId,
        status: "todo",
      });
      setTitle("");
      setDescription("");
      setDueDate("");
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg rounded-[2.5rem] border bg-background/80 backdrop-blur-xl p-8 glass shadow-2xl ring-1 ring-white/10 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-primary-600 text-white">
                <Plus className="w-5 h-5" />
             </div>
             <h2 className="text-2xl font-black text-foreground">Nova Missão</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-foreground/5 text-foreground/40 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-foreground/40 ml-4">O que precisa ser feito?</label>
            <input
              autoFocus
              value={title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="Ex: Estudar Anatomia II"
              className="w-full bg-foreground/5 border-none rounded-2xl p-4 text-lg font-bold text-foreground focus:ring-2 ring-primary-500 transition outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-foreground/40 ml-4">Matéria Relacionada</label>
            <select
                value={subjectId}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSubjectId(e.target.value)}
                className="w-full bg-foreground/5 border-none rounded-2xl p-4 text-sm font-bold text-foreground focus:ring-2 ring-primary-500 transition outline-none appearance-none cursor-pointer"
                required
            >
                {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-foreground/40 ml-4">Detalhes (Opcional)</label>
            <textarea
              value={description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Capítulos 3 e 4, foco em ossos do crânio..."
              className="w-full bg-foreground/5 border-none rounded-2xl p-4 h-24 text-foreground focus:ring-2 ring-primary-500 transition outline-none resize-none"
            />
          </div>

          <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-foreground/40 ml-4">Prazo</label>
                <div className="relative">
                    <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20" />
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setDueDate(e.target.value)}
                        className="w-full bg-foreground/5 border-none rounded-2xl p-4 pl-12 text-sm font-bold text-foreground focus:ring-2 ring-primary-500 transition outline-none appearance-none"
                    />
                </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2 text-primary-600 font-bold text-sm">
                <Star className="w-4 h-4 fill-primary-600" /> +10 XP ao concluir
            </div>
            <button
              disabled={loading || !title.trim()}
              className="px-8 py-4 rounded-2xl bg-primary-600 text-white font-black uppercase tracking-tight hover:bg-primary-500 transition disabled:opacity-50 flex items-center gap-2 shadow-xl shadow-primary-600/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Criar Missão"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
