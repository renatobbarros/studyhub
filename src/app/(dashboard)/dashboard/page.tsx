import { redirect } from "next/navigation";
import { verifyServerSession, syncUserProfile, getGuildMembers } from "@/actions/auth";
import { getDashboardStats, getCriticalDates } from "@/actions/dashboard";

export const dynamic = "force-dynamic";
import { StatCard } from "@/components/dashboard/StatCard";
import ScheduleUpload from "@/components/dashboard/ScheduleUpload";
import ReinforcementSection from "@/components/dashboard/ReinforcementSection";
import DifficultyToggle from "@/components/dashboard/DifficultyToggle";
import { Trophy, Clock, Flame, CheckCircle2, Star, Target, Users, Zap, Calendar as CalendarIcon, Brain } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await verifyServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  let userData = null;
  let stats = null;
  let criticalDates: any[] = [];
  let members: any[] = [];

  try {
    // Carregamento paralelo das ações de servidor para performance
    const [userRes, statsRes, datesRes, membersRes] = await Promise.allSettled([
      syncUserProfile(),
      getDashboardStats(),
      getCriticalDates(),
      getGuildMembers()
    ]);

    userData = userRes.status === 'fulfilled' ? userRes.value : null;
    stats = statsRes.status === 'fulfilled' ? statsRes.value : null;
    criticalDates = datesRes.status === 'fulfilled' ? (datesRes.value as any) : [];
    members = membersRes.status === 'fulfilled' ? (membersRes.value as any) : [];

  } catch (error) {
    console.error("Erro ao carregar dados do dashboard:", error);
  }

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
              Você tem <span className="text-white font-bold">{stats?.pendingThisWeek || 0} pendências</span> para essa semana. 
              Mantenha o foco para subir de nível!
            </p>

            {/* Level Progress Bar */}
            <div className="mt-8 space-y-2 max-w-sm">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-primary-300">{stats?.levelTitle || "Novato"}</span>
                <span className="text-white/40">Nível {stats?.level} • {Math.round(stats?.levelProgress || 0)}%</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats?.levelProgress || 0}%` }}
                  className="h-full bg-gradient-to-r from-primary-400 to-accent-400"
                />
              </div>
            </div>
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
          value={stats?.totalXp?.toLocaleString() || "0"} 
          icon={<Trophy className="w-5 h-5 text-yellow-500" />} 
          trend="XP Acumulado"
          color="accent"
        />
        <StatCard 
          title="Nível" 
          value={stats?.level?.toString() || "1"} 
          icon={<Star className="w-5 h-5 text-primary-400" />} 
          trend="Próximo em 24h"
          color="primary"
        />
        <StatCard 
          title="Rank" 
          value={stats?.rank || "#1"} 
          icon={<Target className="w-5 h-5 text-indigo-400" />} 
          trend="Posição no grupo"
        />
        <StatCard 
          title="Tasks" 
          value={stats?.tasksCompleted?.toString() || "0"} 
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />} 
          trend="Tasks de hoje"
        />
        <StatCard 
          title="Streak" 
          value={`${stats?.streak || 0}d`} 
          icon={<Flame className="h-5 w-5 text-orange-500" />} 
          trend="🔥 No fogo!"
          color="danger"
        />
        <StatCard 
          title="Foco Total" 
          value={stats?.focusHours || "0h"} 
          icon={<Clock className="w-5 h-5 text-blue-400" />} 
          trend="Tempo acumulado"
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
             {criticalDates.map((task: any, i: number) => (
                <div key={i} className="group relative p-6 rounded-3xl border bg-white/50 dark:bg-black/20 glass hover:scale-[1.02] transition-all cursor-pointer overflow-hidden">
                   <div className={cn("absolute top-0 left-0 w-1.5 h-full", task.color || "bg-primary-500")} />
                    <div className="flex items-center justify-between mb-4">
                       <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{task.type || "DeadLine"}</span>
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
              {members.map((m: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-foreground/5 transition group">
                   <div className="flex items-center gap-4">
                      <div className="relative">
                         <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-100 to-indigo-100 flex items-center justify-center text-primary-600 font-bold border-2 border-transparent group-hover:border-primary-500 transition-all">
                            {m.avatar ? <img src={m.avatar} className="w-full h-full rounded-full" /> : (m.name?.[0] || m.displayName?.[0] || "?")}
                         </div>
                         {i === 0 && <Trophy className="absolute -top-1 -right-1 w-4 h-4 text-accent-500 fill-accent-500 drop-shadow-md" />}
                      </div>
                      <div>
                         <p className="font-bold text-foreground text-sm">{m.name || m.displayName || "Jogador"}</p>
                         <p className="text-[10px] text-foreground/40 font-black uppercase tracking-widest">{m.xp || 0} XP acumulado</p>
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

// Local cn utility removed in favor of imported one from @/lib/utils
