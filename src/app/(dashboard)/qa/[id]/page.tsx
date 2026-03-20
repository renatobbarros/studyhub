"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { MessageSquare, Send, User, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Question {
  id: string;
  title: string;
  userId: string;
  userName: string;
  createdAt: any;
  answersCount: number;
}

interface Answer {
  id: string;
  content: string;
  userId: string;
  userName: string;
  createdAt: any;
  isCorrect?: boolean;
}

export default function QuestionDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Fetch Question
    const fetchQuestion = async () => {
      const docRef = doc(db, "questions", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setQuestion({ id: docSnap.id, ...docSnap.data() } as Question);
      }
    };

    fetchQuestion();

    // Listen for Answers
    const q = query(
      collection(db, "questions", id, "answers"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ans = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Answer[];
      setAnswers(ans);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const handlePostAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswer.trim() || !user || !id) return;

    try {
      setSending(true);
      await addDoc(collection(db, "questions", id, "answers"), {
        content: newAnswer,
        userId: user.uid,
        userName: user.displayName || "Estudante",
        createdAt: serverTimestamp(),
      });

      // Update answer count on question
      await updateDoc(doc(db, "questions", id), {
        answersCount: increment(1)
      });

      setNewAnswer("");
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;
  if (!question) return <div className="text-center py-20 font-bold text-foreground/40">Pergunta não encontrada ou carregando...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link href="/qa" className="inline-flex items-center gap-2 text-sm text-foreground/50 hover:text-primary-600 transition">
        <ArrowLeft className="w-4 h-4" /> Voltar para o Hub
      </Link>

      <div className="rounded-3xl border bg-background/50 p-8 glass shadow-xl border-primary-500/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-foreground">{question.userName}</p>
            <p className="text-xs text-foreground/40">{question.createdAt?.toDate()?.toLocaleString() || "Recentemente"}</p>
          </div>
        </div>
        <h1 className="text-2xl font-extrabold text-foreground leading-tight">
          {question.title}
        </h1>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
           <MessageSquare className="w-5 h-5 text-accent-500" />
           Respostas ({answers.length})
        </h2>

        {answers.map((ans) => (
          <div key={ans.id} className="rounded-2xl border bg-background/50 p-6 glass flex gap-4 hover:border-foreground/20 transition group">
             <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/30 shrink-0">
               <User className="w-5 h-5" />
             </div>
             <div className="flex-1">
               <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-foreground text-sm">{ans.userName}</p>
                  <p className="text-[10px] text-foreground/30 font-mono">{ans.createdAt?.toDate()?.toLocaleString() || "Agora"}</p>
               </div>
               <p className="text-foreground/80 leading-relaxed text-sm">
                 {ans.content}
               </p>
             </div>
          </div>
        ))}

        {answers.length === 0 && <p className="text-center py-10 text-foreground/30 italic">Ainda não há respostas. Ajude um colega!</p>}
      </div>

      {/* Answer Input */}
      <form onSubmit={handlePostAnswer} className="sticky bottom-6 rounded-2xl border bg-background p-4 shadow-2xl flex gap-3 items-end ring-2 ring-primary-500/10 focus-within:ring-primary-500/30 transition">
         <textarea 
           value={newAnswer}
           onChange={(e) => setNewAnswer(e.target.value)}
           placeholder="Escreva sua resposta..."
           className="flex-1 bg-transparent border-none focus:ring-0 resize-none text-foreground py-2 text-sm outline-none"
           rows={2}
           required
         />
         <button 
           type="submit"
           disabled={sending}
           className="bg-primary-600 text-white p-3 rounded-xl hover:bg-primary-500 transition disabled:opacity-50 h-fit"
         >
           {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
         </button>
      </form>
    </div>
  );
}
