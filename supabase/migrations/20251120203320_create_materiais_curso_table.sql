-- Criar enum se não existir
do $$ begin
    create type enum_tipo_material as enum ('Apostila', 'Lista de Exercícios', 'Planejamento', 'Resumo', 'Gabarito', 'Outros');
exception
    when duplicate_object then null;
end $$;

-- Criar tabela materiais_curso
create table if not exists public.materiais_curso (
    id uuid primary key default gen_random_uuid(),
    curso_id uuid references public.cursos(id) on delete cascade,
    titulo text not null,
    descricao_opcional text,
    tipo enum_tipo_material not null default 'Apostila',
    arquivo_url text not null,
    ordem integer not null default 0,
    created_by uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Criar trigger para updated_at
create trigger on_update_materiais
before update on public.materiais_curso
for each row
execute procedure public.handle_updated_at();

-- Criar trigger para created_by
drop trigger if exists set_created_by_materiais on public.materiais_curso;
create trigger set_created_by_materiais
before insert on public.materiais_curso
for each row
execute procedure public.handle_created_by();

-- Habilitar RLS
alter table public.materiais_curso enable row level security;

-- Política: Acesso a materiais apenas para matriculados
create policy "Acesso a materiais apenas para matriculados" on public.materiais_curso
for select using (
    exists (
        select 1 from public.matriculas m
        where m.curso_id = materiais_curso.curso_id
        and m.aluno_id = auth.uid()
        and m.ativo = true
    )
);

-- Política: Professores gerenciam materiais
drop policy if exists "Professores gerenciam materiais" on public.materiais_curso;
create policy "Professores gerenciam materiais" on public.materiais_curso
for all using (exists (select 1 from public.professores where id = auth.uid()));;
