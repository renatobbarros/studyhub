"use client";

import { Bell, Search, UserCircle, LogOut, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { auth as clientAuth } from "@/lib/firebase/client";
import { clearSessionCookie } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function TopBar() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await clientAuth.signOut();
    await clearSessionCookie();
    router.push("/");
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="h-16 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl px-6 flex items-center justify-between shadow-2xl ring-1 ring-white/10"
      >
        <div className="flex items-center gap-4">
           <Link href="/dashboard" className="flex items-center gap-2 group">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-accent-600 flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
                <Sparkles className="w-4 h-4" />
             </div>
             <span className="font-black text-white tracking-tighter text-lg md:block hidden">STUDY<span className="text-primary-500">HUB</span></span>
           </Link>
        </div>

        <div className="flex-1 flex justify-center max-w-md mx-8">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-primary-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar no hub..." 
              className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/20 focus:ring-2 focus:ring-primary-500/50 focus:bg-white/10 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-xl hover:bg-white/5 transition text-white/70">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full border-2 border-black"></span>
          </button>
          
          <div className="flex items-center gap-3 pl-2 border-l border-white/10">
            <button className="flex items-center gap-2 group">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || "User"} className="w-8 h-8 rounded-full border border-white/20 group-hover:border-primary-500 transition" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 font-bold border border-primary-500/30">
                  {user?.displayName?.[0] || "U"}
                </div>
              )}
            </button>
            <button 
              onClick={handleSignOut}
              className="p-2 text-white/20 hover:text-danger-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
