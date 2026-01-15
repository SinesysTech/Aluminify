-- Corrigir a função para ter search_path fixo (segurança)
CREATE OR REPLACE FUNCTION public.importar_cronograma_aulas(
    p_disciplina_nome TEXT,
    p_frente_nome TEXT,
    p_conteudo JSONB -- Array de objetos contendo os dados das aulas
)
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_disciplina_id UUID;
    v_frente_id UUID;
    v_modulo_id UUID;
    aula_item JSONB;
    v_modulo_atual INTEGER := -1;
    v_nome_modulo_atual TEXT;
BEGIN
    -- 1. Buscar ou Criar a Disciplina
    SELECT id INTO v_disciplina_id FROM public.disciplinas WHERE nome = p_disciplina_nome;
    IF v_disciplina_id IS NULL THEN
        INSERT INTO public.disciplinas (nome, created_by) VALUES (p_disciplina_nome, auth.uid()) RETURNING id INTO v_disciplina_id;
    END IF;

    -- 2. Buscar ou Criar a Frente
    SELECT id INTO v_frente_id FROM public.frentes WHERE disciplina_id = v_disciplina_id AND nome = p_frente_nome;
    IF v_frente_id IS NULL THEN
        INSERT INTO public.frentes (disciplina_id, nome, created_by) VALUES (v_disciplina_id, p_frente_nome, auth.uid()) RETURNING id INTO v_frente_id;
    ELSE
        -- ESTRATÉGIA "WIPE AND RECREATE": Se a frente já existe, limpamos os módulos dela.
        -- Como as aulas dependem dos módulos (Cascade), elas serão deletadas automaticamente.
        DELETE FROM public.modulos WHERE frente_id = v_frente_id;
    END IF;

    -- 3. Loop para inserir o conteúdo novo
    FOR aula_item IN SELECT * FROM jsonb_array_elements(p_conteudo)
    LOOP
        -- Verifica se mudou de módulo (O JSON deve vir ordenado)
        -- Se o número do módulo no JSON for diferente do atual, cria um novo módulo
        IF (aula_item->>'modulo_numero')::INTEGER <> v_modulo_atual THEN
            v_modulo_atual := (aula_item->>'modulo_numero')::INTEGER;
            v_nome_modulo_atual := aula_item->>'modulo_nome';
            
            INSERT INTO public.modulos (frente_id, numero_modulo, nome)
            VALUES (v_frente_id, v_modulo_atual, v_nome_modulo_atual)
            RETURNING id INTO v_modulo_id;
        END IF;

        -- Insere a Aula vinculada ao módulo atual
        INSERT INTO public.aulas (
            modulo_id,
            numero_aula,
            nome,
            tempo_estimado_minutos,
            prioridade
        )
        VALUES (
            v_modulo_id,
            (aula_item->>'aula_numero')::INTEGER,
            aula_item->>'aula_nome',
            NULLIF((aula_item->>'tempo')::INTEGER, 0), -- Pode ser NULL
            NULLIF((aula_item->>'prioridade')::INTEGER, 0) -- Pode ser NULL
        );
    END LOOP;
END;
$$;;
