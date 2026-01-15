-- Criar tabela alunos
create table if not exists public.alunos (
    id uuid primary key references auth.users(id) on delete cascade,
    nome_completo text,
    email text unique not null,
    cpf text unique,
    telefone text,
    data_nascimento date,
    endereco text,
    cep text,
    numero_matricula text unique,
    instagram text,
    twitter text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Criar trigger para updated_at
create trigger on_update_alunos
before update on public.alunos
for each row
execute procedure public.handle_updated_at();

-- Habilitar RLS
alter table public.alunos enable row level security;

-- Política: Usuários veem o próprio perfil
create policy "Usuários veem o próprio perfil" on public.alunos
for select using (auth.uid() = id);

-- Política: Usuários atualizam o próprio perfil
create policy "Usuários atualizam o próprio perfil" on public.alunos
for update using (auth.uid() = id);;
