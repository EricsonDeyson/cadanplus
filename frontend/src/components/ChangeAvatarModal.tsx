import { Camera, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api, ApiError } from '../lib/api';
import type { Profile } from '../types';
import { Avatar } from './Avatar';
import { ErrorAlert, SuccessAlert } from './fields';
import { Modal } from './Modal';

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB — mesmo limite do bucket
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp'];

export function ChangeAvatarModal({ onClose }: { onClose: () => void }) {
  const { profile, setProfile } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleFile(file: File | undefined) {
    setError('');
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError('Use uma imagem PNG, JPEG ou WebP');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('A imagem deve ter no máximo 2 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!preview) return;
    setSaving(true);
    setError('');
    try {
      const { profile: updated } = await api<{ profile: Profile }>('/api/auth/avatar', {
        method: 'POST',
        body: { dataUrl: preview },
      });
      setProfile(updated);
      setSuccess(true);
      setTimeout(onClose, 1400);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível enviar a foto');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Alterar Foto" onClose={onClose}>
      <div className="flex flex-col items-center gap-4">
        {preview ? (
          <img
            src={preview}
            alt="Pré-visualização"
            className="h-24 w-24 rounded-full border-4 border-cadan-yellow-400 object-cover"
          />
        ) : (
          profile && <Avatar profile={profile} size="lg" />
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm
                     font-medium text-slate-700 transition hover:border-cadan-blue-400 hover:text-cadan-blue-700"
        >
          <Camera size={16} />
          Escolher imagem
        </button>

        {error && <ErrorAlert message={error} />}
        {success && <SuccessAlert message="Foto atualizada com sucesso!" />}

        <button
          type="button"
          onClick={handleSave}
          disabled={!preview || saving || success}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-cadan-blue-700 py-2.5
                     text-sm font-semibold text-white transition hover:bg-cadan-blue-600
                     disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Upload size={16} />
          {saving ? 'Enviando...' : 'Salvar foto'}
        </button>
      </div>
    </Modal>
  );
}
