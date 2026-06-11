import { ShieldCheck } from 'lucide-react';

export function AdminPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white/60 px-6 py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cadan-yellow-400/20 text-cadan-blue-700">
        <ShieldCheck size={26} />
      </span>
      <h1 className="text-lg font-semibold text-slate-700">Área Administrativa</h1>
      <p className="max-w-md text-sm text-slate-500">
        Em construção — aqui ficará a gestão de usuários (criação com senha temporária), papéis e
        permissões de acesso aos módulos.
      </p>
    </div>
  );
}
