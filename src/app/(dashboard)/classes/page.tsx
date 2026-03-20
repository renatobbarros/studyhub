import { Users as UsersIcon, Plus, Search } from "lucide-react";

export default function ClassesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Minhas Turmas</h1>
          <p className="text-foreground/60">
            Gerencie suas disciplinas, acesse materiais e interaja com os colegas.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-foreground/10 bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm hover:bg-foreground/5 transition">
            <Search className="w-4 h-4" /> Entrar com Código
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 transition">
            <Plus className="w-4 h-4" /> Criar Turma
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Placeholder for Class Card */}
        <div className="rounded-xl border bg-background/50 p-6 glass flex flex-col gap-4 hover:border-primary-500/50 transition cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl">
              SI
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Sistemas de Informação</h3>
              <p className="text-sm text-foreground/60">UFRJ • 4º Semestre</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 pt-4 border-t border-foreground/5 text-sm text-foreground/70">
            <span className="flex items-center gap-2"><UsersIcon className="w-4 h-4" /> 45 Alunos</span>
            <span className="text-danger-500 font-medium">1 Prova Próx.</span>
          </div>
        </div>
        
        {/* Placeholder for Empty State if no classes */}
        <div className="rounded-xl border border-dashed border-foreground/20 bg-background/20 p-6 flex flex-col items-center justify-center gap-2 text-center h-[180px]">
          <p className="font-medium text-foreground/70">Você ainda não entrou em uma turma</p>
          <p className="text-sm text-foreground/50">Peça o código para o seu representante ou crie uma nova.</p>
        </div>
      </div>
    </div>
  );
}
