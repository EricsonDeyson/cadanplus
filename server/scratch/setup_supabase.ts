/**
 * Provisionamento do Supabase (idempotente — pode rodar mais de uma vez).
 *
 * Cria: tabelas (roles, profiles, modules, role_permissions), RLS + policies,
 * triggers (updated_at e criação automática de profile), bucket de avatars
 * e o primeiro usuário ADMIN.
 *
 * Uso: npm run setup:supabase
 */
import pg from 'pg';
import { supabaseAdmin } from '../clients/supabase';
import { env, supabaseProjectRef } from '../config/env';

const ADMIN_USERNAME = 'ADMIN';
const ADMIN_PASSWORD = '#2026@CAdanReC';
const ADMIN_EMAILS = ['admin@cadanplus.local', 'admin@cadanplus.com'];

const SETUP_SQL = /* sql */ `
-- ============ TABELAS ============

create table if not exists public.roles (
  id serial primary key,
  slug text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username = upper(username)),
  email text not null unique,
  full_name text not null,
  avatar_url text,
  role_id integer references public.roles(id),
  must_change_password boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.modules (
  id serial primary key,
  slug text not null unique,
  name text not null,
  description text,
  icon text,
  route text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  role_id integer not null references public.roles(id) on delete cascade,
  module_id integer not null references public.modules(id) on delete cascade,
  can_view boolean not null default true,
  can_edit boolean not null default false,
  primary key (role_id, module_id)
);

-- ============ TRIGGERS ============

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Cria o profile automaticamente quando um usuário nasce no auth.users.
-- username/full_name/role vêm do app_metadata (controlado pelo backend,
-- nunca editável pelo usuário — ao contrário do user_metadata).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, email, full_name, role_id, must_change_password)
  values (
    new.id,
    upper(coalesce(new.raw_app_meta_data->>'username', split_part(new.email, '@', 1))),
    new.email,
    coalesce(new.raw_app_meta_data->>'full_name', split_part(new.email, '@', 1)),
    (select id from public.roles where slug = coalesce(new.raw_app_meta_data->>'role', 'user')),
    coalesce((new.raw_app_meta_data->>'must_change_password')::boolean, true)
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ RLS ============

alter table public.roles enable row level security;
alter table public.profiles enable row level security;
alter table public.modules enable row level security;
alter table public.role_permissions enable row level security;

-- O backend usa a service role (bypassa RLS). As policies abaixo são o
-- mínimo para leitura pelo frontend autenticado, se um dia for necessário.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (id = (select auth.uid()));

drop policy if exists "roles_select_auth" on public.roles;
create policy "roles_select_auth" on public.roles
  for select to authenticated using (true);

drop policy if exists "modules_select_auth" on public.modules;
create policy "modules_select_auth" on public.modules
  for select to authenticated using (true);

drop policy if exists "role_permissions_select_auth" on public.role_permissions;
create policy "role_permissions_select_auth" on public.role_permissions
  for select to authenticated using (true);

-- ============ SEEDS ============

insert into public.roles (slug, name, description) values
  ('admin', 'Administrador', 'Acesso total ao portal e à área administrativa'),
  ('user', 'Usuário', 'Acesso aos módulos liberados')
on conflict (slug) do nothing;

insert into public.modules (slug, name, description, icon, route, sort_order) values
  ('home', 'Início', 'Página inicial do portal', 'home', '/', 0),
  ('admin', 'Área Administrativa', 'Gestão de usuários, papéis e permissões', 'shield', '/admin', 90)
on conflict (slug) do nothing;

-- admin enxerga tudo (com edição); user enxerga apenas o início
insert into public.role_permissions (role_id, module_id, can_view, can_edit)
select r.id, m.id, true, true
  from public.roles r cross join public.modules m
 where r.slug = 'admin'
on conflict do nothing;

insert into public.role_permissions (role_id, module_id, can_view, can_edit)
select r.id, m.id, true, false
  from public.roles r join public.modules m on m.slug = 'home'
 where r.slug = 'user'
on conflict do nothing;
`;

