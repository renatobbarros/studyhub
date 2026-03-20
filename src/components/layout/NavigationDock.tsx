"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Calendar, 
  Timer, 
  Trophy,
  Sparkles,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dash", href: "/dashboard", icon: LayoutDashboard },
  { name: "Desacumular", href: "/desacumulo", icon: Zap },
  { name: "Agenda", href: "/calendar", icon: Calendar },
  { name: "Ranking", href: "/ranking", icon: Trophy },
  { name: "Pomodoro", href: "/timer", icon: Timer },
];

export function NavigationDock() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="flex items-center gap-2 p-2 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/10 shadow-2xl ring-1 ring-white/10"
      >
        <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white mr-2 shadow-lg shadow-primary-600/30">
          <Sparkles className="w-5 h-5" />
        </div>

        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative group flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-300",
                isActive ? "bg-white/10 text-white" : "text-white/40 hover:text-white/80"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeDock"
                  className="absolute inset-0 bg-white/10 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className="h-6 w-6 relative z-10" />
              <span className="absolute -bottom-10 opacity-0 group-hover:opacity-100 group-hover:-bottom-12 transition-all duration-300 text-[10px] font-black uppercase tracking-tighter bg-black text-white px-2 py-1 rounded-md whitespace-nowrap border border-white/20">
                {item.name}
              </span>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}
