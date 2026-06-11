import { Camera, KeyRound, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { moduleIcon } from '../lib/icons';
import type { ModuleItem } from '../types';
import type { SettingsAction } from './SettingsMenu';

interface SearchBarProps {
  modules: ModuleItem[];
  onOpenSettings: (action: SettingsAction) => void;
}

const SETTINGS_ITEMS = [
  { action: 'password' as const, name: 'Alterar Senha', icon: KeyRound },
  { action: 'avatar' as const, name: 'Alterar Foto', icon: Camera },
];

function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export function SearchBar({ modules, onOpenSettings }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const q = normalize(query.trim());
  const filteredModules = modules.filter(
    (m) => !q || normalize(m.name).includes(q) || normalize(m.description ?? '').includes(q),
  );
  const filteredSettings = SETTINGS_ITEMS.filter((s) => !q || normalize(s.name).includes(q));

  function close() {
    setOpen(false);
    setQuery('');
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') close();
        }}
        placeholder="Procurar módulos ou configurações..."
        className="h-9 w-full rounded-full border border-slate-200 bg-slate-100 pl-10 pr-4 text-sm
                   text-slate-700 placeholder:text-slate-400 outline-none transition
                   focus:border-cadan-blue-400 focus:bg-white focus:ring-2 focus:ring-cadan-blue-500/20"
      />

      {open && (filteredModules.length > 0 || filteredSettings.length > 0) && (
        <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
          {filteredModules.length > 0 && (
            <>
              <p className="px-4 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Módulos
              </p>
              {filteredModules.map((module) => {
                const Icon = moduleIcon(module.icon);
                return (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => {
                      close();
                      navigate(module.route);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-cadan-blue-50"
                  >
                    <Icon size={16} className="shrink-0 text-cadan-blue-600" />
                    <span className="font-medium">{module.name}</span>
                    {module.description && (
                      <span className="truncate text-xs text-slate-400">{module.description}</span>
                    )}
                  </button>
                );
              })}
            </>
          )}

          {filteredSettings.length > 0 && (
            <>
              <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Configurações
              </p>
              {filteredSettings.map((item) => (
                <button
                  key={item.action}
                  type="button"
                  onClick={() => {
                    close();
                    onOpenSettings(item.action);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-cadan-blue-50"
                >
                  <item.icon size={16} className="shrink-0 text-cadan-blue-600" />
                  <span className="font-medium">{item.name}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
