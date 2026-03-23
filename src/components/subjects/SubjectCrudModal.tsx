"use client";

import { useState } from "react";
import { Plus, X, Trash2, Save, Loader2 } from "lucide-react";
import { updateUserSubjects } from "@/actions/subjects";
import type { Subject } from "@/actions/subjects";

interface SubjectCrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  onUpdate: () => void;
}

export function SubjectCrudModal({ isOpen, onClose, subjects, onUpdate }: SubjectCrudModalProps) {
  const [localSubjects, setLocalSubjects] = useState<Subject[]>(subjects);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!newSubjectName.trim()) return;
    const newSubject: Subject = {
      id: Math.random().toString(36).substring(2, 9),
      name: newSubjectName.trim(),
      days: [],
    };
    setLocalSubjects([...localSubjects, newSubject]);
    setNewSubjectName("");
  };

  const handleDelete = (id: string) => {
    setLocalSubjects(localSubjects.filter((s) => s.id !== id));
  };

  const handleSave = async () => {
    setLoading(true);
    const res = await updateUserSubjects(localSubjects);
    if (res.success) {
      onUpdate();
      onClose();
    } else {
      alert("Erro ao salvar matérias.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-background border border-white/10 p-6 rounded-3xl shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black mb-6 text-white">Gerenciar Matérias</h2>

        <div className="flex items-center gap-2 mb-6">
          <input
            type="text"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            placeholder="Nova matéria..."
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-primary-500"
          />
          <button
            onClick={handleAdd}
            className="p-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl transition shadow-lg shadow-primary-600/20"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 mb-8 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
          {localSubjects.length === 0 ? (
            <p className="text-white/40 text-center py-4 text-sm font-medium">Nenhuma matéria cadastrada.</p>
          ) : (
            localSubjects.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl px-4 py-3 group hover:border-white/10 transition"
              >
                <span className="text-white font-medium">{s.name}</span>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-danger-500/50 hover:text-danger-400 hover:bg-danger-500/10 p-1.5 rounded-lg transition"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Salvar Alterações</>}
        </button>
      </div>
    </div>
  );
}
