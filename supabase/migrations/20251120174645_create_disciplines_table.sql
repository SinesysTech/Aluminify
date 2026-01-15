create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create table if not exists public.disciplinas (
    id uuid primary key default gen_random_uuid(),
    nome text not null unique,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create trigger on_update_disciplinas
before update on public.disciplinas
for each row
execute procedure public.handle_updated_at();;
