import { ArrowRight, BarChart3 } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { AppOutletContext } from '../layouts/AppLayout';
import { moduleIcon } from '../lib/icons';

export function HomePage() {
  const { profile } = useAuth();
  const { modules } = useOutletContext<AppOutletContext>();
  const firstName = profile?.fullName.split(' ')[0] ?? '';
  const groupedModules = useMemo(() => {
    const groups = modules.reduce<
      Array<{ key: string; name: string; sortOrder: number; modules: typeof modules }>
    >((acc, module) => {
      const key = module.group ? `group-${module.group.id}` : 'ungrouped';
      let group = acc.find((item) => item.key === key);
      if (!group) {
        group = {
          key,
          name: module.group?.name ?? 'Geral',
          sortOrder: module.group?.sortOrder ?? 9999,
          modules: [],
        };
        acc.push(group);
      }
      group.modules.push(module);
      return acc;
    }, []);

    return groups
      .map((group) => ({
        ...group,
        modules: [...group.modules].sort((a, b) => a.sortOrder - b.sortOrder),
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  }, [modules]);

  return (
    <div className="space-y-6">
      {/* Boas-vindas */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cadan-blue-700 to-cadan-blue-800 p-8 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-cadan-yellow-400/25 blur-2xl" />
        <h1 className="text-2xl font-bold">Olá, {firstName}! 👋</h1>
        <p className="mt-1 max-w-xl text-sm text-white/80">
          Bem-vindo ao <strong>CadanPlus</strong>, o portal de relatórios da CADAN. Use a busca no
          topo ou o menu lateral para navegar entre os módulos.
        </p>
      </section>

      {/* Módulos disponíveis */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Seus módulos
        </h2>
        <div className="space-y-5">
          {groupedModules.map((group) => (
            <div key={group.key}>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">{group.name}</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.modules.map((module) => {
                  const Icon = moduleIcon(module.icon);
                  return (
                    <Link
                      key={module.id}
                      to={module.route}
                      className="group flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-5
                                 shadow-sm transition hover:-translate-y-0.5 hover:border-cadan-blue-300 hover:shadow-md"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-cadan-blue-50 text-cadan-blue-700 transition group-hover:bg-cadan-yellow-400/20 group-hover:text-cadan-blue-800">
                        <Icon size={22} />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                          {module.name}
                          <ArrowRight
                            size={14}
                            className="opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                          />
                        </span>
                        {module.description && (
                          <span className="mt-0.5 block truncate text-sm text-slate-500">
                            {module.description}
                          </span>
                        )}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Espaço reservado para os dashboards */}
      <section className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cadan-blue-50 text-cadan-blue-600">
          <BarChart3 size={26} />
        </span>
        <h3 className="font-semibold text-slate-700">Seus dashboards aparecerão aqui</h3>
        <p className="max-w-md text-sm text-slate-500">
          Em breve este espaço exibirá os indicadores das views do PBICadan — vendas, estoques,
          metas, contas a pagar/receber e muito mais.
        </p>
      </section>
    </div>
  );
}
