# Econo Mizi

Aplicação web de gestão financeira pessoal (mobile-first), pronta para deploy na Vercel com Supabase.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (Auth + PostgreSQL + RLS)
- Recharts, Lucide React, React Hook Form, Zod

## 1. Instalar Node.js

Use Node.js 20 LTS ou superior: https://nodejs.org

## 2. Instalar dependências

```bash
npm install
```

## 3. Criar projeto no Supabase

1. Acesse https://supabase.com
2. Crie um novo projeto
3. Abra **SQL Editor**

## 4. Executar migrations

Cole e execute o conteúdo de:

`supabase/migrations/20260824000000_initial_schema.sql`

Isso cria tabelas, índices, triggers e políticas RLS (`auth.uid() = user_id`).

## 5. Pegar URL e anon key

No Supabase: **Project Settings → API**

- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> Nunca use a `service_role` key no frontend.

## 6. Criar `.env.local`

```bash
cp .env.example .env.local
```

Preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

## 7. Rodar localmente

```bash
npm run dev
```

Abra http://localhost:3000

Sem variáveis do Supabase, a tela de login oferece **modo demonstração** (dados mockados, claramente identificados).

## 8. Testar

1. Criar conta (e-mail + senha) ou entrar no modo demo
2. Concluir onboarding (salário, pagamento, reserva, meta)
3. Adicionar gastos e receitas
4. Navegar por Dashboard, Movimentações, Análises, Metas e Perfil
5. Guardar/retirar da reserva
6. Trocar o mês no seletor

## 9. Deploy na Vercel

1. Envie o repositório para o GitHub
2. Importe o projeto em https://vercel.com
3. Em **Environment Variables**, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## 10. Auth no Supabase (produção)

Em **Authentication → URL Configuration**, adicione a URL do app na Vercel em:

- Site URL
- Redirect URLs

## Scripts

```bash
npm run dev      # desenvolvimento
npm run build    # build de produção
npm run start    # servir build
npm run lint     # eslint
```

## Estrutura principal

- `src/app` — rotas
- `src/components` — UI, dashboard, charts, transactions
- `src/lib/finance` — cálculos financeiros centralizados
- `src/lib/supabase` — clients browser/server + middleware
- `src/lib/config.ts` — nome do app (altere em um só lugar)
- `supabase/migrations` — schema SQL + RLS

## PWA

O app inclui `manifest.webmanifest`, ícones e service worker. No celular (HTTPS/Vercel), use “Adicionar à tela inicial”.

## Alterar o nome do app

Edite apenas `src/lib/config.ts`.
