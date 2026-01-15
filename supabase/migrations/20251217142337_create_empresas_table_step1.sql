-- Migration: Create empresas table - Step 1
-- Description: Cria apenas a tabela empresas e ENUM, sem dependências
-- Author: Auto-generated
-- Date: 2025-12-17

-- 1. Criar ENUM para planos de empresa
do $$ begin
    create type enum_plano_empresa as enum ('basico', 'profissional', 'enterprise');
exception when duplicate_object then
    null;
end $$;

-- 2. Criar tabela empresas
create table if not exists public.empresas (
    id uuid default gen_random_uuid() primary key,
    nome text not null,
    slug text unique not null,
    cnpj text unique,
    email_contato text,
    telefone text,
    logo_url text,
    plano enum_plano_empresa default 'basico' not null,
    ativo boolean default true not null,
    configuracoes jsonb default '{}'::jsonb,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- 3. Adicionar comentário na tabela
comment on table public.empresas is 'Tabela de empresas (cursinhos) que representa cada tenant do sistema multi-tenant. Cada empresa possui seus próprios professores, cursos e alunos.';

-- 4. Criar trigger para atualizar updated_at
drop trigger if exists handle_updated_at_empresas on public.empresas;
create trigger handle_updated_at_empresas
    before update on public.empresas
    for each row
    execute function public.handle_updated_at();

-- 5. Habilitar RLS na tabela empresas
alter table public.empresas enable row level security;

-- 6. Criar índices para performance
create index if not exists idx_empresas_slug on public.empresas(slug);
create index if not exists idx_empresas_cnpj on public.empresas(cnpj) where cnpj is not null;
create index if not exists idx_empresas_ativo on public.empresas(ativo);;
