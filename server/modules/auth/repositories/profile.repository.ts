import { supabaseAdmin } from '../../../clients/supabase';
import type { ProfileDto } from '../dto/auth.dto';

const PROFILE_SELECT =
  'id, username, email, full_name, avatar_url, must_change_password, is_active, role:roles(id, slug, name)';

function mapProfile(raw: any): ProfileDto {
  const role = Array.isArray(raw.role) ? (raw.role[0] ?? null) : (raw.role ?? null);
  return {
    id: raw.id,
    username: raw.username,
    email: raw.email,
    fullName: raw.full_name,
    avatarUrl: raw.avatar_url,
    role,
    mustChangePassword: raw.must_change_password,
    isActive: raw.is_active,
  };
}

export async function findProfileByUsername(username: string): Promise<ProfileDto | null> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('username', username.trim().toUpperCase())
    .maybeSingle();

  if (error) throw new Error(`Erro ao buscar perfil: ${error.message}`);
  return data ? mapProfile(data) : null;
}

export async function findProfileById(id: string): Promise<ProfileDto | null> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(`Erro ao buscar perfil: ${error.message}`);
  return data ? mapProfile(data) : null;
}

export async function setMustChangePassword(id: string, value: boolean): Promise<void> {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ must_change_password: value })
    .eq('id', id);

  if (error) throw new Error(`Erro ao atualizar perfil: ${error.message}`);
}

export async function updateAvatarUrl(id: string, avatarUrl: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', id);

  if (error) throw new Error(`Erro ao atualizar avatar: ${error.message}`);
}
