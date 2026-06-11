import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ChangeAvatarModal } from '../components/ChangeAvatarModal';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import type { SettingsAction } from '../components/SettingsMenu';
import { api } from '../lib/api';
import type { ModuleItem } from '../types';

export interface AppOutletContext {
  modules: ModuleItem[];
}

export function AppLayout() {
  // Sidebar colapsado por padrão
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [openModal, setOpenModal] = useState<SettingsAction | null>(null);

  useEffect(() => {
    api<{ modules: ModuleItem[] }>('/api/modules')
      .then((data) => setModules(data.modules))
      .catch(() => setModules([]));
  }, []);

  return (
    <div className="min-h-screen">
      <Header
        modules={modules}
        onToggleSidebar={() => setSidebarExpanded((value) => !value)}
        onOpenSettings={setOpenModal}
      />
      <Sidebar expanded={sidebarExpanded} modules={modules} />

      <main
        className={`min-h-screen pt-14 transition-[padding] duration-200 ${sidebarExpanded ? 'pl-60' : 'pl-16'}`}
      >
        <div className="mx-auto max-w-7xl p-6">
          <Outlet context={{ modules } satisfies AppOutletContext} />
        </div>
      </main>

      {openModal === 'password' && <ChangePasswordModal onClose={() => setOpenModal(null)} />}
      {openModal === 'avatar' && <ChangeAvatarModal onClose={() => setOpenModal(null)} />}
    </div>
  );
}
