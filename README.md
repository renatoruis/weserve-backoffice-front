# Church App Backoffice

Painel de administração para gerir o conteúdo do app da igreja. Construído com Next.js, Tailwind CSS e autenticação via Auth0.

## Features

- **Dashboard** — Visão geral com contadores de eventos, sermões, pedidos de oração, avisos e assinantes push
- **Dados da Igreja** — Configuração de nome, logo, endereço (com Google Places), cores do tema, horários de culto, links sociais e URL de doações
- **Home / Banner** — Gestão do banner principal e controle de live stream (liga/desliga + URL)
- **Agenda** — CRUD completo de eventos com data, hora, localização (Google Places) e imagem
- **Sermões** — CRUD de sermões com vídeo do YouTube, tags, data e upload de materiais (PDF, DOC, PPT, imagens)
- **Avisos** — CRUD de avisos com status de publicação (Published/Draft)
- **Pedidos de Oração** — Visualização e gestão dos pedidos de oração dos fiéis
- **Grupos / Células** — CRUD de grupos com líder, dia, horário, localização e descrição
- **Versões da Bíblia** — Configuração das versões da Bíblia disponíveis no app (integração YouVersion)
- **Push Notifications** — Envio de notificações push para todos os assinantes do app
- **Controle de Acesso** — Autenticação Auth0 + autorização por email ou roles

## Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Auth0](https://auth0.com/) (autenticação e autorização)
- [TypeScript](https://www.typescriptlang.org/)

## Segurança

- Todas as chamadas à API backend são feitas via **server-side proxy** (`/api/proxy/admin/...`), de modo que o token de autenticação e a URL do backend nunca são expostos ao browser
- Nenhuma variável `NEXT_PUBLIC_` contém secrets — a URL da API é apenas server-side (`API_URL`)
- Middleware protege todas as rotas `/dashboard/*` com verificação de sessão + permissão
- Autorização por lista de emails (`ALLOWED_EMAILS`) e/ou roles do Auth0 (`admin`)

## Setup local

```bash
# 1. Clonar e instalar
git clone <repo-url>
cd church-app-backoffice
cp .env.example .env
pnpm install

# 2. Preencher .env com as credenciais (ver seção abaixo)

# 3. Executar
pnpm dev
```

O app roda em [http://localhost:8001](http://localhost:8001).

## Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `AUTH0_SECRET` | Secret para encriptar cookies de sessão (min 32 chars) |
| `AUTH0_DOMAIN` | Domínio do tenant Auth0 |
| `AUTH0_CLIENT_ID` | Client ID da aplicação Auth0 |
| `AUTH0_CLIENT_SECRET` | Client Secret da aplicação Auth0 |
| `AUTH0_AUDIENCE` | Audience da API Auth0 |
| `APP_BASE_URL` | URL base do app (ex: `http://localhost:8001`) |
| `API_URL` | URL do backend da API (server-side only) |
| `ALLOWED_EMAILS` | Lista de emails permitidos, separados por vírgula |

## Auth0 Setup

1. Criar Application (Regular Web App) no Auth0
2. Configurar callback URL: `{APP_BASE_URL}/auth/callback`
3. Configurar logout URL: `{APP_BASE_URL}`
4. Criar API no Auth0 com identifier correspondente ao `AUTH0_AUDIENCE`
5. Preencher `.env` com credenciais

## Deploy na Vercel

1. Conectar o repositório na [Vercel](https://vercel.com)
2. Framework Preset: **Next.js** (detectado automaticamente)
3. Adicionar todas as variáveis de ambiente (ver tabela acima) no painel da Vercel em **Settings > Environment Variables**
4. Atualizar `APP_BASE_URL` para o domínio de produção (ex: `https://admin.suaigreja.com`)
5. Atualizar as URLs de callback e logout no Auth0 para o domínio de produção
6. Deploy!

## Estrutura do Projeto

```
src/
├── app/
│   ├── api/proxy/admin/[...path]/   # Proxy server-side para a API
│   ├── dashboard/
│   │   ├── agenda/                   # Eventos
│   │   ├── avisos/                   # Avisos
│   │   ├── biblia/                   # Versões da Bíblia
│   │   ├── grupos/                   # Grupos / Células
│   │   ├── home-content/             # Banner + Live
│   │   ├── igreja/                   # Dados da igreja
│   │   ├── oracoes/                  # Pedidos de oração
│   │   ├── push/                     # Push Notifications
│   │   └── sermoes/                  # Sermões
│   ├── unauthorized/                 # Página de acesso negado
│   └── page.tsx                      # Login
├── components/                       # Componentes reutilizáveis
│   ├── DataTable.tsx                 # Tabela genérica com Edit/Delete
│   ├── FileUpload.tsx                # Upload de arquivos
│   ├── FormField.tsx                 # Campo de formulário
│   ├── GooglePlacesInput.tsx         # Input com autocomplete de endereço
│   ├── Header.tsx                    # Header do dashboard
│   ├── ImageUpload.tsx               # Upload de imagens
│   ├── Modal.tsx                     # Modal reutilizável
│   └── Sidebar.tsx                   # Sidebar de navegação
├── lib/
│   ├── api.ts                        # Helpers para chamadas à API
│   └── auth0.ts                      # Configuração do Auth0
└── middleware.ts                      # Autenticação + autorização
```
