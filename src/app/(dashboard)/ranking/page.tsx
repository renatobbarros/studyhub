"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Trophy, Star, Medal, Target, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface UserRanking {
  id: string;
  name: string;
  xp: number;
  level: number;
  avatar?: string;
}

export default function RankingPage() {
  const [ranking, setRanking] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "users"),
      orderBy("xp", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserRanking[];
      setRanking(users);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const top3 = ranking.slice(0, 3);
  const others = ranking.slice(3);

  return (
    <div className="pt-24 pb-12 space-y-12 max-w-5xl mx-auto">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-amber-600 to-orange-950 p-10 md:p-12 text-white shadow-2xl">
         <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-yellow-500/20 to-transparent blur-3xl pointer-events-none" />
         <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest text-orange-200">
               <Trophy className="w-3 h-3" /> Hall da Fama
            </div>
            <h1 className="text-4xl font-black tracking-tight">Leaderboard da Guilda</h1>
            <p className="text-white/60">Os maiores matadores de prazos do seu grupo.</p>
         </div>
      </section>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 items-end">
        {top3.map((user, index) => {
          const isWinner = index === 0;
          return (
            <motion.div 
              key={user.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative rounded-3xl border p-8 flex flex-col items-center text-center gap-4 transition-all glass",
                isWinner ? "bg-gradient-to-b from-amber-500/20 to-transparent border-amber-500/50 scale-110 z-20 shadow-amber-500/20 shadow-2xl h-80" : "bg-white/5 border-white/10 h-72"
              )}
            >
              {isWinner && <Crown className="absolute -top-6 w-12 h-12 text-amber-500 fill-amber-500 drop-shadow-xl animate-bounce" />}
              
              <div className="relative mb-2">
                <div className={cn(
                   "w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all overflow-hidden",
                   isWinner ? "border-amber-500 w-24 h-24" : "border-white/20"
                )}>
                   {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <div className="text-2xl font-black opacity-30">{user.name[0]}</div>}
                </div>
                <div className={cn(
                  "absolute -bottom-2 -right-2 w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border-2 border-black/20 text-white",
                  index === 0 ? "bg-amber-500" : index === 1 ? "bg-slate-400" : "bg-orange-700"
                )}>
                  {index + 1}º
                </div>
              </div>

              <div>
                <h3 className="font-black text-foreground text-xl leading-tight">{user.name}</h3>
                <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mt-1">Nível {user.level}</p>
                <div className="mt-4 inline-flex items-center gap-2 bg-foreground/5 px-4 py-2 rounded-xl text-primary-600 font-black">
                   <Target className="w-4 h-4" /> {user.xp.toLocaleString()} XP
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Others Table */}
      <div className="rounded-[2.5rem] border bg-background/50 overflow-hidden glass border-white/10">
        <div className="p-8 border-b border-foreground/5 flex items-center justify-between">
           <h3 className="text-lg font-black text-foreground">Outros Membros</h3>
           <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest">{ranking.length} totais</span>
        </div>
        <div className="divide-y divide-foreground/5">
          {others.map((user, index) => (
            <div key={user.id} className="flex items-center justify-between p-6 hover:bg-foreground/5 transition-colors group">
               <div className="flex items-center gap-6">
                  <span className="text-xl font-black text-foreground/20 group-hover:text-primary-600 transition-colors">#{index + 4}</span>
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center font-bold text-foreground/40">
                        {user.name[0]}
                     </div>
                     <div>
                        <p className="font-bold text-foreground">{user.name}</p>
                        <p className="text-[10px] text-foreground/30 font-black uppercase tracking-widest">Nível {user.level}</p>
                     </div>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-lg font-black text-primary-600">{user.xp.toLocaleString()}</p>
                  <p className="text-[10px] text-foreground/30 font-bold uppercase tracking-widest">PONTOS XP</p>
               </div>
            </div>
          ))}
          {loading && <div className="p-20 text-center font-bold text-foreground/20 animate-pulse tracking-widest uppercase text-xs">Sincronizando Gloria...</div>}
        </div>
      </div>
    </div>
  );
}
