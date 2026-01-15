-- Criar tabela professores
create table if not exists public.professores (
    id uuid primary key references auth.users(id) on delete cascade,
    nome_completo text not null,
    email text unique not null,
    cpf text unique,
    telefone text,
    biografia text,
    foto_url text,
    especialidade text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Criar trigger para updated_at
create trigger on_update_professores
before update on public.professores
for each row
execute procedure public.handle_updated_at();

-- Habilitar RLS
alter table public.professores enable row level security;

-- Política: Perfil dos professores é público
create policy "Perfil dos professores é público" on public.professores
for select using (true);

-- Política: Professor edita seu perfil
create policy "Professor edita seu perfil" on public.professores
for update using (auth.uid() = id);;
