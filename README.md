# CadanPlus — Portal de Relatórios CADAN

Portal de relatórios da CADAN. Frontend em React + Tailwind, API em Express e
autenticação via Supabase Auth (JWT). Os dados dos dashboards vêm de views do
PostgreSQL `PBICadan` — consumidas **somente** pelo backend.

## Identidade visual

| Cor     | Hex       | Uso                              |
| ------- | --------- | -------------------------------- |
| Azul    | `#2d376f` | Sidebar, títulos, botões         |
| Amarelo | `#fab82c` | Destaques, botão de login, marca |

A paleta completa (tons 50–950) está em `frontend/src/index.css` como tokens
Tailwind (`cadan-blue-*` e `cadan-yellow-*`).

## Estrutura

```text
cadanplus/
├── frontend/   # React 19 + Vite + Tailwind v4 (porta 5173)
└── server/     # Express 5 + TS — auth, permissões e dados (porta 3001)
```

Detalhes da API e do modelo de dados: [server/README.md](server/README.md).

## Como rodar

```bash
npm run install:all   # instala server e frontend
npm run dev           # sobe API (3001) e frontend (5173) juntos
```

Variáveis de ambiente: copie `server/.env.example` → `server/.env` e
`frontend/.env.example` → `frontend/.env` e preencha.

Primeiro provisionamento do Supabase (já executado neste projeto):

```bash
cd server && npm run setup:supabase
```

## Login

Acesso por **nome de usuário** (ex.: `EREIS`) + senha. Usuários são criados na
Área Administrativa com senha temporária; no primeiro acesso o portal força a
definição de uma senha nova. A engrenagem no header dá acesso a Alterar Senha
e Alterar Foto.
