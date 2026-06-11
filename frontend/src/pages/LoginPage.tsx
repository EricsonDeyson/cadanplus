import { LogIn } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import backgroundVideo from '../assets/backgroud.mp4';
import logoCadan from '../assets/logo_cadan.png';
import { ErrorAlert, PasswordField, TextField } from '../components/fields';
import { useAuth } from '../contexts/AuthContext';
import { ApiError } from '../lib/api';

export function LoginPage() {
  const { profile, loading, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && profile) return <Navigate to="/" replace />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const logged = await login(username, password);
      if (logged.mustChangePassword) {
        // Leva a senha temporária em memória para o fluxo de primeiro acesso
        navigate('/primeiro-acesso', { state: { tempPassword: password } });
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível entrar. Tente novamente.');
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-cadan-blue-800 via-cadan-blue-700 to-cadan-blue-950 p-4">
      <video
        className="absolute inset-0 h-full w-full scale-105 object-cover blur-sm"
        src={backgroundVideo}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-cadan-blue-950/75" />
      <div className="absolute inset-0 bg-gradient-to-br from-cadan-blue-700/65 via-cadan-blue-800/55 to-cadan-blue-950/85" />

      <div className="relative w-full max-w-sm">
        <div className="rounded-2xl border border-white/30 bg-white/95 p-8 shadow-2xl shadow-cadan-blue-950/40 backdrop-blur-md">
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <img src={logoCadan} alt="CADAN" className="h-24 rounded-xl object-contain" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                <span className="text-cadan-blue-700">CADAN</span>
                <span className="text-cadan-yellow-500">Plus</span>
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">Portal de Relatórios</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              label="Usuário"
              value={username}
              onChange={(event) => setUsername(event.target.value.toUpperCase())}
              placeholder="Ex.: EREIS"
              autoComplete="username"
              autoCapitalize="characters"
              spellCheck={false}
              className="uppercase"
              autoFocus
              required
            />
            <PasswordField
              label="Senha"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Sua senha"
              autoComplete="current-password"
              required
            />

            {error && <ErrorAlert message={error} />}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-cadan-yellow-400 py-2.5
                         text-sm font-bold text-cadan-blue-900 transition hover:bg-cadan-yellow-300
                         disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LogIn size={16} />
              {submitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-white/60">
          © {new Date().getFullYear()} CADAN — Nossa missão é servir.
        </p>
      </div>
    </div>
  );
}
