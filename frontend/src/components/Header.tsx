import { Menu } from 'lucide-react';
import logoCadan from '../assets/logo_cadan.png';
import { useAuth } from '../contexts/AuthContext';
import type { ModuleItem } from '../types';
import { Avatar } from './Avatar';
import { SearchBar } from './SearchBar';
import { SettingsMenu, type SettingsAction } from './SettingsMenu';

interface HeaderProps {
  modules: ModuleItem[];
  onToggleSidebar: () => void;
  onOpenSettings: (action: SettingsAction) => void;
}

export function Header({ modules, onToggleSidebar, onOpenSettings }: HeaderProps) {
  const { profile } = useAuth();

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-3 shadow-sm sm:gap-4 sm:px-4">
      {/* Esquerda: menu + logo + nome */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-cadan-blue-700"
          title="Expandir/recolher menu"
          aria-label="Expandir/recolher menu"
        >
          <Menu size={20} />
        </button>
        <img src={logoCadan} alt="CADAN" className="h-9 w-9 rounded-lg object-contain" />
        <span className="hidden text-lg font-bold tracking-tight sm:block">
          <span className="text-cadan-blue-700">Cadan</span>
          <span className="text-cadan-yellow-500">Plus</span>
        </span>
      </div>

      {/* Centro: busca */}
      <div className="flex flex-1 justify-center">
        <SearchBar modules={modules} onOpenSettings={onOpenSettings} />
      </div>

      {/* Direita: foto do usuário + engrenagem */}
      <div className="flex items-center gap-2">
        {profile && <Avatar profile={profile} size="sm" />}
        <SettingsMenu onAction={onOpenSettings} />
      </div>
    </header>
  );
}
