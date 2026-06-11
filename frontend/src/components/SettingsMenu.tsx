import { Camera, KeyRound, LogOut, Settings } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export type SettingsAction = 'password' | 'avatar';

interface SettingsMenuProps {
  onAction: (action: SettingsAction) => void;
}

export function SettingsMenu({ onAction }: SettingsMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    setOpen(false);
    await logout();
    navigate('/login');
  }

  function pick(action: SettingsAction) {
    setOpen(false);
    onAction(action);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`flex h-9 w-9 items-center justify-center rounded-full transition
                    ${open ? 'bg-cadan-blue-50 text-cadan-blue-700' : 'text-slate-500 hover:bg-slate-100 hover:text-cadan-blue-700'}`}
        title="Configurações"
        aria-label="Configurações"
      >
        <Settings size={20} />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl">
          {profile && (
            <div className="border-b border-slate-100 px-4 py-2.5">
              <p className="truncate text-sm font-semibold text-slate-800">{profile.fullName}</p>
              <p className="text-xs text-slate-400">@{profile.username}</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => pick('password')}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-cadan-blue-50"
          >
            <KeyRound size={16} className="text-cadan-blue-600" />
            Alterar Senha
          </button>
          <button
            type="button"
            onClick={() => pick('avatar')}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-cadan-blue-50"
          >
            <Camera size={16} className="text-cadan-blue-600" />
            Alterar Foto
          </button>
          <div className="my-1.5 border-t border-slate-100" />
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
