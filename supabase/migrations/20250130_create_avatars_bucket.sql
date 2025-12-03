-- Políticas RLS para o bucket 'avatars'
-- IMPORTANTE: Execute estas políticas APÓS criar o bucket 'avatars' no Supabase Dashboard
-- ou via API endpoint POST /api/user/avatar/create-bucket
--
-- Para criar o bucket:
-- 1. Supabase Dashboard > Storage > Create bucket > Nome: "avatars" > Public: true
-- 2. Ou via API: POST /api/user/avatar/create-bucket (requer SUPABASE_SERVICE_ROLE_KEY)
--
-- Depois de criar o bucket, execute este arquivo para configurar as políticas RLS

-- Política para permitir que usuários façam upload de seus próprios avatares
-- Os arquivos são nomeados como: {user_id}-{timestamp}.{ext}
CREATE POLICY IF NOT EXISTS "Users can upload their own avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'::text
  AND (name ~ ('^' || auth.uid()::text || '-'))
);

-- Política para permitir leitura pública de avatares
CREATE POLICY IF NOT EXISTS "Public avatar access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars'::text);

-- Política para permitir que usuários atualizem seus próprios avatares
CREATE POLICY IF NOT EXISTS "Users can update their own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'::text
  AND (name ~ ('^' || auth.uid()::text || '-'))
)
WITH CHECK (
  bucket_id = 'avatars'::text
  AND (name ~ ('^' || auth.uid()::text || '-'))
);

-- Política para permitir que usuários deletem seus próprios avatares
CREATE POLICY IF NOT EXISTS "Users can delete their own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'::text
  AND (name ~ ('^' || auth.uid()::text || '-'))
);

