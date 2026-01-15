-- Safe migration for importance enum, modules column, flashcards and progresso_flashcards

-- 1) Enum: create only if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_importancia_modulo') THEN
        CREATE TYPE enum_importancia_modulo AS ENUM ('Alta', 'Media', 'Baixa', 'Base');
    END IF;
END $$;

-- 2) Column importancia on modulos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'modulos' AND column_name = 'importancia'
    ) THEN
        ALTER TABLE public.modulos ADD COLUMN importancia enum_importancia_modulo DEFAULT 'Base';
    END IF;
END $$;

-- 3) Table flashcards
CREATE TABLE IF NOT EXISTS public.flashcards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    modulo_id UUID REFERENCES public.modulos(id) ON DELETE CASCADE,
    pergunta TEXT NOT NULL,
    resposta TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4) Table progresso_flashcards
CREATE TABLE IF NOT EXISTS public.progresso_flashcards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE,
    flashcard_id UUID REFERENCES public.flashcards(id) ON DELETE CASCADE,
    nivel_facilidade FLOAT DEFAULT 2.5,
    dias_intervalo INTEGER DEFAULT 0,
    data_proxima_revisao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    numero_revisoes INTEGER DEFAULT 0,
    ultimo_feedback INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(aluno_id, flashcard_id)
);

-- 5) Indexes (create if missing)
CREATE INDEX IF NOT EXISTS idx_flashcards_modulo ON public.flashcards(modulo_id);
CREATE INDEX IF NOT EXISTS idx_progresso_flash_aluno ON public.progresso_flashcards(aluno_id, data_proxima_revisao);

-- 6) RLS
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progresso_flashcards ENABLE ROW LEVEL SECURITY;

-- 7) Policies (create if missing)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'flashcards' AND policyname = 'Flashcards visiveis'
    ) THEN
        CREATE POLICY "Flashcards visiveis" ON public.flashcards FOR SELECT USING (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'flashcards' AND policyname = 'Professores gerenciam flashcards'
    ) THEN
        CREATE POLICY "Professores gerenciam flashcards" ON public.flashcards FOR ALL USING (EXISTS (SELECT 1 FROM public.professores WHERE id = auth.uid()));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'progresso_flashcards' AND policyname = 'Aluno gerencia seu progresso flashcards'
    ) THEN
        CREATE POLICY "Aluno gerencia seu progresso flashcards" ON public.progresso_flashcards FOR ALL USING (auth.uid() = aluno_id);
    END IF;
END $$;;
