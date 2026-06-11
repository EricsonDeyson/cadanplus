import {
  AlertTriangle,
  BarChart3,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Loader2,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ErrorAlert } from '../components/fields';
import { api } from '../lib/api';
import { formatBRL, formatBRLCompact, formatInt, MESES_CURTOS } from '../lib/format';
import type {
  ClienteInadimplencia,
  EquipeInadimplencia,
  InadimplenciaOverview,
  RepresentanteInadimplencia,
} from '../types';

type PeriodoState = {
  from: string;
  to: string;
};

const DEFAULT_LIMIT = 10;

function queryString(periodo: PeriodoState, extra: Record<string, string | number | null> = {}) {
  const params = new URLSearchParams();
  if (periodo.from) params.set('from', periodo.from);
  if (periodo.to) params.set('to', periodo.to);
  Object.entries(extra).forEach(([key, value]) => {
    if (value !== null && value !== '') params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function currentYearRange(): PeriodoState {
  const year = new Date().getFullYear();
  return { from: `${year}-01-01`, to: `${year}-12-31` };
}

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof BarChart3;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <Icon size={18} className="shrink-0 text-cadan-blue-700" />
        <div className="min-w-0">
          <h2 className="font-semibold text-slate-800">{title}</h2>
          {subtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof CircleDollarSign;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cadan-blue-50 text-cadan-blue-700">
          <Icon size={19} />
        </span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function LoadingBlock({ label }: { label: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-500">
      <Loader2 size={17} className="animate-spin" />
      {label}
    </div>
  );
}

export function InadimplenciaPage() {
  const [periodo, setPeriodo] = useState<PeriodoState>(() => currentYearRange());
  const [overview, setOverview] = useState<InadimplenciaOverview | null>(null);
  const [equipes, setEquipes] = useState<EquipeInadimplencia[]>([]);
  const [representantes, setRepresentantes] = useState<RepresentanteInadimplencia[]>([]);
  const [clientes, setClientes] = useState<ClienteInadimplencia[]>([]);
  const [selectedEquipe, setSelectedEquipe] = useState<EquipeInadimplencia | null>(null);
  const [selectedRepresentante, setSelectedRepresentante] =
    useState<RepresentanteInadimplencia | null>(null);
  const [loading, setLoading] = useState(true);
  const [drillLoading, setDrillLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setSelectedEquipe(null);
    setSelectedRepresentante(null);
    setRepresentantes([]);
    setClientes([]);

    Promise.all([
      api<InadimplenciaOverview>(
        `/api/dashboards/inadimplencia/overview${queryString(periodo, { limit: DEFAULT_LIMIT })}`,
      ),
      api<{ equipes: EquipeInadimplencia[] }>(
        `/api/dashboards/inadimplencia/equipes${queryString(periodo)}`,
      ),
    ])
      .then(([overviewData, equipesData]) => {
        if (!active) return;
        setOverview(overviewData);
        setEquipes(equipesData.equipes);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Não foi possível carregar o dashboard');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [periodo]);

  const mensalChart = useMemo(() => {
    const rows = overview?.porMes ?? [];
    const years = [...new Set(rows.map((row) => row.ano))].sort();
    const byMonth = new Map<number, Record<string, string | number>>();

    for (let month = 1; month <= 12; month += 1) {
      byMonth.set(month, { mes: MESES_CURTOS[month - 1] });
    }
    rows.forEach((row) => {
      byMonth.get(row.mes)![String(row.ano)] = row.valor;
    });

    return { data: [...byMonth.values()], years };
  }, [overview?.porMes]);

  async function loadRepresentantes(equipe: EquipeInadimplencia) {
    setSelectedEquipe(equipe);
    setSelectedRepresentante(null);
    setClientes([]);
    setDrillLoading(true);
    setError('');
    try {
      const data = await api<{ representantes: RepresentanteInadimplencia[] }>(
        `/api/dashboards/inadimplencia/equipes/${equipe.equipeId}/representantes${queryString(periodo)}`,
      );
      setRepresentantes(data.representantes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar representantes');
    } finally {
      setDrillLoading(false);
    }
  }

  async function loadClientes(representante: RepresentanteInadimplencia) {
    setSelectedRepresentante(representante);
    setDrillLoading(true);
    setError('');
    try {
      const data = await api<{ clientes: ClienteInadimplencia[] }>(
        `/api/dashboards/inadimplencia/representantes/${representante.representanteId}/clientes${queryString(
          periodo,
          { equipeId: selectedEquipe?.equipeId ?? null },
        )}`,
      );
      setClientes(data.clientes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar clientes');
    } finally {
      setDrillLoading(false);
    }
  }

  const resumo = overview?.resumo;

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-cadan-blue-800 px-5 py-5 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-cadan-yellow-300">
              Visão Gerencial
            </p>
            <h1 className="mt-1 text-2xl font-bold">Inadimplência de Clientes</h1>
            <p className="mt-1 max-w-2xl text-sm text-white/75">
              Análise por vencimento, aging, ranking de clientes e drill por equipe,
              representante e cliente.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-medium text-white/80">
              De
              <input
                type="date"
                value={periodo.from}
                onChange={(event) => setPeriodo((prev) => ({ ...prev, from: event.target.value }))}
                className="mt-1 h-10 w-full rounded-lg border border-white/20 bg-white/95 px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-cadan-yellow-400/60"
              />
            </label>
            <label className="text-xs font-medium text-white/80">
              Até
              <input
                type="date"
                value={periodo.to}
                onChange={(event) => setPeriodo((prev) => ({ ...prev, to: event.target.value }))}
                className="mt-1 h-10 w-full rounded-lg border border-white/20 bg-white/95 px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-cadan-yellow-400/60"
              />
            </label>
          </div>
        </div>
      </section>

      {error && <ErrorAlert message={error} />}

      {loading || !resumo ? (
        <LoadingBlock label="Carregando indicadores..." />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Total em aberto"
              value={formatBRLCompact(resumo.valorTotal)}
              detail={`${formatInt(resumo.titulos)} títulos em atraso`}
              icon={CircleDollarSign}
            />
            <MetricCard
              label="Clientes inadimplentes"
              value={formatInt(resumo.clientes)}
              detail={`${formatBRLCompact(resumo.valorOriginal)} em principal`}
              icon={Users}
            />
            <MetricCard
              label="Atraso médio"
              value={`${formatInt(resumo.atrasoMedioDias)} dias`}
              detail={`${formatInt(resumo.atrasoMedioPonderado)} dias ponderado por valor`}
              icon={CalendarDays}
            />
            <MetricCard
              label="Acima de 90 dias"
              value={formatBRLCompact(resumo.valorAcima90)}
              detail={`${resumo.pctAcima90.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% do principal`}
              icon={AlertTriangle}
            />
          </section>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.8fr)]">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <SectionTitle
                icon={BarChart3}
                title="Ano contra ano, mês a mês"
                subtitle="Valor original por mês de vencimento"
              />
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mensalChart.data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="mes" tickLine={false} axisLine={false} />
                    <YAxis
                      tickFormatter={(value) => formatBRLCompact(Number(value))}
                      tickLine={false}
                      axisLine={false}
                      width={72}
                    />
                    <Tooltip
                      formatter={(value) => formatBRL(Number(value))}
                      labelClassName="font-semibold text-slate-700"
                    />
                    <Legend />
                    {mensalChart.years.map((year, index) => (
                      <Bar
                        key={year}
                        dataKey={String(year)}
                        name={String(year)}
                        fill={index % 2 === 0 ? '#2d376f' : '#fab82c'}
                        radius={[5, 5, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <SectionTitle
                icon={TrendingUp}
                title="Aging da carteira"
                subtitle="Faixas por dias de atraso"
              />
              <div className="space-y-3">
                {overview.aging.map((row) => {
                  const pct = resumo.valorOriginal > 0 ? (row.valor / resumo.valorOriginal) * 100 : 0;
                  return (
                    <div key={row.faixa}>
                      <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-slate-700">{row.faixa}</span>
                        <span className="text-slate-500">{formatBRLCompact(row.valor)}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-cadan-blue-700"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        {formatInt(row.titulos)} títulos ·{' '}
                        {pct.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[minmax(360px,0.95fr)_minmax(0,1.05fr)]">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <SectionTitle
                icon={Building2}
                title="Top clientes inadimplentes"
                subtitle="Ordenado por valor original"
              />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500">
                      <th className="py-2 pr-3">Cliente</th>
                      <th className="px-3 py-2">Cidade</th>
                      <th className="px-3 py-2 text-right">Títulos</th>
                      <th className="py-2 pl-3 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {overview.topClientes.map((cliente) => (
                      <tr key={cliente.clienteId}>
                        <td className="py-2 pr-3">
                          <p className="font-medium text-slate-800">{cliente.nome}</p>
                          <p className="text-xs text-slate-400">#{cliente.clienteId}</p>
                        </td>
                        <td className="px-3 py-2 text-slate-500">{cliente.cidade ?? '-'}</td>
                        <td className="px-3 py-2 text-right text-slate-600">
                          {formatInt(cliente.titulos)}
                        </td>
                        <td className="py-2 pl-3 text-right font-semibold text-slate-800">
                          {formatBRL(cliente.valor)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <SectionTitle
                icon={Users}
                title="Drill por equipe"
                subtitle="Clique na equipe, depois no representante"
              />
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="min-w-0">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Equipes
                  </p>
                  <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
                    {equipes.map((equipe) => (
                      <button
                        key={equipe.equipeId}
                        type="button"
                        onClick={() => loadRepresentantes(equipe)}
                        className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
                          selectedEquipe?.equipeId === equipe.equipeId
                            ? 'border-cadan-blue-600 bg-cadan-blue-50 text-cadan-blue-800'
                            : 'border-slate-200 hover:border-cadan-blue-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{equipe.equipe}</span>
                          <span className="text-xs text-slate-500">{formatBRLCompact(equipe.valor)}</span>
                        </span>
                        <ChevronRight size={16} className="shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Representantes
                  </p>
                  {drillLoading && selectedEquipe && !selectedRepresentante ? (
                    <LoadingBlock label="Carregando..." />
                  ) : (
                    <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
                      {representantes.map((representante) => (
                        <button
                          key={representante.representanteId}
                          type="button"
                          onClick={() => loadClientes(representante)}
                          className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
                            selectedRepresentante?.representanteId === representante.representanteId
                              ? 'border-cadan-yellow-500 bg-cadan-yellow-50 text-cadan-blue-900'
                              : 'border-slate-200 hover:border-cadan-yellow-300 hover:bg-slate-50'
                          }`}
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-medium">
                              {representante.representante}
                            </span>
                            <span className="text-xs text-slate-500">
                              {formatBRLCompact(representante.valor)}
                            </span>
                          </span>
                          <ChevronDown size={16} className="shrink-0" />
                        </button>
                      ))}
                      {!selectedEquipe && (
                        <p className="rounded-lg border border-dashed border-slate-200 p-3 text-sm text-slate-500">
                          Selecione uma equipe.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Clientes
                  </p>
                  {drillLoading && selectedRepresentante ? (
                    <LoadingBlock label="Carregando..." />
                  ) : (
                    <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
                      {clientes.map((cliente) => (
                        <div
                          key={cliente.clienteId}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        >
                          <p className="truncate font-medium text-slate-800">{cliente.nome}</p>
                          <div className="mt-1 flex items-center justify-between gap-3 text-xs text-slate-500">
                            <span>{formatInt(cliente.titulos)} títulos</span>
                            <span className="font-semibold text-slate-700">
                              {formatBRLCompact(cliente.valor)}
                            </span>
                          </div>
                        </div>
                      ))}
                      {!selectedRepresentante && (
                        <p className="rounded-lg border border-dashed border-slate-200 p-3 text-sm text-slate-500">
                          Selecione um representante.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
