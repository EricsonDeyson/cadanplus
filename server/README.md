# CadanPlus — Server

API do portal de relatórios CadanPlus. Express 5 + TypeScript, autenticação via
Supabase Auth (JWT) e dados de dashboards vindos do PostgreSQL `PBICadan`
(schema `pbi`). Toda regra de acesso a dados fica aqui — o frontend nunca fala
direto com os bancos.

## Estrutura de Pastas

```text
server/
├── clients/          # Clientes externos (Supabase admin/auth)
├── config/           # Env validada com zod
├── middlewares/      # requireAuth (JWT), errorHandler
├── modules/          # Módulos de negócio (padrão abaixo)
├── scratch/          # Scripts utilitários (provisionamento, experimentos)
├── services/         # Serviços compartilhados entre módulos
├── types/            # Tipagens globais (Express Request etc.)
├── utils/            # HttpError, validação zod
├── app.ts            # Instância do Express (middlewares + rotas)
├── index.ts          # Entry point (listen)
├── postgres.ts       # Pool do PBICadan (views dos dashboards)
├── test_postgres.ts  # Teste de conectividade com o PBICadan
└── tsconfig.json
```

Cada módulo segue o padrão:

```text
modules/
└── nome-modulo/
    ├── controllers/    # Recebe req/res, valida input, chama o service
    ├── dto/            # Tipos de entrada/saída da API
    ├── repositories/   # Acesso a dados (Supabase ou PBICadan)
    ├── routes/         # Router do Express
    ├── schemas/        # Schemas zod de validação
    └── services/       # Regra de negócio
```

## Scripts

| Comando                  | Descrição                                            |
| ------------------------ | ---------------------------------------------------- |
| `npm run dev`            | Sobe a API em modo watch (porta 3001)                |
| `npm run setup:supabase` | Provisiona o Supabase (tabelas, RLS, bucket, ADMIN)  |
| `npm run test:postgres`  | Testa a conexão com o PBICadan e lista as views      |
| `npm run typecheck`      | Checagem de tipos                                    |

## Endpoints

| Método | Rota                        | Auth | Descrição                                  |
| ------ | --------------------------- | ---- | ------------------------------------------ |
| GET    | `/api/health`               | —    | Healthcheck                                |
| POST   | `/api/auth/login`           | —    | Login por username + senha                 |
| GET    | `/api/auth/me`              | JWT  | Perfil do usuário autenticado              |
| POST   | `/api/auth/change-password` | JWT  | Troca de senha (exige a senha atual)       |
| POST   | `/api/auth/avatar`          | JWT  | Upload da foto de perfil (data URL base64) |
| GET    | `/api/modules`              | JWT  | Módulos visíveis para o papel do usuário   |

## Autenticação

1. O frontend manda `{ username, password }` para `/api/auth/login`.
2. O server resolve o e-mail pelo `username` (tabela `profiles`, service role)
   e valida a senha no Supabase Auth (`signInWithPassword`).
3. Devolve `access_token`/`refresh_token` do Supabase + perfil.
4. Rotas protegidas exigem `Authorization: Bearer <access_token>`, validado
   pelo middleware `requireAuth`.

Usuários são criados pela Área Administrativa com senha temporária
(`must_change_password = true`) — no primeiro acesso o portal força a troca.

## Modelo de dados (Supabase)

- `profiles` — espelho de `auth.users` (criado por trigger) com `username`,
  `full_name`, `avatar_url`, `role_id`, `must_change_password`, `is_active`.
- `roles` — papéis (`admin`, `user`, ...).
- `modules` — módulos do portal (sidebar/busca).
- `role_permissions` — o que cada papel vê/edita.

Tudo com RLS habilitado; o server opera com a service role.
