-- 1. Alteração na Tabela Frentes
ALTER TABLE public.frentes 
ADD COLUMN IF NOT EXISTS curso_id UUID REFERENCES public.cursos(id) ON DELETE CASCADE;

-- 2. Atualização da Stored Procedure de Importação
CREATE OR REPLACE FUNCTION public.importar_cronograma_aulas(
    p_curso_id UUID,
    p_disciplina_nome TEXT,
    p_frente_nome TEXT,
    p_conteudo JSONB
)
RETURNS VOID AS $$
DECLARE
    v_disciplina_id UUID;
    v_frente_id UUID;
    v_modulo_id UUID;
    aula_item JSONB;
    v_modulo_atual INTEGER := -1;
    v_nome_modulo_atual TEXT;
BEGIN
    -- 1. Buscar ou Criar a Disciplina (Global)
    SELECT id INTO v_disciplina_id FROM public.disciplinas WHERE nome = p_disciplina_nome;
    IF v_disciplina_id IS NULL THEN
        INSERT INTO public.disciplinas (nome, created_by) VALUES (p_disciplina_nome, auth.uid()) RETURNING id INTO v_disciplina_id;
    END IF;

    -- 2. Buscar ou Criar a Frente (AGORA VINCULADA AO CURSO)
    SELECT id INTO v_frente_id FROM public.frentes 
    WHERE curso_id = p_curso_id 
    AND nome = p_frente_nome;
    
    IF v_frente_id IS NULL THEN
        INSERT INTO public.frentes (curso_id, disciplina_id, nome, created_by) 
        VALUES (p_curso_id, v_disciplina_id, p_frente_nome, auth.uid()) 
        RETURNING id INTO v_frente_id;
    ELSE
        -- Estratégia "Wipe and Recreate": Limpa módulos antigos para atualizar
        DELETE FROM public.modulos WHERE frente_id = v_frente_id;
    END IF;

    -- 3. Loop de inserção (Mantém lógica original)
    FOR aula_item IN SELECT * FROM jsonb_array_elements(p_conteudo)
    LOOP
        IF (aula_item->>'modulo_numero')::INTEGER <> v_modulo_atual THEN
            v_modulo_atual := (aula_item->>'modulo_numero')::INTEGER;
            v_nome_modulo_atual := aula_item->>'modulo_nome';
            
            INSERT INTO public.modulos (frente_id, numero_modulo, nome)
            VALUES (v_frente_id, v_modulo_atual, v_nome_modulo_atual)
            RETURNING id INTO v_modulo_id;
        END IF;
        INSERT INTO public.aulas (
            modulo_id, numero_aula, nome, tempo_estimado_minutos, prioridade
        )
        VALUES (
            v_modulo_id,
            (aula_item->>'aula_numero')::INTEGER,
            aula_item->>'aula_nome',
            (aula_item->>'tempo')::INTEGER,
            (aula_item->>'prioridade')::INTEGER
        );
    END LOOP;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
;
