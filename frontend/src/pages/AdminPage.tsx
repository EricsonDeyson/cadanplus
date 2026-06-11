import {
  FolderKanban,
  LayoutDashboard,
  Loader2,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ErrorAlert, SuccessAlert, TextField } from '../components/fields';
import { api } from '../lib/api';
import { moduleIcon } from '../lib/icons';
import type { AppOutletContext } from '../layouts/AppLayout';
import type { AdminGroupsOverview } from '../types';

export function AdminPage() {
  const { refreshModules } = useOutletContext<AppOutletContext>();
  const [data, setData] = useState<AdminGroupsOverview>({ groups: [], modules: [] });
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadGroups() {
    setLoading(true);
    setError('');
    try {
      setData(await api<AdminGroupsOverview>('/api/admin/groups'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar a área administrativa');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGroups();
  }, []);

  const modulesByGroup = useMemo(() => {
    const map = new Map<number | null, typeof data.modules>();
    map.set(null, []);
    data.groups.forEach((group) => map.set(group.id, []));
    data.modules.forEach((module) => {
      const key = module.groupId ?? null;
      map.set(key, [...(map.get(key) ?? []), module]);
    });
    return map;
  }, [data]);

  async function createGroup(event: FormEvent) {
    event.preventDefault();
    if (!groupName.trim()) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { group } = await api<{ group: AdminGroupsOverview['groups'][number] }>('/api/admin/groups', {
        method: 'POST',
        body: { name: groupName },
      });
      setData((prev) => ({ ...prev, groups: [...prev.groups, group] }));
      setGroupName('');
      setSuccess('Grupo criado com sucesso.');
      await refreshModules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar o grupo');
    } finally {
      setSaving(false);
    }
  }

  async function deleteGroup(id: number) {
    const group = data.groups.find((item) => item.id === id);
    if (!group) return;
    const confirmed = window.confirm(`Excluir o grupo "${group.name}"? Os dashboards voltam para "Sem grupo".`);
    if (!confirmed) return;

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api(`/api/admin/groups/${id}`, { method: 'DELETE' });
      setData((prev) => ({
        groups: prev.groups.filter((item) => item.id !== id),
        modules: prev.modules.map((module) =>
          module.groupId === id ? { ...module, groupId: null } : module,
        ),
      }));
      setSuccess('Grupo excluído com sucesso.');
      await refreshModules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir o grupo');
    } finally {
      setSaving(false);
    }
  }

  async function moveModule(moduleId: number, groupId: number | null) {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api(`/api/admin/modules/${moduleId}/group`, {
        method: 'PATCH',
        body: { groupId },
      });
      setData((prev) => ({
        ...prev,
        modules: prev.modules.map((module) =>
          module.id === moduleId ? { ...module, groupId } : module,
        ),
      }));
      setSuccess('Dashboard movido com sucesso.');
      await refreshModules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível mover o dashboard');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-cadan-blue-700">
            <ShieldCheck size={21} />
            <p className="text-xs font-semibold uppercase tracking-wider">Área Administrativa</p>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Grupos de dashboards</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Organize os dashboards por grupos para manter o menu lateral e a busca mais fáceis de
            navegar conforme novos painéis forem criados.
          </p>
        </div>

        <form onSubmit={createGroup} className="flex w-full gap-2 sm:max-w-md">
          <TextField
            label="Novo grupo"
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
            placeholder="Ex.: Compras"
            disabled={saving}
          />
          <button
            type="submit"
            disabled={saving || !groupName.trim()}
            className="mt-6 flex h-[42px] w-11 shrink-0 items-center justify-center rounded-lg bg-cadan-blue-700 text-white transition hover:bg-cadan-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            title="Criar grupo"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={19} />}
          </button>
        </form>
      </section>

      {error && <ErrorAlert message={error} />}
      {success && <SuccessAlert message={success} />}

      {loading ? (
        <div className="flex min-h-48 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-500">
          <Loader2 size={18} className="animate-spin" />
          Carregando grupos...
        </div>
      ) : (
        <section className="grid gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <FolderKanban size={18} className="text-cadan-blue-700" />
              <h2 className="font-semibold text-slate-800">Grupos cadastrados</h2>
            </div>
            <div className="space-y-2">
              {data.groups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800">{group.name}</p>
                    <p className="text-xs text-slate-400">
                      {(modulesByGroup.get(group.id) ?? []).length} dashboards
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteGroup(group.id)}
                    disabled={saving}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                    title="Excluir grupo"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
              {data.groups.length === 0 && (
                <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  Nenhum grupo criado ainda.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <LayoutDashboard size={18} className="text-cadan-blue-700" />
              <h2 className="font-semibold text-slate-800">Mover dashboards</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="py-2 pr-3">Dashboard</th>
                    <th className="px-3 py-2">Rota</th>
                    <th className="px-3 py-2">Grupo</th>
                    <th className="py-2 pl-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.modules.map((module) => {
                    const Icon = moduleIcon(module.icon);
                    return (
                      <tr key={module.id}>
                        <td className="py-2 pr-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cadan-blue-50 text-cadan-blue-700">
                              <Icon size={18} />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate font-medium text-slate-800">
                                {module.name}
                              </span>
                              <span className="block truncate text-xs text-slate-400">
                                {module.description ?? module.slug}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-slate-500">{module.route}</td>
                        <td className="px-3 py-2">
                          <select
                            value={module.groupId ?? ''}
                            onChange={(event) =>
                              moveModule(
                                module.id,
                                event.target.value ? Number(event.target.value) : null,
                              )
                            }
                            disabled={saving}
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-cadan-blue-400 focus:ring-2 focus:ring-cadan-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <option value="">Sem grupo</option>
                            {data.groups.map((group) => (
                              <option key={group.id} value={group.id}>
                                {group.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 pl-3 text-right">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                              module.isActive
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <Save size={13} />
                            {module.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
