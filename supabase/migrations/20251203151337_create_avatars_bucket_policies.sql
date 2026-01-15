-- Políticas RLS para o bucket 'avatars'
-- Os arquivos são nomeados como: {user_id}-{timestamp}.{ext}

-- Remover políticas existentes se houver (para evitar conflitos)
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- Política para permitir que usuários façam upload de seus próprios avatares
CREATE POLICY "Users can upload their own avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'::text
  AND (name ~ ('^' || auth.uid()::text || '-'))
);

-- Política para permitir leitura pública de avatares
CREATE POLICY "Public avatar access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars'::text);

-- Política para permitir que usuários atualizem seus próprios avatares
CREATE POLICY "Users can update their own avatars"
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
CREATE POLICY "Users can delete their own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'::text
  AND (name ~ ('^' || auth.uid()::text || '-'))
);;
