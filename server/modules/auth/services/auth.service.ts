import { supabaseAdmin, supabaseAuth } from '../../../clients/supabase';
import { badRequest, unauthorized } from '../../../utils/httpError';
import type { LoginResponseDto, ProfileDto } from '../dto/auth.dto';
import {
  findProfileById,
  findProfileByUsername,
  setMustChangePassword,
  updateAvatarUrl,
} from '../repositories/profile.repository';

const AVATAR_BUCKET = 'avatars';
const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const AVATAR_MIMES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

/**
 * Login por nome de usuário (ex.: EREIS) — resolve o e-mail no perfil
 * e valida a senha no Supabase Auth. A mensagem de erro é genérica de
 * propósito, para não revelar se o usuário existe.
 */
export async function login(username: string, password: string): Promise<LoginResponseDto> {
  const invalid = unauthorized('Usuário ou senha inválidos');

  const profile = await findProfileByUsername(username);
  if (!profile || !profile.isActive) throw invalid;

  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email: profile.email,
    password,
  });
  if (error || !data.session) throw invalid;

  return {
    session: {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at ?? null,
    },
    profile,
  };
}

export async function getProfile(userId: string): Promise<ProfileDto> {
  const profile = await findProfileById(userId);
  if (!profile) throw unauthorized('Perfil não encontrado');
  return profile;
}

/**
 * Troca de senha — exige a senha atual (cobre também o primeiro acesso,
 * em que o usuário conhece a senha temporária criada pelo admin).
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const profile = await getProfile(userId);

  const { error: wrongPassword } = await supabaseAuth.auth.signInWithPassword({
    email: profile.email,
    password: currentPassword,
  });
  if (wrongPassword) throw badRequest('Senha atual incorreta');

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });
  if (error) throw badRequest(`Não foi possível alterar a senha: ${error.message}`);

  await setMustChangePassword(userId, false);
}

/**
 * Recebe a foto como data URL (base64), sobe no bucket `avatars`
 * e grava a URL pública no perfil.
 */
export async function updateAvatar(userId: string, dataUrl: string): Promise<ProfileDto> {
  const match = dataUrl.match(/^data:(image\/[a-z+.-]+);base64,(.+)$/);
  if (!match) throw badRequest('Formato de imagem inválido');

  const [, mime, base64] = match;
  const ext = AVATAR_MIMES[mime];
  if (!ext) throw badRequest('Use uma imagem PNG, JPEG ou WebP');

  const buffer = Buffer.from(base64, 'base64');
  if (buffer.byteLength > AVATAR_MAX_BYTES) throw badRequest('A imagem deve ter no máximo 2 MB');

  const path = `${userId}.${ext}`;
  const { error } = await supabaseAdmin.storage
    .from(AVATAR_BUCKET)
    .upload(path, buffer, { contentType: mime, upsert: true });
  if (error) throw badRequest(`Falha ao enviar a imagem: ${error.message}`);

  const { data } = supabaseAdmin.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  const avatarUrl = `${data.publicUrl}?v=${Date.now()}`;

  await updateAvatarUrl(userId, avatarUrl);
  return getProfile(userId);
}
