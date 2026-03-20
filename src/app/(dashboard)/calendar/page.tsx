"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { Plus, Trash2, CheckCircle2, Calendar as CalendarIcon, Clock, Star, Zap, Layers } from "lucide-react";
import { deleteTask } from "@/actions/tasks";
import { completeTask } from "@/actions/gamification";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  xpReward: number;
}

export default function CalendarPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "tasks"), where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(tasksData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask(taskId);
    } catch (error) {
       console.error(error);
    }
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="pt-24 pb-12 space-y-12 max-w-5xl mx-auto">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-900 to-primary-950 p-10 md:p-12 text-white shadow-2xl">
         <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary-500/10 to-transparent blur-3xl pointer-events-none" />
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest text-primary-300">
                  <Layers className="w-3 h-3" /> Agenda do Guerreiro
               </div>
               <h1 className="text-4xl font-black tracking-tight">Suas Missões</h1>
               <p className="text-white/60">Você tem <span className="text-white font-bold">{pendingTasks.length} tarefas</span> pendentes para hoje.</p>
            </div>
            <button className="flex items-center gap-2 rounded-2xl bg-white text-primary-950 px-6 py-4 text-sm font-black uppercase tracking-tight hover:bg-primary-50 transition-all shadow-xl hover:scale-105 active:scale-95">
               <Plus className="w-5 h-5" /> Adicionar Missão
            </button>
         </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Pending Area */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-xl font-black text-foreground px-2 flex items-center gap-3">
             <Zap className="w-5 h-5 text-accent-500 fill-accent-500" /> Ativas agora
          </h2>
          
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {pendingTasks.map((task) => (
                <motion.div 
                  key={task.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative rounded-3xl border bg-white/50 dark:bg-black/20 p-6 glass flex items-center justify-between gap-4 hover:shadow-xl transition-all border-white/10 dark:hover:border-primary-500/30"
                >
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => handleCompleteTask(task.id)}
                      className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center border border-foreground/10 hover:bg-primary-500/10 hover:border-primary-500 transition-all group/check"
                    >
                      <CheckCircle2 className="w-6 h-6 text-foreground/10 group-hover/check:text-primary-500 transition-colors" />
                    </button>
                    <div>
                      <h3 className="text-lg font-bold text-foreground leading-tight">{task.title}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground/40">
                           <CalendarIcon className="w-3.5 h-3.5" /> 
                           {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Sem prazo"}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-black text-primary-600 bg-primary-500/5 px-2 py-0.5 rounded-full">
                           <Star className="w-3 h-3 fill-primary-600" /> {task.xpReward} XP
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-3 rounded-xl hover:bg-danger-500/10 text-foreground/20 hover:text-danger-500 transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {!loading && pendingTasks.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-foreground/5 rounded-3xl border border-dashed border-foreground/10">
                 <div className="w-16 h-16 rounded-full bg-white/50 flex items-center justify-center text-foreground/20">
                    <Star className="w-8 h-8" />
                 </div>
                 <p className="font-bold text-foreground/40 italic">Agenda limpa! Você é uma lenda.</p>
              </div>
            )}
          </div>
        </div>

        {/* History Area */}
        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-xl font-black text-foreground flex items-center gap-3">
             <CheckCircle2 className="w-5 h-5 text-primary-500" /> Histórico
          </h2>
          <div className="space-y-3">
             <div className="rounded-[2.5rem] border bg-background/50 p-6 glass space-y-4">
                {completedTasks.slice(0, 5).map(task => (
                  <div key={task.id} className="flex items-center gap-4 opacity-40 hover:opacity-60 transition-opacity">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500 uppercase font-black text-[10px]">
                       OK
                    </div>
                    <p className="text-sm font-bold text-foreground line-through">{task.title}</p>
                  </div>
                ))}
                {completedTasks.length === 0 && <p className="text-center py-6 text-xs text-foreground/30 font-bold uppercase tracking-widest">Nenhuma vitória ainda</p>}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
