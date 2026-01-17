-- Migration: Fix RLS infinite recursion
-- Description: Updates get_user_empresa_id to SECURITY DEFINER and refines professor RLS policies
-- Date: 2026-01-17

-- 1. Update function to SECURITY DEFINER to break recursion
create or replace function public.get_user_empresa_id()
returns uuid
language plpgsql
security definer -- Changed from invoker to definer
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
$$;

-- 2. Update RLS policy for professors to be more robust
-- Re-creating the SELECT policy to explicitly allow ID match without depending on get_user_empresa_id first
drop policy if exists "Professores veem apenas professores da mesma empresa" on public.professores;

create policy "Professores veem apenas professores da mesma empresa"
    on public.professores
    for select
    to authenticated
    using (
        -- User sees their own record (Fast path, breaks recursion if function was invoker)
        id = (select auth.uid())
        or
        -- Professor sees their company colleagues
        empresa_id = public.get_user_empresa_id()
        or
        -- Superadmin sees all
        exists (
            select 1
            from auth.users
            where id = (select auth.uid())
            and raw_user_meta_data->>'role' = 'superadmin'
        )
    );
