import { NavLink } from 'react-router-dom';
import { moduleIcon } from '../lib/icons';
import type { ModuleItem } from '../types';

interface SidebarProps {
  expanded: boolean;
  modules: ModuleItem[];
}

export function Sidebar({ expanded, modules }: SidebarProps) {
  const grouped = modules.reduce<
    Array<{ key: string; name: string; sortOrder: number; modules: ModuleItem[] }>
  >((acc, module) => {
    const key = module.group ? `group-${module.group.id}` : 'ungrouped';
    let group = acc.find((item) => item.key === key);
    if (!group) {
      group = {
        key,
        name: module.group?.name ?? 'Sem grupo',
        sortOrder: module.group?.sortOrder ?? 9999,
        modules: [],
      };
      acc.push(group);
    }
    group.modules.push(module);
    return acc;
  }, []);

  grouped.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  grouped.forEach((group) => group.modules.sort((a, b) => a.sortOrder - b.sortOrder));

  return (
    <aside
      className={`fixed bottom-0 left-0 top-14 z-30 flex flex-col bg-cadan-blue-700 text-white
                  shadow-lg transition-[width] duration-200 ${expanded ? 'w-60' : 'w-16'}`}
    >
      <nav className="flex-1 space-y-1 overflow-y-auto px-2.5 py-4">
        {grouped.map((group) => {
          return (
            <div key={group.key} className="space-y-1">
              {expanded && group.key !== 'ungrouped' && (
                <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-white/45">
                  {group.name}
                </p>
              )}
              {group.modules.map((module) => {
                const Icon = moduleIcon(module.icon);
                return (
                  <NavLink
                    key={module.id}
                    to={module.route}
                    end={module.route === '/'}
                    title={expanded ? undefined : module.name}
                    className={({ isActive }) =>
                      `group flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition
                       ${
                         isActive
                           ? 'bg-white/15 text-cadan-yellow-400'
                           : 'text-white/85 hover:bg-white/10 hover:text-white'
                       }`
                    }
                  >
                    <Icon size={20} className="shrink-0" />
                    <span
                      className={`truncate transition-opacity duration-150 ${expanded ? 'opacity-100' : 'sr-only'}`}
                    >
                      {module.name}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-3 py-3">
        <p className={`text-[11px] text-white/50 ${expanded ? '' : 'text-center'}`}>
          {expanded ? 'CadanPlus v0.1.0' : 'v0.1'}
        </p>
      </div>
    </aside>
  );
}
