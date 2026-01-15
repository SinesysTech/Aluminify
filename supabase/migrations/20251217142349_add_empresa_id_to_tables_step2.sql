-- Migration: Add empresa_id to existing tables - Step 2
-- Description: Adiciona foreign key empresa_id em todas as tabelas que precisam de isolamento multi-tenant
-- Author: Auto-generated
-- Date: 2025-12-17

-- 1. Adicionar empresa_id em professores (NULLABLE inicialmente)
alter table public.professores
    add column if not exists empresa_id uuid references public.empresas(id) on delete cascade;

-- 2. Adicionar empresa_id em cursos (NULLABLE inicialmente)
alter table public.cursos
    add column if not exists empresa_id uuid references public.empresas(id) on delete cascade;

-- 3. Adicionar empresa_id em disciplinas (NULLABLE - podem ser compartilhadas)
alter table public.disciplinas
    add column if not exists empresa_id uuid references public.empresas(id) on delete set null;

-- 4. Adicionar empresa_id em segmentos (NULLABLE - podem ser compartilhados)
alter table public.segmentos
    add column if not exists empresa_id uuid references public.empresas(id) on delete set null;

-- 5. Adicionar empresa_id em materiais_curso (NULLABLE inicialmente)
alter table public.materiais_curso
    add column if not exists empresa_id uuid references public.empresas(id) on delete cascade;

-- 6. Adicionar empresa_id em frentes (NULLABLE inicialmente)
alter table public.frentes
    add column if not exists empresa_id uuid references public.empresas(id) on delete cascade;

-- 7. Adicionar empresa_id em modulos (NULLABLE inicialmente)
alter table public.modulos
    add column if not exists empresa_id uuid references public.empresas(id) on delete cascade;

-- 8. Adicionar empresa_id em aulas (NULLABLE inicialmente)
alter table public.aulas
    add column if not exists empresa_id uuid references public.empresas(id) on delete cascade;

-- 9. Adicionar empresa_id em flashcards (NULLABLE inicialmente)
alter table public.flashcards
    add column if not exists empresa_id uuid references public.empresas(id) on delete cascade;

-- 10. Adicionar empresa_id em atividades (NULLABLE inicialmente)
alter table public.atividades
    add column if not exists empresa_id uuid references public.empresas(id) on delete cascade;

-- 11. Adicionar empresa_id em cronogramas (NULLABLE inicialmente)
alter table public.cronogramas
    add column if not exists empresa_id uuid references public.empresas(id) on delete cascade;

-- 12. Criar índices para performance em todas as tabelas
create index if not exists idx_professores_empresa_id on public.professores(empresa_id);
create index if not exists idx_cursos_empresa_id on public.cursos(empresa_id);
create index if not exists idx_disciplinas_empresa_id on public.disciplinas(empresa_id) where empresa_id is not null;
create index if not exists idx_segmentos_empresa_id on public.segmentos(empresa_id) where empresa_id is not null;
create index if not exists idx_materiais_curso_empresa_id on public.materiais_curso(empresa_id);
create index if not exists idx_frentes_empresa_id on public.frentes(empresa_id);
create index if not exists idx_modulos_empresa_id on public.modulos(empresa_id);
create index if not exists idx_aulas_empresa_id on public.aulas(empresa_id);
create index if not exists idx_flashcards_empresa_id on public.flashcards(empresa_id);
create index if not exists idx_atividades_empresa_id on public.atividades(empresa_id);
create index if not exists idx_cronogramas_empresa_id on public.cronogramas(empresa_id);

-- 13. Adicionar comentários explicativos
comment on column public.professores.empresa_id is 'Identificador da empresa (tenant) a qual o professor pertence. NOT NULL para garantir isolamento.';
comment on column public.cursos.empresa_id is 'Identificador da empresa (tenant) que oferece o curso. NOT NULL para garantir isolamento.';
comment on column public.disciplinas.empresa_id is 'Identificador da empresa (tenant). NULL indica disciplina compartilhada entre empresas.';
comment on column public.segmentos.empresa_id is 'Identificador da empresa (tenant). NULL indica segmento compartilhado entre empresas.';

-- 14. Criar função auxiliar para obter empresa_id do usuário
create or replace function public.get_user_empresa_id()
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
    empresa_id_result uuid;
begin
    -- Busca empresa_id do professor logado
    select empresa_id
    into empresa_id_result
    from public.professores
    where id = (select auth.uid())
    limit 1;

    return empresa_id_result;
end;
$$;;
