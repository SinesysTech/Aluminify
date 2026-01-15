create table if not exists public.segmentos (
    id uuid primary key default gen_random_uuid(),
    nome text not null unique,
    slug text unique,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create trigger on_update_segmentos
before update on public.segmentos
for each row
execute procedure public.handle_updated_at();

alter table public.segmentos enable row level security;

create policy "Catálogo de Segmentos é Público" on public.segmentos
for select using (true);;
