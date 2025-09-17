# Task API — Fastify + JWT + RBAC + PostgreSQL

API de gerenciamento de tarefas com autenticação JWT (access + refresh token), controle de acesso por função (RBAC), testes automatizados, documentação Swagger, Docker e CI no GitHub Actions.

## ✨ Features
- **Node.js + Fastify** com CORS, logs e OpenAPI/Swagger.
- **Auth JWT**: cadastro, login, refresh, logout, `/auth/me`.
- **RBAC**: `user` gerencia apenas suas tarefas; `admin` gerencia todas.
- **Tasks CRUD** com filtros, paginação e busca.
- **PostgreSQL** com migrations via `node-pg-migrate`.
- **Testes** (Vitest + Supertest): integração para Auth e Tasks.
- **Docker** (API + DB) e **docker-compose**.
- **CI** no GitHub Actions: lint + testes a cada push/PR.
- **Husky + lint-staged**: pre-commit/pre-push.

---

## 🧱 Stack
- Node 20+, Fastify, @fastify/jwt, @fastify/swagger, Zod
- PostgreSQL 16, `pg`, `node-pg-migrate`
- Vitest, Supertest, ESLint, Prettier
- Docker, Docker Compose, GitHub Actions

---

## 📂 Estrutura de pastas
```
 task-api/
 ├─ src/
 │  ├─ app.js
 │  ├─ server.js
 │  ├─ config/
 │  │  ├─ env.js
 │  │  └─ db.js
 │  ├─ routes/
 │  │  ├─ auth.routes.js
 │  │  └─ tasks.routes.js
 │  ├─ controllers/
 │  │  ├─ auth.controller.js
 │  │  └─ tasks.controller.js
 │  ├─ services/
 │  │  ├─ auth.service.js
 │  │  └─ tasks.service.js
 │  ├─ repositories/
 │  │  ├─ users.repo.js
 │  │  ├─ tasks.repo.js
 │  │  └─ refreshTokens.repo.js
 │  ├─ middlewares/
 │  │  ├─ auth.js (se usar)
 │  │  └─ rbac.js (se usar)
 │  ├─ schemas/
 │  │  ├─ auth.schema.js
 │  │  └─ task.schema.js
 │  └─ tests/
 │     ├─ helpers/test-app.js
 │     └─ integration/
 │        ├─ auth.test.js
 │        └─ tasks.test.js
 ├─ migrations/ (ou db/migrations)
 ├─ db/seeds/index.js
 ├─ docs/openapi.js
 ├─ .env (local)
 ├─ .env.docker (prod compose)
 ├─ Dockerfile
 ├─ docker-compose.yml
 ├─ vitest.config.js
 ├─ .eslintrc.json, prettier.config.cjs, .editorconfig, etc.
```

---

## 🚀 Como rodar (dev local)
### Pré-requisitos
- Node.js 20+
- Docker + Docker Compose

### Passos
1. **Instale dependências**
   ```bash
   npm install
   ```
2. **Suba o PostgreSQL** (mapeado na porta **5433** do host)
   ```bash
   docker compose up -d  # serviço db
   ```
3. **Crie o `.env`** (exemplo):
   ```dotenv
   PORT=3000
   DATABASE_URL=postgres://postgres:postgres@localhost:5433/task_api
   JWT_SECRET=supersecret-change-me
   JWT_EXPIRES_IN=15m
   REFRESH_EXPIRES_IN=7d
   ```
4. **Migrations**
   ```bash
   npm run db:migrate:up
   ```
5. **Rodar API**
   ```bash
   npm run dev
   # GET http://localhost:3000/health
   # Docs: http://localhost:3000/docs
   ```

> Dica (Windows): se tiver Postgres local na 5432, manter o container na 5433 evita conflitos. Use sempre a `DATABASE_URL` com `:5433` no dev.

---

## 🔐 Autenticação & RBAC
- **Payload do access token** inclui `sub` (id do user), `email`, `role`.
- **RBAC**: `user` só pode CRUD nas próprias tasks; `admin` em todas.

### Endpoints de Auth
- `POST /auth/register` — `{ name, email, password }`
- `POST /auth/login` — `{ email, password }`
- `POST /auth/refresh` — `{ refreshToken }`
- `GET  /auth/me` — Bearer access token
- `POST /auth/logout` — Bearer; body opcional `{ refreshToken }`

