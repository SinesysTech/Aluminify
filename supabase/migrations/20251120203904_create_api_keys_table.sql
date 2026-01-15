-- Criar tabela api_keys
create table if not exists public.api_keys (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    key text not null unique, -- Hash da chave
    created_by uuid references auth.users(id) on delete cascade,
    last_used_at timestamptz,
    expires_at timestamptz,
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Criar trigger para updated_at
create trigger on_update_api_keys
before update on public.api_keys
for each row
execute procedure public.handle_updated_at();

-- Habilitar RLS
alter table public.api_keys enable row level security;

-- Política: Usuários veem suas próprias API keys
create policy "Usuários veem suas próprias API keys" on public.api_keys
for select using (auth.uid() = created_by);

-- Política: Superadmin vê todas as API keys
create policy "Superadmin vê todas as API keys" on public.api_keys
for select using (
    exists (
        select 1 from auth.users
        where auth.users.id = auth.uid()
        and (
            auth.users.raw_user_meta_data->>'role' = 'superadmin'
            or auth.users.raw_user_meta_data->>'is_superadmin' = 'true'
        )
    )
);

-- Política: Professores podem criar API keys
create policy "Professores criam API keys" on public.api_keys
for insert with check (
    exists (select 1 from public.professores where id = auth.uid())
    or exists (
        select 1 from auth.users
        where auth.users.id = auth.uid()
        and (
            auth.users.raw_user_meta_data->>'role' = 'superadmin'
            or auth.users.raw_user_meta_data->>'is_superadmin' = 'true'
        )
    )
);

-- Política: Usuários atualizam suas próprias API keys
create policy "Usuários atualizam suas próprias API keys" on public.api_keys
for update using (auth.uid() = created_by);

-- Política: Superadmin atualiza todas as API keys
create policy "Superadmin atualiza todas as API keys" on public.api_keys
for update using (
    exists (
        select 1 from auth.users
        where auth.users.id = auth.uid()
        and (
            auth.users.raw_user_meta_data->>'role' = 'superadmin'
            or auth.users.raw_user_meta_data->>'is_superadmin' = 'true'
        )
    )
);

-- Política: Usuários deletam suas próprias API keys
create policy "Usuários deletam suas próprias API keys" on public.api_keys
for delete using (auth.uid() = created_by);

-- Política: Superadmin deleta todas as API keys
create policy "Superadmin deleta todas as API keys" on public.api_keys
for delete using (
    exists (
        select 1 from auth.users
        where auth.users.id = auth.uid()
        and (
            auth.users.raw_user_meta_data->>'role' = 'superadmin'
            or auth.users.raw_user_meta_data->>'is_superadmin' = 'true'
        )
    )
);;
