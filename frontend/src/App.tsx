import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { AdminPage } from './pages/AdminPage';
import { FirstAccessPage } from './pages/FirstAccessPage';
import { HomePage } from './pages/HomePage';
import { InadimplenciaPage } from './pages/InadimplenciaPage';
import { LoginPage } from './pages/LoginPage';
import logoCadan from './assets/logo_cadan.png';

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cadan-blue-700">
      <img src={logoCadan} alt="CADAN" className="h-20 animate-pulse rounded-xl" />
      <p className="text-sm font-medium text-white/80">Carregando CadanPlus...</p>
    </div>
  );
}

/** Exige sessão ativa; força a troca de senha no primeiro acesso. */
function RequireAuth() {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader />;
  if (!profile) return <Navigate to="/login" replace />;
  if (profile.mustChangePassword && location.pathname !== '/primeiro-acesso') {
    return <Navigate to="/primeiro-acesso" replace />;
  }
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/primeiro-acesso" element={<FirstAccessPage />} />
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/dashboards/inadimplencia" element={<InadimplenciaPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
