-- Migration: Garantir vínculo em usuarios_empresas (papel_base = 'aluno') ao matricular em curso
-- Description: Quando um usuário é inserido em alunos_cursos, criar/garantir registro em
--              usuarios_empresas com papel_base = 'aluno' para a empresa do curso, para que
--              apareça na listagem de alunos da gestão. Inclui backfill para quem já está
--              matriculado sem vínculo (ex.: importados).
-- Date: 2026-02-05

BEGIN;

-- 1. Estender sync_aluno_empresa_id: além de atualizar usuarios.empresa_id, inserir em
--    usuarios_empresas (papel_base = 'aluno') quando não existir vínculo de staff na empresa
--    e ainda não houver vínculo aluno ativo.
CREATE OR REPLACE FUNCTION public.sync_aluno_empresa_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
DECLARE
  v_empresa_id uuid;
BEGIN
  SELECT c.empresa_id INTO v_empresa_id
  FROM public.cursos c
  WHERE c.id = NEW.curso_id;

  IF v_empresa_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Sincronizar empresa_id em usuarios quando for NULL
  UPDATE public.usuarios
  SET empresa_id = v_empresa_id
  WHERE id = NEW.usuario_id
    AND empresa_id IS NULL;

  -- Garantir vínculo em usuarios_empresas como aluno na empresa do curso:
  -- só inserir se o usuário NÃO for já professor/usuario nessa empresa e não tiver já vínculo aluno ativo
  INSERT INTO public.usuarios_empresas (usuario_id, empresa_id, papel_base, ativo, is_admin, is_owner)
  SELECT NEW.usuario_id, v_empresa_id, 'aluno'::public.enum_papel_base, true, false, false
  WHERE NOT EXISTS (
    SELECT 1 FROM public.usuarios_empresas ue
    WHERE ue.usuario_id = NEW.usuario_id
      AND ue.empresa_id = v_empresa_id
      AND ue.papel_base IN ('professor', 'usuario')
      AND ue.ativo = true
      AND ue.deleted_at IS NULL
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.usuarios_empresas ue2
    WHERE ue2.usuario_id = NEW.usuario_id
      AND ue2.empresa_id = v_empresa_id
      AND ue2.papel_base = 'aluno'
      AND ue2.ativo = true
      AND ue2.deleted_at IS NULL
  );

  RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.sync_aluno_empresa_id() IS
  'Trigger em alunos_cursos. Ao inserir: atualiza usuarios.empresa_id quando NULL e garante registro em usuarios_empresas com papel_base = aluno na empresa do curso.';

-- 2. Garantir que o trigger existe em alunos_cursos (pode já existir de migration anterior)
DROP TRIGGER IF EXISTS trg_sync_aluno_empresa_id ON public.alunos_cursos;
CREATE TRIGGER trg_sync_aluno_empresa_id
  AFTER INSERT ON public.alunos_cursos
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_aluno_empresa_id();

-- 3. Backfill: inserir usuarios_empresas (aluno) para todos os (usuario_id, empresa_id) que
--    aparecem em alunos_cursos e ainda não têm vínculo aluno ativo naquela empresa
--    (respeitando: não adicionar aluno se já for professor/usuario na empresa)
INSERT INTO public.usuarios_empresas (usuario_id, empresa_id, papel_base, ativo, is_admin, is_owner)
SELECT DISTINCT ac.usuario_id, c.empresa_id, 'aluno'::public.enum_papel_base, true, false, false
FROM public.alunos_cursos ac
INNER JOIN public.cursos c ON c.id = ac.curso_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.usuarios_empresas ue
  WHERE ue.usuario_id = ac.usuario_id
    AND ue.empresa_id = c.empresa_id
    AND ue.papel_base IN ('professor', 'usuario')
    AND ue.ativo = true
    AND ue.deleted_at IS NULL
)
AND NOT EXISTS (
  SELECT 1 FROM public.usuarios_empresas ue2
  WHERE ue2.usuario_id = ac.usuario_id
    AND ue2.empresa_id = c.empresa_id
    AND ue2.papel_base = 'aluno'
    AND ue2.ativo = true
    AND ue2.deleted_at IS NULL
);

COMMIT;
