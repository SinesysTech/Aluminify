ALTER TABLE "public"."alunos" ADD COLUMN "deleted_at" timestamp with time zone DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_alunos_deleted_at ON public.alunos(deleted_at);
