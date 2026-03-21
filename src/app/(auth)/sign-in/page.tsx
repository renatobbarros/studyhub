"use client";

import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { createSessionCookie, syncUserProfile } from "@/actions/auth";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setLoading(true);
      const provider = new GoogleAuthProvider();
      console.log("Iniciando popup...");
      const result = await signInWithPopup(auth, provider);
      
      console.log("Obtendo ID Token...");
      const idToken = await result.user.getIdToken();
      
      console.log("Criando sessão...");
      const res = await createSessionCookie(idToken);
      if (!res.success) throw new Error("Falha ao criar sessão segura.");
      
      console.log("Sincronizando perfil...");
      await syncUserProfile();

      console.log("Redirecionando...");
      // Forçar redirecionamento se o router do Next.js demorar
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("Erro detalhado login:", err);
      setError(err.message || "Erro desconhecido ao entrar. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background/80 blur-[0.5px] border border-foreground/10 shadow-xl rounded-2xl p-8 w-full max-w-sm flex flex-col items-center">
      <h3 className="text-xl font-bold text-foreground mb-6">Acesse sua conta</h3>
      
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-500 text-sm text-center">
          {error}
        </div>
      )}

      <button 
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-semibold py-3 px-4 rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition disabled:opacity-50"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {loading ? "Conectando..." : "Entrar com Google"}
      </button>

      <p className="mt-6 text-xs text-foreground/50 text-center">
        Ao entrar, você concorda com nossos Termos de Serviço e Política de Privacidade.
      </p>
    </div>
  );
}
