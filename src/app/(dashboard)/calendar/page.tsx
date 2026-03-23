"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { Plus, Trash2, CheckCircle2, Calendar as CalendarIcon, Star, Zap, Layers, Filter, ChevronRight, ChevronLeft, MoreHorizontal, Clock, ArrowRight } from "lucide-react";
import { getSubjects } from "@/actions/subjects";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { deleteTask } from "@/actions/tasks";
import type { Subject } from "@/actions/subjects";
import SubjectOnboardingModal from "@/components/modals/SubjectOnboardingModal";
import AddTaskModal from "@/components/modals/AddTaskModal";
import { updateTask } from "@/actions/tasks";

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  subjectId?: string;
  status: "todo" | "in_progress" | "done";
  xpReward: number;
}

export default function CalendarPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterView, setFilterView] = useState<"weekly" | "monthly">("weekly");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Load subjects
    const loadSubjects = async () => {
      const res = await getSubjects();
      if (res.success) {
        setSubjects(res.subjects);
        if (res.subjects.length === 0) setIsOnboardingOpen(true);
      }
    };
    loadSubjects();

    const q = query(collection(db, "tasks"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const tasksData = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(tasksData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Lógica de filtragem por data
  const filteredTasks = tasks.filter((task: Task) => {
    if (!task.dueDate) return true;
    const taskDate = new Date(task.dueDate);
    const now = new Date();
    
    if (filterView === "weekly") {
      // Criar cópias para evitar mutação
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      return taskDate >= startOfWeek && taskDate <= endOfWeek;
    } else {
      return taskDate.getMonth() === now.getMonth() && taskDate.getFullYear() === now.getFullYear();
    }
  });

  const getTasksBySubject = (subjectId: string) => filteredTasks.filter((t: Task) => t.subjectId === subjectId);

  const handleMoveSubject = async (taskId: string, targetSubjectId: string) => {
    await updateTask(taskId, { subjectId: targetSubjectId });
  };

  return (
    <div className="pt-24 pb-32 space-y-10 max-w-[1400px] mx-auto px-4">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-primary-600">
                <Layers className="w-3 h-3" /> Gestão de Missões
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-foreground">Agenda Kanban</h1>
            <p className="text-foreground/40 font-medium">Organize suas matérias e conquiste seus objetivos.</p>
        </div>

        <div className="flex items-center gap-4">
            {/* View Switcher */}
            <div className="bg-foreground/5 p-1 rounded-2xl flex items-center border border-foreground/5">
                <button 
                    onClick={() => setFilterView("weekly")}
                    className={cn(
                        "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                        filterView === "weekly" ? "bg-background text-foreground shadow-lg shadow-black/5" : "text-foreground/30 hover:text-foreground/60"
                    )}
                >
                    Semanal
                </button>
                <button 
                    onClick={() => setFilterView("monthly")}
                    className={cn(
                        "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                        filterView === "monthly" ? "bg-background text-foreground shadow-lg shadow-black/5" : "text-foreground/30 hover:text-foreground/60"
                    )}
                >
                    Mensal
                </button>
            </div>

            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 rounded-2xl bg-primary-600 text-white px-6 py-4 text-sm font-black uppercase tracking-tight hover:bg-primary-500 transition-all shadow-xl shadow-primary-600/20 active:scale-95"
            >
                <Plus className="w-5 h-5" /> Nova Missão
            </button>
        </div>
      </header>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <AnimatePresence mode="popLayout">
            {subjects.map((sub) => (
                <div key={sub.id} className="flex flex-col gap-6 min-h-[600px]">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-6 rounded-full bg-primary-500" />
                            <h2 className="text-lg font-black tracking-tight text-foreground uppercase">{sub.name}</h2>
                            <span className="px-2 py-0.5 rounded-lg bg-foreground/5 text-foreground/30 text-[10px] font-bold">
                                {sub.days.join(", ")}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 rounded-[2.5rem] p-4 space-y-4 border border-foreground/5 bg-foreground/5 transition-colors">
                        {getTasksBySubject(sub.id).map((task) => (
                            <motion.div
                                key={task.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group relative rounded-3xl border bg-background/60 p-5 glass hover:shadow-xl transition-all border-foreground/5 hover:border-primary-500/30"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-bold text-foreground leading-tight group-hover:text-primary-600 transition-colors uppercase tracking-tight italic">{task.title}</h3>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => deleteTask(task.id)}
                                                className="p-1.5 rounded-lg hover:bg-danger-500/10 text-danger-500 transition-all font-black text-[10px]"
                                            >
                                                EXCLUIR
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {task.description && (
                                        <p className="text-xs text-foreground/40 line-clamp-2">{task.description}</p>
                                    )}

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 text-[10px] font-black text-foreground/30 uppercase tracking-widest">
                                                <Clock className="w-3 h-3" />
                                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString([], { day: '2-digit', month: '2-digit' }) : "S/P"}
                                            </div>
                                        </div>
                                        
                                        <button 
                                          onClick={() => {
                                            const nextIdx = (subjects.findIndex(s => s.id === sub.id) + 1) % subjects.length;
                                            handleMoveSubject(task.id, subjects[nextIdx].id);
                                          }}
                                          className="p-2 rounded-xl bg-foreground/5 hover:bg-primary-500 text-foreground/40 hover:text-white transition group/btn"
                                          title="Mover para próxima matéria"
                                        >
                                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {getTasksBySubject(sub.id).length === 0 && !loading && (
                            <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-foreground/5 rounded-3xl opacity-20 italic text-xs font-bold uppercase tracking-widest">
                                Sem missões
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </AnimatePresence>
      </div>

      <AddTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        subjects={subjects}
      />
      <SubjectOnboardingModal 
        isOpen={isOnboardingOpen} 
        onClose={() => {
            setIsOnboardingOpen(false);
            window.location.reload(); // Refresh to load subjects
        }} 
      />
    </div>
  );
}
