import { redirect } from "next/navigation";
import { verifyServerSession, syncUserProfile } from "@/actions/auth";
import { StatCard } from "@/components/dashboard/StatCard";
import ScheduleUpload from "@/components/dashboard/ScheduleUpload";
import ReinforcementSection from "@/components/dashboard/ReinforcementSection";
import DifficultyToggle from "@/components/dashboard/DifficultyToggle";
import { Trophy, Clock, Flame, CheckCircle2, Star, Target, Users, Zap, Calendar as CalendarIcon, Brain } from "lucide-react";

export default async function DashboardPage() {
  const session = await verifyServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  const userData = await syncUserProfile();

  return (
    <div className="pt-24 pb-12 space-y-12 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary-900 to-indigo-950 p-10 md:p-16 text-white shadow-2xl">
         <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary-500/20 to-transparent blur-3xl pointer-events-none" />
         <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest text-primary-300">
               <Zap className="w-3 h-3" /> Dashboard do Grupo
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              Olá, {userData?.name?.split(' ')[0] || "Estudante"}!
            </h1>
            <p className="text-xl text-white/60 leading-relaxed">
              Sua guilda está com <span className="text-white font-bold">85% de produtividade</span> hoje. 
              Continue assim para manter o topo do ranking!
            </p>
         </div>
      </section>

      {/* IA Action Area */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <ScheduleUpload />
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard 
          title="XP Total" 
          value={userData?.xp?.toLocaleString() || "0"} 
          icon={<Trophy className="w-5 h-5 text-yellow-500" />} 
          trend="XP Acumulado"
          color="accent"
        />
        <StatCard 
          title="Nível" 
          value={userData?.level?.toString() || "1"} 
          icon={<Star className="w-5 h-5 text-primary-400" />} 
          trend="Próximo em 24h"
          color="primary"
        />
        <StatCard 
          title="Rank" 
          value="#1" 
          icon={<Target className="w-5 h-5 text-indigo-400" />} 
          trend="Líder do grupo"
        />
        <StatCard 
          title="Tasks" 
          value="12" 
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />} 
          trend="+3 concluídas"
        />
        <StatCard 
          title="Streak" 
          value={`${userData?.streak || 0}d`} 
          icon={<Flame className="h-5 w-5 text-orange-500" />} 
          trend="🔥 No fogo!"
          color="danger"
        />
        <StatCard 
          title="Foco" 
          value="4.5h" 
          icon={<Clock className="w-5 h-5 text-blue-400" />} 
          trend="Meta de 5h"
        />
      </div>


      {/* AI Reinforcement Section */}
      <section className="space-y-6">
        <ReinforcementSection />
      </section>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Important Dates */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
               <CalendarIcon className="w-6 h-6 text-primary-500" />
               Datas Críticas
            </h2>
            <button className="text-sm font-bold text-primary-600 hover:underline">Ver Agenda Completa</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {[
               { title: "Prova de Cálculo I", date: "15 Abr", type: "Urgente", color: "bg-danger-500", subject: "Cálculo I" },
               { title: "Trabalho de Anatomia", date: "20 Abr", type: "Entrega", color: "bg-primary-500", subject: "Anatomia" },
             ].map((task, i) => (
                <div key={i} className="group relative p-6 rounded-3xl border bg-white/50 dark:bg-black/20 glass hover:scale-[1.02] transition-all cursor-pointer overflow-hidden">
                   <div className={cn("absolute top-0 left-0 w-1.5 h-full", task.color)} />
                    <div className="flex items-center justify-between mb-4">
                       <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{task.type}</span>
                       <div className="flex items-center gap-2">
                          <DifficultyToggle 
                            subject={task.subject || task.title} 
                            isInitialDifficulty={(userData as any)?.subjectDifficulties?.includes(task.subject || task.title)}
 
                          />
                          <span className="text-sm font-bold text-foreground/80">{task.date}</span>
                       </div>
                    </div>
                   <h3 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary-600 transition-colors">{task.title}</h3>
                </div>
             ))}
          </div>
        </div>

        {/* Guild Members Sidebar UI */}
        <div className="lg:col-span-4 space-y-6">
           <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
              <Users className="w-6 h-6 text-accent-500" />
              Membros
           </h2>
           <div className="rounded-[2rem] border bg-background/50 p-6 glass space-y-4">
              {[
                { name: "Você", xp: userData?.xp || 0, img: userData?.avatar, rank: 1 },
                { name: "Guilherme", xp: 1250, rank: 2 },
                { name: "Ana Clara", xp: 980, rank: 3 },
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-foreground/5 transition group">
                  <div className="flex items-center gap-4">
                     <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-100 to-indigo-100 flex items-center justify-center text-primary-600 font-bold border-2 border-transparent group-hover:border-primary-500 transition-all">
                           {m.img ? <img src={m.img} className="w-full h-full rounded-full" /> : m.name[0]}
                        </div>
                        {m.rank === 1 && <Trophy className="absolute -top-1 -right-1 w-4 h-4 text-accent-500 fill-accent-500 drop-shadow-md" />}
                     </div>
                     <div>
                        <p className="font-bold text-foreground text-sm">{m.name}</p>
                        <p className="text-[10px] text-foreground/40 font-black uppercase tracking-widest">{m.xp} XP acumulado</p>
                     </div>
                  </div>
                </div>
              ))}
              
              <button className="w-full py-3 rounded-xl border-2 border-dashed border-foreground/10 text-foreground/40 text-xs font-bold hover:border-primary-500 hover:text-primary-600 transition-all">
                + Convidar Membro
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

// Minimal utility function locally for speed
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
