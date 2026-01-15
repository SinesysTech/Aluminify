-- Adicionar coluna created_by em Segmentos
alter table public.segmentos 
add column if not exists created_by uuid references auth.users(id) on delete set null;

-- Adicionar coluna created_by em Disciplinas
alter table public.disciplinas 
add column if not exists created_by uuid references auth.users(id) on delete set null;

-- Adicionar coluna created_by em Cursos
alter table public.cursos 
add column if not exists created_by uuid references auth.users(id) on delete set null;;
