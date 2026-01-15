-- Migration: Add empresas RLS policies - Step 4
-- Description: Adiciona RLS policies para a tabela empresas
-- Author: Auto-generated
-- Date: 2025-12-17

-- 1. Criar RLS policy: Usuários veem apenas sua empresa
drop policy if exists "Usuários veem apenas sua empresa" on public.empresas;
create policy "Usuários veem apenas sua empresa"
    on public.empresas
    for select
    to authenticated
    using (
        -- Professores veem apenas sua empresa
        (
            exists (
                select 1
                from public.professores
                where id = (select auth.uid())
                and empresa_id = empresas.id
            )
        )
        or
        -- Superadmin vê todas as empresas
        exists (
            select 1
            from auth.users
            where id = (select auth.uid())
            and raw_user_meta_data->>'role' = 'superadmin'
        )
    );

-- 2. Criar RLS policy: Apenas superadmin pode criar empresas
drop policy if exists "Apenas superadmin pode criar empresas" on public.empresas;
create policy "Apenas superadmin pode criar empresas"
    on public.empresas
    for insert
    to authenticated
    with check (
        exists (
            select 1
            from auth.users
            where id = (select auth.uid())
            and raw_user_meta_data->>'role' = 'superadmin'
        )
    );

-- 3. Criar RLS policy: Admins da empresa ou superadmin podem atualizar
drop policy if exists "Admins da empresa ou superadmin podem atualizar" on public.empresas;
create policy "Admins da empresa ou superadmin podem atualizar"
    on public.empresas
    for update
    to authenticated
    using (
        -- Admin da empresa
        (
            exists (
                select 1
                from public.professores
                where id = (select auth.uid())
                and empresa_id = empresas.id
                and is_admin = true
            )
        )
        or
        -- Superadmin
        (
            exists (
                select 1
                from auth.users
                where id = (select auth.uid())
                and raw_user_meta_data->>'role' = 'superadmin'
            )
        )
    )
    with check (
        -- Admin da empresa
        (
            exists (
                select 1
                from public.professores
                where id = (select auth.uid())
                and empresa_id = empresas.id
                and is_admin = true
            )
        )
        or
        -- Superadmin
        (
            exists (
                select 1
                from auth.users
                where id = (select auth.uid())
                and raw_user_meta_data->>'role' = 'superadmin'
            )
        )
    );

-- 4. Criar RLS policy: Apenas superadmin pode deletar empresas
drop policy if exists "Apenas superadmin pode deletar empresas" on public.empresas;
create policy "Apenas superadmin pode deletar empresas"
    on public.empresas
    for delete
    to authenticated
    using (
        exists (
            select 1
            from auth.users
            where id = (select auth.uid())
            and raw_user_meta_data->>'role' = 'superadmin'
        )
    );;
