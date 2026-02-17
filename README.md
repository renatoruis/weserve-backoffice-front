# Church App Backoffice

Painel de administracao para gerir o conteudo do app da igreja. Construido com Next.js, Tailwind CSS e autenticacao via Auth0.

## Features

- **Dashboard** -- Visao geral com contadores de eventos, sermoes, pedidos de oracao, avisos e assinantes push
- **Church Details** -- Configuracao de nome, logo, endereco (Google Places), cores do tema, horarios de culto, links sociais e URL de doacoes
- **Home / Banner** -- Gestao do banner principal e controle de live stream
- **Events** -- CRUD completo de eventos com i18n (PT/EN), data, hora, localizacao e imagem
- **Sermons** -- CRUD de sermoes com i18n, video do YouTube, tags, data e upload de materiais
- **Notices** -- CRUD de avisos com i18n e status de publicacao
- **Prayer Requests** -- Visualizacao e gestao dos pedidos de oracao
- **Groups / Cells** -- CRUD de grupos com i18n, lider, dia, horario e localizacao
- **Bible Versions** -- Configuracao das versoes da Biblia disponiveis (integracao YouVersion)
- **Pages (CMS)** -- CRUD de paginas customizadas com i18n, slug, imagem de capa e ordenacao
- **Blog** -- CRUD de posts de blog com i18n, autor, tags e data de publicacao
- **Push Notifications** -- Envio de notificacoes push para todos os assinantes
- **Access Control** -- Autenticacao Auth0 + autorizacao por email ou roles

## Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Auth0](https://auth0.com/) (autenticacao e autorizacao)
- [TypeScript](https://www.typescriptlang.org/)

## Architecture

- **Design System** (`src/components/ui/`) -- Button, Input, Badge, Skeleton, EmptyState, Pagination
- **Hooks** (`src/hooks/`) -- `useApi` (GET + paginacao + loading), `useSubmit` (mutation + button lock)
- **I18n Fields** -- Componente reutilizavel com tabs PT/EN para campos multilingues
- **Mobile-first** -- Sidebar como drawer no mobile, DataTable como cards, Modal fullscreen
- **Server-side proxy** -- Todas as chamadas a API passam por `/api/proxy/admin/` (token e URL do backend nunca expostos ao browser)

## Security

- Nenhuma variavel `NEXT_PUBLIC_` contem secrets -- a URL da API e apenas server-side (`API_URL`)
- Middleware protege todas as rotas `/dashboard/*` com verificacao de sessao + permissao
- Autorizacao por lista de emails (`ALLOWED_EMAILS`) e/ou roles do Auth0 (`admin`)

## Setup local

```bash
cp .env.example .env
pnpm install
pnpm dev
```

O app roda em [http://localhost:8001](http://localhost:8001).

## Environment Variables

| Variable | Description |
|---|---|
| `AUTH0_SECRET` | Secret para encriptar cookies de sessao (min 32 chars) |
| `AUTH0_DOMAIN` | Dominio do tenant Auth0 |
| `AUTH0_CLIENT_ID` | Client ID da aplicacao Auth0 |
| `AUTH0_CLIENT_SECRET` | Client Secret da aplicacao Auth0 |
| `AUTH0_AUDIENCE` | Audience da API Auth0 |
| `APP_BASE_URL` | URL base do app (ex: `http://localhost:8001`) |
| `API_URL` | URL do backend da API (server-side only) |
| `ALLOWED_EMAILS` | Lista de emails permitidos, separados por virgula |

## Deploy (Vercel)

1. Conectar o repositorio na [Vercel](https://vercel.com)
2. Framework Preset: **Next.js** (detectado automaticamente)
3. Adicionar todas as variaveis de ambiente no painel da Vercel
4. Atualizar `APP_BASE_URL` para o dominio de producao
5. Atualizar as URLs de callback e logout no Auth0
6. Deploy!

## Project Structure

```
src/
├── app/
│   ├── api/proxy/admin/[...path]/   # Server-side API proxy
│   ├── dashboard/
│   │   ├── DashboardShell.tsx        # Client shell (sidebar + header)
│   │   ├── layout.tsx                # Auth guard
│   │   ├── page.tsx                  # Dashboard home
│   │   ├── agenda/                   # Events CRUD
│   │   ├── avisos/                   # Notices CRUD
│   │   ├── biblia/                   # Bible Versions CRUD
│   │   ├── blog/                     # Blog CRUD
│   │   ├── grupos/                   # Groups CRUD
│   │   ├── home-content/             # Banner + Live
│   │   ├── igreja/                   # Church settings
│   │   ├── oracoes/                  # Prayer requests
│   │   ├── pages/                    # CMS Pages CRUD
│   │   ├── push/                     # Push Notifications
│   │   └── sermoes/                  # Sermons CRUD
│   ├── unauthorized/                 # Access denied
│   └── page.tsx                      # Login
├── components/
│   ├── ui/                           # Design system
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── EmptyState.tsx
│   │   ├── Input.tsx
│   │   ├── Pagination.tsx
│   │   └── Skeleton.tsx
│   ├── DataTable.tsx                 # Table + mobile cards + pagination
│   ├── FileUpload.tsx                # Multi-file upload
│   ├── FormField.tsx                 # Simple form field
│   ├── GooglePlacesInput.tsx         # Address autocomplete
│   ├── Header.tsx                    # Top bar + hamburger
│   ├── I18nField.tsx                 # i18n field with PT/EN tabs
│   ├── ImageUpload.tsx               # Image upload with preview
│   ├── Modal.tsx                     # Modal (sheet on mobile)
│   └── Sidebar.tsx                   # Navigation (drawer on mobile)
├── hooks/
│   ├── useApi.ts                     # GET + pagination + loading
│   └── useSubmit.ts                  # Mutation + duplicate guard
├── lib/
│   └── auth0.ts                      # Auth0 config
└── middleware.ts                      # Auth + authorization
```
