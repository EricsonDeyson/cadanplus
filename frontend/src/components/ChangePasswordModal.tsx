import { useState, type FormEvent } from 'react';
import { api, ApiError } from '../lib/api';
import { ErrorAlert, PasswordField, SuccessAlert } from './fields';
import { Modal } from './Modal';

export function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

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

    setSaving(true);
    try {
      await api('/api/auth/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword },
      });
      setSuccess(true);
      setTimeout(onClose, 1600);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível alterar a senha');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Alterar Senha" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordField
          label="Senha atual"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          autoFocus
          required
        />
        <PasswordField
          label="Nova senha"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
        />
        <PasswordField
          label="Confirmar nova senha"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />

        {error && <ErrorAlert message={error} />}
        {success && <SuccessAlert message="Senha alterada com sucesso!" />}

        <button
          type="submit"
          disabled={saving || success}
          className="w-full rounded-lg bg-cadan-blue-700 py-2.5 text-sm font-semibold text-white
                     transition hover:bg-cadan-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Salvando...' : 'Salvar nova senha'}
        </button>
      </form>
    </Modal>
  );
}
