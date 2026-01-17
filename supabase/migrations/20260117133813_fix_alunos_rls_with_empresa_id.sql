-- Migration: Atualizar RLS da tabela alunos para usar empresa_id direto
-- Descrição: Simplifica policies usando a nova coluna empresa_id em vez de joins complexos
-- Author: Claude
-- Date: 2026-01-17

-- Dropar todas as policies antigas da tabela alunos
DROP POLICY IF EXISTS "Admins podem ver alunos de sua empresa" ON public.alunos;
DROP POLICY IF EXISTS "alunos_select_policy" ON public.alunos;
DROP POLICY IF EXISTS "alunos_insert_policy" ON public.alunos;
DROP POLICY IF EXISTS "alunos_update_policy" ON public.alunos;
DROP POLICY IF EXISTS "alunos_delete_policy" ON public.alunos;
DROP POLICY IF EXISTS "Alunos: select próprio ou admin da empresa" ON public.alunos;
DROP POLICY IF EXISTS "Alunos: insert apenas admin da empresa" ON public.alunos;
DROP POLICY IF EXISTS "Alunos: update próprio ou admin da empresa" ON public.alunos;
DROP POLICY IF EXISTS "Alunos: delete apenas admin da empresa" ON public.alunos;

-- Garantir que RLS está habilitado
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;

-- Policy SELECT: Aluno vê seu próprio registro, admin vê alunos da sua empresa, superadmin vê todos
CREATE POLICY "alunos_select_policy"
ON public.alunos
FOR SELECT
TO authenticated
USING (
    -- Aluno vê seu próprio registro
    id = (SELECT auth.uid())
    OR
    -- Admin da empresa vê alunos da sua empresa (usando empresa_id direto)
    (
        public.is_empresa_admin()
        AND empresa_id = public.get_user_empresa_id()
    )
    OR
    -- Superadmin vê todos
    public.is_superadmin()
);

-- Policy INSERT: Apenas admin da empresa pode criar alunos na sua empresa
CREATE POLICY "alunos_insert_policy"
ON public.alunos
FOR INSERT
TO authenticated
WITH CHECK (
    (
        public.is_empresa_admin()
        AND empresa_id = public.get_user_empresa_id()
    )
    OR
    public.is_superadmin()
);

-- Policy UPDATE: Aluno pode atualizar seu próprio registro (campos limitados), admin pode atualizar alunos da empresa
CREATE POLICY "alunos_update_policy"
ON public.alunos
FOR UPDATE
TO authenticated
USING (
    id = (SELECT auth.uid())
    OR
    (
        public.is_empresa_admin()
        AND empresa_id = public.get_user_empresa_id()
    )
    OR
    public.is_superadmin()
)
WITH CHECK (
    id = (SELECT auth.uid())
    OR
    (
        public.is_empresa_admin()
        AND empresa_id = public.get_user_empresa_id()
    )
    OR
    public.is_superadmin()
);

-- Policy DELETE: Apenas admin da empresa pode deletar alunos da sua empresa
CREATE POLICY "alunos_delete_policy"
ON public.alunos
FOR DELETE
TO authenticated
USING (
    (
        public.is_empresa_admin()
        AND empresa_id = public.get_user_empresa_id()
    )
    OR
    public.is_superadmin()
);

-- Comentário na tabela
COMMENT ON TABLE public.alunos IS 'Tabela de alunos com isolamento multi-tenant via empresa_id. RLS policies garantem que cada empresa só vê seus próprios alunos.';
