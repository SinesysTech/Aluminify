-- Migration: Add indexes for cronograma performance optimization
-- Description: Adds indexes to improve query performance for cronograma generation

-- Indexes for aulas table
create index if not exists idx_aulas_modulo_id on public.aulas(modulo_id);
create index if not exists idx_aulas_curso_id on public.aulas(curso_id);
create index if not exists idx_aulas_prioridade on public.aulas(prioridade) where prioridade > 0;

-- Indexes for modulos table
create index if not exists idx_modulos_frente_id on public.modulos(frente_id);
create index if not exists idx_modulos_curso_id on public.modulos(curso_id);

-- Indexes for frentes table
create index if not exists idx_frentes_disciplina_id on public.frentes(disciplina_id);
create index if not exists idx_frentes_curso_id on public.frentes(curso_id);
create index if not exists idx_frentes_disciplina_curso on public.frentes(disciplina_id, curso_id);

-- Composite index for common query pattern: disciplina + curso
create index if not exists idx_frentes_disciplina_curso_composite on public.frentes(disciplina_id, curso_id) where curso_id is not null;

-- Index for modulos query pattern: frente + curso
create index if not exists idx_modulos_frente_curso_composite on public.modulos(frente_id, curso_id) where curso_id is not null;

comment on index idx_aulas_modulo_id is 'Index for filtering aulas by modulo_id in cronograma generation';
comment on index idx_aulas_curso_id is 'Index for filtering aulas by curso_id in cronograma generation';
comment on index idx_aulas_prioridade is 'Partial index for aulas with priority > 0';
comment on index idx_modulos_frente_id is 'Index for filtering modulos by frente_id';
comment on index idx_modulos_curso_id is 'Index for filtering modulos by curso_id';
comment on index idx_frentes_disciplina_id is 'Index for filtering frentes by disciplina_id';
comment on index idx_frentes_curso_id is 'Index for filtering frentes by curso_id';
comment on index idx_frentes_disciplina_curso_composite is 'Composite index for common query pattern disciplina + curso';
comment on index idx_modulos_frente_curso_composite is 'Composite index for modulos query pattern frente + curso';
;
