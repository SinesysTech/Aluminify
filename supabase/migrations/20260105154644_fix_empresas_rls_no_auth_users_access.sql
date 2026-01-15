-- Migration: Fix empresas RLS policies to avoid accessing auth.users directly
-- Description: Cria função auxiliar para verificar superadmin usando JWT, evitando acesso direto a auth.users

-- 1. Criar função auxiliar para verificar se usuário é superadmin usando JWT
create or replace function public.is_superadmin()
returns boolean
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
    user_role text;
begin
    -- Tentar obter role do JWT primeiro (mais seguro e não requer acesso a auth.users)
    user_role := (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role';
    
    -- Se não encontrou no JWT, retornar false (não é superadmin)
    if user_role is null then
        return false;
    end if;
    
    -- Verificar se é superadmin
    return user_role = 'superadmin';
end;
$$;

-- 2. Atualizar política SELECT de empresas
drop policy if exists "Usuários veem apenas sua empresa" on public.empresas;

create policy "Usuários veem apenas sua empresa"
    on public.empresas
    for select
    to authenticated
    using (
        -- Professores veem apenas sua empresa
        (select auth.uid()) in (
            select id from public.professores where empresa_id = empresas.id
        )
        or
        -- Superadmin vê todas as empresas (usando função auxiliar)
        public.is_superadmin()
    );

-- 3. Atualizar política INSERT de empresas
drop policy if exists "Apenas superadmin pode criar empresas" on public.empresas;

create policy "Apenas superadmin pode criar empresas"
    on public.empresas
    for insert
    to authenticated
    with check (
        public.is_superadmin()
    );

-- 4. Atualizar política UPDATE de empresas
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
        -- Superadmin (usando função auxiliar)
        public.is_superadmin()
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
        -- Superadmin (usando função auxiliar)
        public.is_superadmin()
    );

-- 5. Atualizar política DELETE de empresas
drop policy if exists "Apenas superadmin pode deletar empresas" on public.empresas;

create policy "Apenas superadmin pode deletar empresas"
    on public.empresas
    for delete
    to authenticated
    using (
        public.is_superadmin()
    );

-- 6. Adicionar comentário na função
comment on function public.is_superadmin() is 'Verifica se o usuário logado é superadmin usando JWT, sem acessar auth.users diretamente.';;
