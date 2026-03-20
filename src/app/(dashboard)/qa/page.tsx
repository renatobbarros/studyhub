"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { MessageSquare, Send, User, ChevronRight, HelpCircle } from "lucide-react";

interface Question {
  id: string;
  title: string;
  userId: string;
  userName: string;
  createdAt: any;
  answersCount: number;
}

export default function QAPage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "questions"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const qs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Question[];
      setQuestions(qs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !user) return;

    try {
      await addDoc(collection(db, "questions"), {
        title: newQuestion,
        userId: user.uid,
        userName: user.displayName || "Estudante",
        createdAt: serverTimestamp(),
        answersCount: 0
      });
      setNewQuestion("");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Hub de Apoio Q&A</h1>
        <p className="text-foreground/60">Tire suas dúvidas com a comunidade.</p>
      </div>

      {/* Ask Question Box */}
      <form onSubmit={handleAsk} className="rounded-2xl border bg-background/50 p-6 glass flex gap-4 ring-1 ring-primary-500/20 focus-within:ring-primary-500/50 transition">
        <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 shrink-0">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div className="flex-1 flex gap-2">
          <input 
            type="text" 
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Qual é a sua dúvida?" 
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-foreground/30 font-medium"
          />
          <button 
            type="submit"
            className="rounded-xl bg-primary-600 px-6 py-2 text-sm font-bold text-white hover:bg-primary-500 transition flex items-center gap-2"
          >
            Perguntar <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {loading ? (
          <p className="text-center opacity-40">Buscando mentes brilhantes...</p>
        ) : questions.length === 0 ? (
          <div className="text-center py-20 opacity-40 border-2 border-dashed rounded-2xl">
             <p>Nenhuma pergunta ainda. Seja o primeiro!</p>
          </div>
        ) : (
          questions.map((q) => (
            <Link key={q.id} href={`/qa/${q.id}`}>
              <div className="rounded-2xl border bg-background/50 p-5 glass flex items-center justify-between group hover:border-primary-500/30 transition cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/40 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground group-hover:text-primary-600 transition">{q.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-foreground/40 mt-1">
                      <span>{q.userName}</span>
                      <span className="flex items-center gap-1 font-semibold text-accent-500">
                        <MessageSquare className="w-3 h-3" /> {q.answersCount} respostas
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-foreground/20 group-hover:text-primary-500 transition" />
              </div>
            </Link>
          ))

        )}
      </div>
    </div>
  );
}