/** Tenta conexão direta e, se indisponível (IPv6), os poolers regionais. */
async function connect(): Promise<pg.Client> {
  const password = env.SUPABASE_DB_PASSWORD;
  if (!password) throw new Error('Defina SUPABASE_DB_PASSWORD no server/.env');

  const ref = supabaseProjectRef;
  const regions = ['sa-east-1', 'us-east-1', 'us-east-2', 'us-west-1', 'eu-west-1', 'eu-central-1'];
  const candidates = [
    { host: `db.${ref}.supabase.co`, user: 'postgres' },
    ...['aws-0', 'aws-1'].flatMap((prefix) =>
      regions.map((region) => ({ host: `${prefix}-${region}.pooler.supabase.com`, user: `postgres.${ref}` })),
    ),
  ];

  for (const { host, user } of candidates) {
    const client = new pg.Client({
      host,
      port: 5432,
      database: 'postgres',
      user,
      password,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 8_000,
    });
    try {
      await client.connect();
      console.log(`✅ Conectado ao banco do Supabase via ${host}`);
      return client;
    } catch {
      await client.end().catch(() => {});
    }
  }
  throw new Error('Não foi possível conectar ao banco do Supabase por nenhum host conhecido');
}

async function createAvatarsBucket() {
  const { error } = await supabaseAdmin.storage.createBucket('avatars', {
    public: true,
    fileSizeLimit: '2MB',
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
  });
  if (error && !/already exists/i.test(error.message)) {
    throw new Error(`Falha ao criar bucket avatars: ${error.message}`);
  }
  console.log(`✅ Bucket "avatars" ${error ? 'já existia' : 'criado'}`);
}

/**
 * Garante que o perfil tenha os dados corretos. O trigger handle_new_user
 * cobre o INSERT, mas o GoTrue mescla o app_metadata depois do insert —
 * então o ajuste fino do perfil é sempre feito explicitamente aqui (mesmo
 * padrão que a Área Administrativa usará ao criar usuários).
 */
async function ensureAdminProfile(userId: string) {
  const { data: role, error: roleError } = await supabaseAdmin
    .from('roles')
    .select('id')
    .eq('slug', 'admin')
    .single();
  if (roleError) throw new Error(`Papel admin não encontrado: ${roleError.message}`);

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      username: ADMIN_USERNAME,
      full_name: 'Administrador CADAN',
      role_id: role.id,
      must_change_password: false,
      is_active: true,
    })
    .eq('id', userId);
  if (error) throw new Error(`Falha ao ajustar perfil ADMIN: ${error.message}`);
}

async function createAdminUser() {
  const { data: existing, error: lookupError } = await supabaseAdmin
    .from('profiles')
    .select('id, username, email')
    .eq('username', ADMIN_USERNAME)
    .maybeSingle();
  if (lookupError) throw new Error(`Falha ao consultar profiles: ${lookupError.message}`);

  if (existing) {
    await ensureAdminProfile(existing.id);
    console.log(`✅ Usuário ${ADMIN_USERNAME} já existe (${existing.email}) — perfil conferido`);
    return;
  }

  let lastError = '';
  for (const email of ADMIN_EMAILS) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      app_metadata: {
        username: ADMIN_USERNAME,
        full_name: 'Administrador CADAN',
        role: 'admin',
        must_change_password: false,
      },
    });
    if (!error && data.user) {
      await ensureAdminProfile(data.user.id);
      console.log(`✅ Usuário ${ADMIN_USERNAME} criado (${email}, id ${data.user.id})`);
      return;
    }
    lastError = error?.message ?? 'erro desconhecido';
    console.warn(`⚠️  Não foi possível criar com ${email}: ${lastError}`);
  }
  throw new Error(`Falha ao criar usuário ADMIN: ${lastError}`);
}

async function main() {
  console.log(`Provisionando projeto Supabase "${supabaseProjectRef}"...\n`);

  const client = await connect();
  try {
    await client.query(SETUP_SQL);
    console.log('✅ Tabelas, RLS, policies, triggers e seeds aplicados');
    // Recarrega o schema cache do PostgREST para a API REST enxergar as tabelas novas
    await client.query(`notify pgrst, 'reload schema'`);
    await new Promise((resolve) => setTimeout(resolve, 3_000));
  } finally {
    await client.end();
  }

  await createAvatarsBucket();
  await createAdminUser();

  // Verificação final
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, username, email, full_name, must_change_password, role:roles(slug)')
    .eq('username', ADMIN_USERNAME)
    .maybeSingle();
  console.log('\nPerfil ADMIN:', JSON.stringify(profile, null, 2));
  console.log('\n🎉 Provisionamento concluído.');
}

main().catch((err) => {
  console.error('\n❌', err.message ?? err);
  process.exit(1);
});
