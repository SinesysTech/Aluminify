-- Migration: Create agendamento_recorrencia_turmas table
-- Description: Tabela associativa many-to-many para restringir regras de recorrência a turmas específicas
-- Date: 2026-03-10

-- 1. Criar tabela agendamento_recorrencia_turmas
create table if not exists public.agendamento_recorrencia_turmas (
    id uuid default gen_random_uuid() primary key,
    recorrencia_id uuid not null references public.agendamento_recorrencia(id) on delete cascade,
    turma_id uuid not null references public.turmas(id) on delete cascade,
    empresa_id uuid not null references public.empresas(id) on delete cascade,
    created_at timestamp with time zone default now() not null,
    constraint unique_recorrencia_turma unique (recorrencia_id, turma_id)
);

-- 2. Adicionar comentário na tabela
comment on table public.agendamento_recorrencia_turmas is 'Tabela associativa que vincula regras de recorrência a turmas específicas. Quando uma recorrência tem vínculos nesta tabela, apenas alunos matriculados nas turmas vinculadas podem ver e agendar os slots gerados. Sem vínculos, a recorrência fica visível para todos os alunos do tenant.';

-- 3. Habilitar RLS
alter table public.agendamento_recorrencia_turmas enable row level security;

-- 4. Criar RLS policies

-- Professores podem ver vínculos de suas recorrências
create policy "Professores veem turmas de suas recorrências"
    on public.agendamento_recorrencia_turmas
    for select
    to authenticated
    using (
        empresa_id = public.get_user_empresa_id()
    );

-- Professores podem criar vínculos para suas recorrências
create policy "Professores podem vincular turmas às suas recorrências"
    on public.agendamento_recorrencia_turmas
    for insert
    to authenticated
    with check (
        empresa_id = public.get_user_empresa_id()
        and exists (
            select 1 from public.agendamento_recorrencia ar
            where ar.id = recorrencia_id
            and ar.professor_id = (select auth.uid())
        )
    );

-- Professores podem deletar vínculos de suas recorrências
create policy "Professores podem desvincular turmas de suas recorrências"
    on public.agendamento_recorrencia_turmas
    for delete
    to authenticated
    using (
        empresa_id = public.get_user_empresa_id()
        and exists (
            select 1 from public.agendamento_recorrencia ar
            where ar.id = recorrencia_id
            and ar.professor_id = (select auth.uid())
        )
    );

-- 5. Criar índices para performance
create index if not exists idx_recorrencia_turmas_recorrencia_id
    on public.agendamento_recorrencia_turmas(recorrencia_id);

create index if not exists idx_recorrencia_turmas_turma_id
    on public.agendamento_recorrencia_turmas(turma_id);

create index if not exists idx_recorrencia_turmas_empresa_id
    on public.agendamento_recorrencia_turmas(empresa_id);
