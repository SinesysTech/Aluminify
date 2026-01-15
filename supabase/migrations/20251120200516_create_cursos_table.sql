-- Criar enums se não existirem
DO $$ BEGIN
    CREATE TYPE enum_modalidade AS ENUM ('EAD', 'LIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE enum_tipo_curso AS ENUM ('Superextensivo', 'Extensivo', 'Intensivo', 'Superintensivo', 'Revisão');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Criar tabela cursos
create table if not exists public.cursos (
    id uuid primary key default gen_random_uuid(),
    segmento_id uuid references public.segmentos(id) on delete set null,
    disciplina_id uuid references public.disciplinas(id) on delete set null,
    nome text not null,
    modalidade enum_modalidade not null,
    tipo enum_tipo_curso not null,
    descricao text,
    ano_vigencia integer not null,
    data_inicio date,
    data_termino date,
    meses_acesso integer,
    planejamento_url text,
    imagem_capa_url text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Criar trigger para updated_at
create trigger on_update_cursos
before update on public.cursos
for each row
execute procedure public.handle_updated_at();

-- Habilitar RLS
alter table public.cursos enable row level security;

-- Política de leitura pública (catálogo)
create policy "Catálogo de Cursos é Público" on public.cursos
for select using (true);;
