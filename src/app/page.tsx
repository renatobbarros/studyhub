import Link from "next/link";
import { ArrowRight, Trophy, Sparkles, Users } from "lucide-react";

export default function Home() {
  // O Auth Provider do client-side irá cuidar do redirecionamento se houver user logado.
  // Por ora, a Landing page aparece sempre que estamos no /.

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Background Shapes */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent-500/10 rounded-full blur-[100px] pointer-events-none" />

      <main className="z-10 flex flex-col items-center text-center max-w-4xl px-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100/50 mb-8">
          <span className="flex h-2 w-2 rounded-full bg-primary-600 animate-pulse"></span>
          <span className="text-sm font-semibold text-primary-900">A revolução dos estudos começou!</span>
        </div>

        <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
          Hackeie sua <br />
          <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">Rotina Universitária</span>
        </h1>
        
        <p className="text-xl text-foreground/60 mb-10 max-w-2xl leading-relaxed">
          O primeiro super app que transforma seus prazos, materiais e metodologias de estudo 
          em uma jornada épica gamificada no estilo RPG.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center mb-24">
          <Link href="/sign-in" className="flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-4 text-base font-bold text-white shadow-lg hover:bg-primary-500 hover:shadow-primary-500/25 transition hover:-translate-y-1">
            Entrar no Hub <ArrowRight className="w-5 h-5" />
          </Link>
          <a href="#features" className="flex items-center gap-2 rounded-xl bg-foreground/5 px-8 py-4 text-base font-bold text-foreground hover:bg-foreground/10 transition">
            Entenda como funciona
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left" id="features">
          <div className="rounded-2xl border border-foreground/10 bg-background/50 p-6 glass flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground">A.I. Coach</h3>
            <p className="text-foreground/60 text-sm leading-relaxed">Nossa IA lê as datas das suas provas e gera cronogramas otimizados usando Repetição Espaçada.</p>
          </div>

          <div className="rounded-2xl border border-foreground/10 bg-background/50 p-6 glass flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center text-accent-600">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Jornada Heroica</h3>
            <p className="text-foreground/60 text-sm leading-relaxed">Ganhe XP ao concluir tarefas, desbloqueie badges exclusivos e chegue ao topo do Leaderboard da sua sala.</p>
          </div>

          <div className="rounded-2xl border border-foreground/10 bg-background/50 p-6 glass flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center text-success-600">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Hub de Turmas</h3>
            <p className="text-foreground/60 text-sm leading-relaxed">Nunca mais perca o link de uma aula. Acesse mensagens, Q&A e eventos cadastrados de forma colaborativa.</p>
          </div>
        </div>
      </main>

      {/* Decorative gradients */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}
