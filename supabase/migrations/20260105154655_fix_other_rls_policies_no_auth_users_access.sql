-- Migration: Fix other RLS policies to avoid accessing auth.users directly
-- Description: Atualiza outras políticas RLS para usar a função is_superadmin() em vez de acessar auth.users

-- 1. Atualizar política SELECT de professores
drop policy if exists "Professores veem apenas professores da mesma empresa" on public.professores;

create policy "Professores veem apenas professores da mesma empresa"
    on public.professores
    for select
    to authenticated
    using (
        -- Professor vê sua própria empresa
        empresa_id = public.get_user_empresa_id()
        or
        -- Superadmin vê todos (usando função auxiliar)
        public.is_superadmin()
    );

-- 2. Atualizar política INSERT de professores
drop policy if exists "Admins podem criar professores em sua empresa" on public.professores;

create policy "Admins podem criar professores em sua empresa"
    on public.professores
    for insert
    to authenticated
    with check (
        -- Admin da empresa
        (
            empresa_id = public.get_user_empresa_id()
            and public.is_empresa_admin()
        )
        or
        -- Superadmin (usando função auxiliar)
        public.is_superadmin()
    );

-- 3. Atualizar política INSERT de cursos
drop policy if exists "Admins podem criar cursos em sua empresa" on public.cursos;

create policy "Admins podem criar cursos em sua empresa"
    on public.cursos
    for insert
    to authenticated
    with check (
        -- Admin da empresa
        (
            empresa_id = public.get_user_empresa_id()
            and public.is_empresa_admin()
        )
        or
        -- Superadmin (usando função auxiliar)
        public.is_superadmin()
    );

-- 4. Atualizar política SELECT de empresa_admins
drop policy if exists "Admins veem admins de sua empresa" on public.empresa_admins;

create policy "Admins veem admins de sua empresa"
    on public.empresa_admins
    for select
    to authenticated
    using (
        -- Admin da empresa
        public.is_empresa_admin((select auth.uid()), empresa_id)
        or
        -- Superadmin (usando função auxiliar)
        public.is_superadmin()
    );;