### Exemplo (curl)
```bash
# register
curl -X POST http://localhost:3000/auth/register   -H "Content-Type: application/json"   -d '{"name":"Alice","email":"alice@example.com","password":"123456"}'

# me
curl http://localhost:3000/auth/me -H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

## 🧾 Tasks — Endpoints
- `POST   /tasks` — cria task do usuário autenticado
- `GET    /tasks?scope=mine|all&status=&q=&page=&limit=` — lista
- `GET    /tasks/:id` — obtém uma task (autorização por dono/admin)
- `PUT    /tasks/:id` — atualiza (title/description/status)
- `DELETE /tasks/:id` — exclui

**RBAC**:
- `scope=all` só para `admin`.
- `get/put/delete` verifica dono ou `role=admin`.

---

## 🧪 Testes (Vitest + Supertest)
- Arquivos em `src/tests/integration/`
- Execução:
  ```bash
  npm test         # uma vez
  npm run test:watch
  ```
- `vitest.config.js` desabilita paralelismo para evitar `TRUNCATE` concorrente.
- O serviço de banco precisa estar no ar (use o container de dev).

---

## 🧰 Migrations
- Criar migration: `npx node-pg-migrate create <nome> --dir migrations`  
  (ou `db/migrations` se preferir)
- Subir/Descer:
  ```bash
  npm run db:migrate:up
  npm run db:migrate:down
  ```

> Em ambiente Docker da API, as migrations sobem automaticamente no `CMD`.

---

## 🌱 Seeds
- Script: `db/seeds/index.js` (idempotente)
- Criar admin (padrão: `admin@example.com` / `Admin123!`):
  ```bash
  npm run db:seed
  ```
- Customizar (Windows):
  ```powershell
  $env:ADMIN_EMAIL="admin@local.test"; $env:ADMIN_PASS="Admin123!"; npm run db:seed
  ```
- Com demo tasks:
  ```bash
  npm run db:seed:demo
  ```
- Remover:
  ```bash
  npm run db:seed:down
  ```

---

## 📘 Swagger / OpenAPI
- UI: `GET /docs`
- Autorização no Swagger: clique **Authorize** e cole `Bearer <ACCESS_TOKEN>`
- Schemas reutilizáveis adicionados em `docs/openapi.js` (`User`, `AuthResponse`, `Task`).

---

## 🐳 Docker & Compose
### Dockerfile
- Base `node:20-alpine`, `npm ci --omit=dev`, `EXPOSE 3000`.
- `CMD` roda migrations e sobe `src/server.js`.

### docker-compose (API + DB)
- Serviço `db` (Postgres) com healthcheck.
- Serviço `api` depende de `db` saudável e usa `DATABASE_URL=postgres://postgres:postgres@db:5432/task_api`.
- Variáveis de API em `.env.docker` (sem `DATABASE_URL`, definido no compose).

**Subir**:
```bash
docker compose up -d --build
curl http://localhost:3000/health
```

---

## 🤖 CI / GitHub Actions
- Workflow: `.github/workflows/ci.yml`.
- Sobe Postgres como service, roda `npm ci`, `db:migrate:up`, `lint`, `test`.
- Roda em qualquer push e PR para `develop`/`main`.

---

## 🪝 Husky + lint-staged
- Hooks configurados:
  - `pre-commit`: `lint-staged` (ESLint + Prettier nos arquivos alterados)
  - `pre-push`: `npm run lint && npm test`
- Pular hooks: `git commit --no-verify` / `git push --no-verify` (evite em produção 😉)

---

## 🌿 Git Flow
- `main` — produção
- `develop` — integração
- `feature/*` — novas features → PR para `develop`
- `release/*` — estabilização → PR para `main`
- `hotfix/*` — correções urgentes → `main` e back-merge para `develop`

---

## 🧩 Insomnia (ambiente sugerido)
```json
{
  "base_url": "http://localhost:3000",
  "access_token": "",
  "refresh_token": ""
}
```
> Em cada request: `Authorization: Bearer {{ access_token }}`.

---

## 🛠️ Troubleshooting
- **Erro 28P01 (senha)**: pode ser Postgres local na 5432. Use o container ouvindo 5433 e `DATABASE_URL` com `:5433`.
- **Migrations não encontradas**: use `migrations/` (padrão) **ou** configure `--dir`/`node-pg-migrate` no `package.json`. Em ambientes ESM, use `.cjs` nas migrations CommonJS.
- **`psql` não reconhecido (Windows)**: use o `psql` do container: `docker exec -it task_api_db psql -U postgres -d task_api -c "SELECT 1;"`.
- **JWT 401**: verifique `Authorization: Bearer <token>` e expiração (`JWT_EXPIRES_IN`).

---

## 📄 Licença
MIT — ajuste conforme sua necessidade.

## Links úteis
- /docs
- /health


## Links úteis
- /docs
- /health

## Deploy (Koyeb)
- Base URL: https://monthly-jeralee-thalysson4-ed98086e.koyeb.app
- Health: https://monthly-jeralee-thalysson4-ed98086e.koyeb.app/health
- Swagger: https://monthly-jeralee-thalysson4-ed98086e.koyeb.app/docs

### Insomnia (ambiente)
{
  "base_url": "https://monthly-jeralee-thalysson4-ed98086e.koyeb.app",
  "access_token": "",
  "refresh_token": ""
}
