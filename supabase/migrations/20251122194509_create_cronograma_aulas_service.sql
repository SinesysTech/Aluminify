-- ==============================================================================
-- 1. TABELAS DE CONTEÚDO PROGRAMÁTICO
-- ==============================================================================

-- 1.1 Tabela: Frentes (Agrupador de aulas dentro de uma disciplina)
CREATE TABLE public.frentes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    disciplina_id UUID REFERENCES public.disciplinas(id) ON DELETE CASCADE,
    nome TEXT NOT NULL, -- Ex: "Frente A"
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.2 Tabela: Módulos
CREATE TABLE public.modulos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    frente_id UUID REFERENCES public.frentes(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    numero_modulo INTEGER, -- Para ordenar (1, 2, 3...)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.3 Tabela: Aulas
CREATE TABLE public.aulas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    modulo_id UUID REFERENCES public.modulos(id) ON DELETE CASCADE,
    
    nome TEXT NOT NULL,
    numero_aula INTEGER, -- Para ordenar dentro do módulo
    
    -- Campos Opcionais conforme solicitado
    tempo_estimado_minutos INTEGER, 
    prioridade INTEGER CHECK (prioridade BETWEEN 1 AND 5),
    video_url TEXT, -- Opcional, futuro
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 2. ÍNDICES E PERFORMANCE
-- ==============================================================================

CREATE INDEX idx_frentes_disciplina ON public.frentes(disciplina_id);
CREATE INDEX idx_modulos_frente ON public.modulos(frente_id);
CREATE INDEX idx_aulas_modulo ON public.aulas(modulo_id);
CREATE INDEX idx_aulas_prioridade ON public.aulas(prioridade);

-- ==============================================================================
-- 3. FUNÇÃO DE IMPORTAÇÃO (RPC)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.importar_cronograma_aulas(
    p_disciplina_nome TEXT,
    p_frente_nome TEXT,
    p_conteudo JSONB -- Array de objetos contendo os dados das aulas
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 4. SEGURANÇA (Row Level Security)
-- ==============================================================================

-- Habilitar RLS
ALTER TABLE public.frentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aulas ENABLE ROW LEVEL SECURITY;

-- --- POLÍTICAS DE LEITURA (Alunos e Professores) ---
CREATE POLICY "Conteúdo é público para leitura" ON public.frentes FOR SELECT USING (true);
CREATE POLICY "Conteúdo é público para leitura" ON public.modulos FOR SELECT USING (true);
CREATE POLICY "Conteúdo é público para leitura" ON public.aulas FOR SELECT USING (true);

-- --- POLÍTICAS DE ESCRITA (Professores) ---
-- Apenas professores podem inserir/alterar/deletar
-- Aqui checamos se o usuário está na tabela de professores
CREATE POLICY "Professores gerenciam frentes" ON public.frentes 
    FOR ALL USING (EXISTS (SELECT 1 FROM public.professores WHERE id = auth.uid()));

CREATE POLICY "Professores gerenciam modulos" ON public.modulos 
    FOR ALL USING (EXISTS (SELECT 1 FROM public.professores WHERE id = auth.uid()));

CREATE POLICY "Professores gerenciam aulas" ON public.aulas 
    FOR ALL USING (EXISTS (SELECT 1 FROM public.professores WHERE id = auth.uid()));;
