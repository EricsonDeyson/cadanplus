import { ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logoCadan from '../assets/logo_cadan.png';
import { ErrorAlert, PasswordField } from '../components/fields';
import { useAuth } from '../contexts/AuthContext';
import { api, ApiError } from '../lib/api';

/**
 * Primeiro acesso: o admin criou o usuário com senha temporária
 * (must_change_password = true) e o portal força a definição de
 * uma senha nova antes de liberar o acesso.
 */
export function FirstAccessPage() {
  const { profile, setProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const tempPassword = (location.state as { tempPassword?: string } | null)?.tempPassword ?? '';

  const [currentPassword, setCurrentPassword] = useState(tempPassword);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('A nova senha deve ter no mínimo 8 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('A confirmação não confere com a nova senha');
      return;
    }

    setSubmitting(true);
    try {
      await api('/api/auth/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword },
      });
      if (profile) setProfile({ ...profile, mustChangePassword: false });
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível alterar a senha');
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cadan-blue-800 via-cadan-blue-700 to-cadan-blue-950 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <img src={logoCadan} alt="CADAN" className="h-16 rounded-xl object-contain" />
          <div>
            <h1 className="flex items-center justify-center gap-2 text-xl font-bold text-cadan-blue-700">
              <ShieldCheck size={20} className="text-cadan-yellow-500" />
              Primeiro acesso
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Olá, <strong>{profile?.fullName}</strong>! Por segurança, defina a sua nova senha
              para continuar.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!tempPassword && (
            <PasswordField
              label="Senha temporária"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />
          )}
          <PasswordField
            label="Nova senha"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="Mínimo de 8 caracteres"
            autoFocus
            required
          />
          <PasswordField
            label="Confirmar nova senha"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />

          {error && <ErrorAlert message={error} />}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-cadan-yellow-400 py-2.5 text-sm font-bold text-cadan-blue-900
                       transition hover:bg-cadan-yellow-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Salvando...' : 'Definir senha e entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
