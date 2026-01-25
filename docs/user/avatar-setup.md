# Configuração do Upload de Avatar

## Pré-requisitos

Para que o upload de avatar funcione, é necessário criar um bucket no Supabase Storage. Existem três formas de fazer isso:

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o Supabase Dashboard
2. Vá em **Storage** no menu lateral
3. Clique em **Create bucket**
4. Configure:
   - **Name**: `avatars`
   - **Public bucket**: ✅ Habilitado (para permitir acesso público às imagens)
   - **File size limit**: 5MB (ou o valor desejado)
   - **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/webp,image/gif`

### Opção 2: Via API Endpoint

Se você tiver a `SUPABASE_SERVICE_ROLE_KEY` configurada nas variáveis de ambiente:

```bash
curl -X POST http://localhost:3000/api/user/avatar/create-bucket
```

### Opção 3: Via Migração SQL

Execute a migração SQL em `supabase/migrations/20250130_create_avatars_bucket.sql` para criar as políticas RLS. O bucket ainda precisa ser criado manualmente ou via API.

## Políticas RLS (Row Level Security)

O bucket deve ter políticas RLS configuradas para permitir:

### Política de Upload (INSERT)
- **Policy name**: `Users can upload their own avatars`
- **Allowed operation**: INSERT
- **Policy definition**: 
  ```sql
  (bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])
  ```

### Política de Leitura (SELECT)
- **Policy name**: `Public avatar access`
- **Allowed operation**: SELECT
- **Policy definition**: 
  ```sql
  bucket_id = 'avatars'::text
  ```

### Política de Remoção (DELETE)
- **Policy name**: `Users can delete their own avatars`
- **Allowed operation**: DELETE
- **Policy definition**: 
  ```sql
  (bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])
  ```

## Estrutura de Arquivos

Os avatares são armazenados com o seguinte padrão:
- Nome do arquivo: `{user_id}-{timestamp}.{extensão}`
- Exemplo: `123e4567-e89b-12d3-a456-426614174000-1704067200000.jpg`

## API Endpoints

### POST `/api/user/avatar`
- **Descrição**: Faz upload de uma nova foto de perfil
- **Autenticação**: Requerida (Bearer token)
- **Body**: FormData com campo `file`
- **Limites**:
  - Tamanho máximo: 5MB
  - Tipos permitidos: JPEG, PNG, WEBP, GIF

### DELETE `/api/user/avatar`
- **Descrição**: Remove a foto de perfil do usuário
- **Autenticação**: Requerida (Bearer token)

## Componentes

- `components/avatar-upload.tsx`: Componente de upload de avatar
- `components/profile-settings.tsx`: Página de configurações de perfil (usa AvatarUpload)
- `components/nav-user.tsx`: Exibe o avatar na sidebar

