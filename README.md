# 🏪 FeiraTech — SaaS de Feira Digital

Sistema completo com 3 interfaces distintas:

- **Pública** (`/`) — Mapa interativo e listagem de lojas
- **Admin** (`/admin`) — Painel do lojista (cadastro, gestão da loja e posição no mapa)
- **CEO** (`/ceo`) — Painel administrativo (aprovar lojas, gerenciar mapa, controlar contas)

---

## 🚀 Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e execute o conteúdo de `supabase-schema.sql`
3. Crie o arquivo `.env`:

```bash
cp .env.example .env
```

4. Preencha com suas credenciais (Settings → API no dashboard do Supabase):

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

### 3. Criar conta CEO

1. No Supabase Dashboard → **Authentication → Users** → Invite user
2. Crie o usuário com o e-mail CEO
3. No **SQL Editor**, execute:

```sql
UPDATE profiles SET role = 'ceo' WHERE email = 'seu-email-ceo@exemplo.com';
```

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse:

- Tela pública: http://localhost:5173/
- Admin: http://localhost:5173/admin/login
- CEO: http://localhost:5173/ceo/login

#### Testando subdomínios em localhost

Para testar o roteamento por subdomínios durante o desenvolvimento (simulando produção):

**Windows:**

1. Abra `C:\Windows\System32\drivers\etc\hosts` como administrador
2. Adicione ao final:

```
127.0.0.1 localhost
127.0.0.1 admin.localhost
127.0.0.1 ceo.localhost
```

3. Salve o arquivo
4. Acesse:
   - Público: http://localhost:5173/
   - Admin: http://admin.localhost:5173/admin/login
   - CEO: http://ceo.localhost:5173/ceo/login

**macOS/Linux:**

```bash
echo "127.0.0.1 admin.localhost" | sudo tee -a /etc/hosts
echo "127.0.0.1 ceo.localhost" | sudo tee -a /etc/hosts
```

---

## 🏗️ Estrutura do Projeto

```
src/
├── components/
│   ├── FairMap.tsx        # Mapa de bancas interativo (grid)
│   ├── StoreCard.tsx      # Card de loja (grid e lista)
│   └── StoreModal.tsx     # Modal de detalhes da loja
├── layouts/
│   ├── PublicLayout.tsx   # Layout tela pública
│   ├── AdminLayout.tsx    # Layout painel admin
│   └── CeoLayout.tsx      # Layout painel CEO
├── pages/
│   ├── public/
│   │   └── HomePage.tsx   # Tela principal com mapa e listagem
│   ├── admin/
│   │   ├── AdminLoginPage.tsx
│   │   ├── AdminRegisterPage.tsx  # Cadastro multi-step
│   │   ├── AdminDashboard.tsx
│   │   └── AdminStorePage.tsx     # Editar loja + escolher posição
│   └── ceo/
│       ├── CeoLoginPage.tsx
│       ├── CeoDashboard.tsx
│       ├── CeoStoresPage.tsx      # Gerenciar/aprovar lojas
│       ├── CeoMapPage.tsx         # Mapa geral
│       └── CeoAccountsPage.tsx    # Controle de admins
├── store/
│   ├── authStore.ts       # Zustand: autenticação
│   └── storeStore.ts      # Zustand: lojas
└── lib/
    └── supabase.ts        # Client + tipos
```

---

## 🔑 Fluxo de Subdomínios (Produção)

Configure no DNS/hosting:

- `feira.com` → tela pública
- `admin.feira.com` → painel do lojista
- `ceo.feira.com` → painel CEO

O código detecta o subdomínio automaticamente via `window.location.hostname`.

---

## 📦 Build para produção

```bash
npm run build
```

---

## 🛠️ Stack

| Tecnologia            | Uso                              |
| --------------------- | -------------------------------- |
| React 18 + TypeScript | Frontend                         |
| Vite                  | Bundler                          |
| Tailwind CSS          | Estilização                      |
| Supabase              | Backend (auth + banco + storage) |
| Zustand               | Estado global                    |
| React Router v6       | Roteamento                       |
| Lucide React          | Ícones                           |
