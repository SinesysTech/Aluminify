-- Criar tabela matriculas
create table if not exists public.matriculas (
    id uuid primary key default gen_random_uuid(),
    aluno_id uuid references public.alunos(id) on delete cascade,
    curso_id uuid references public.cursos(id) on delete cascade,
    data_matricula timestamptz not null default now(),
    data_inicio_acesso date not null default current_date,
    data_fim_acesso date not null,
    ativo boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Criar trigger para updated_at
create trigger on_update_matriculas
before update on public.matriculas
for each row
execute procedure public.handle_updated_at();

-- Habilitar RLS
alter table public.matriculas enable row level security;

-- Política: Aluno vê suas próprias matrículas
create policy "Aluno vê suas próprias matrículas" on public.matriculas
for select using (auth.uid() = aluno_id);;
