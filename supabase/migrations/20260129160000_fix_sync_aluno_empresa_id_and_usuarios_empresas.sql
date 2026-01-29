-- Migration: fix sync_aluno_empresa_id (usa usuarios + usuario_id) e suporta ausência de alunos
-- Description: O trigger em alunos_cursos referenciaba public.alunos e NEW.aluno_id.
--              A tabela usa usuario_id e o modelo unificado usa usuarios. Atualiza a
--              função para usar usuarios e usuario_id; se alunos existir, mantém lógica
--              legada opcional.
-- Date: 2026-01-29

CREATE OR REPLACE FUNCTION public.sync_aluno_empresa_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
BEGIN
    -- alunos_cursos usa usuario_id. Sincronizar empresa_id em usuarios quando for NULL.
    UPDATE public.usuarios
    SET empresa_id = (
        SELECT c.empresa_id
        FROM public.cursos c
        WHERE c.id = NEW.curso_id
    )
    WHERE id = NEW.usuario_id
    AND empresa_id IS NULL;

    RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.sync_aluno_empresa_id() IS 'Trigger em alunos_cursos. Ao inserir, atualiza usuarios.empresa_id do usuario quando NULL, usando empresa_id do curso.';
