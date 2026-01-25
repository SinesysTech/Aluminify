# Primeiro Professor como Superadmin

## Funcionamento

Quando um professor é criado via frontend (cadastro), o sistema verifica automaticamente se é o primeiro professor cadastrado. Se for, ele é automaticamente promovido a **superadmin**.

## Implementação

### 1. Função no Supabase

A função `check_and_set_first_professor_superadmin` é executada após a criação de um professor:

```sql
-- Verifica se há apenas 1 professor na tabela
-- Se sim, atualiza o metadata do usuário para superadmin
```

### 2. Trigger `handle_new_user`

O trigger foi atualizado para:
- Sempre criar como **professor** quando vem do frontend
- Chamar a função de verificação após criar o professor
- Alunos só são criados internamente (não via frontend)

### 3. Endpoint de Signup

O endpoint `/api/auth/signup` foi atualizado para:
- Sempre enviar `role: 'professor'` quando vem do frontend
- Não permitir criação de alunos via frontend

## Fluxo

1. **Usuário faz cadastro no frontend**
   - Preenche email, senha e nome completo
   - Frontend chama `/api/auth/signup`

2. **Backend cria usuário**
   - Endpoint força `role: 'professor'`
   - Supabase cria usuário em `auth.users`
   - Trigger `handle_new_user` é executado

3. **Trigger cria professor**
   - Insere na tabela `professores`
   - Chama `check_and_set_first_professor_superadmin`

4. **Verificação de primeiro professor**
   - Conta quantos professores existem
   - Se há apenas 1 (o recém-criado), atualiza metadata:
     - `role: 'superadmin'`
     - `is_superadmin: true`

5. **Resultado**
   - Primeiro professor: **Superadmin** com acesso total
   - Demais professores: **Professor** normal

## Criação de Alunos

Alunos **não** são criados via frontend. Eles são criados:
- Internamente pelo sistema
- Via API direta (com autenticação apropriada)
- Importação em massa
- Integração com outros sistemas

Para criar um aluno, use o endpoint `/api/student` com autenticação de professor/superadmin.

## Exemplo

### Primeiro Cadastro (Superadmin)

```bash
POST /api/auth/signup
{
  "email": "admin@escola.com",
  "password": "senha123",
  "fullName": "Administrador"
}

# Resultado:
# - Usuário criado em auth.users
# - Registro criado em professores
# - Metadata atualizado: role='superadmin', is_superadmin=true
```

### Segundo Cadastro (Professor Normal)

```bash
POST /api/auth/signup
{
  "email": "professor@escola.com",
  "password": "senha123",
  "fullName": "Professor Silva"
}

# Resultado:
# - Usuário criado em auth.users
# - Registro criado em professores
# - Metadata: role='professor', is_superadmin=false
```

## Segurança

- A função usa `security definer` para ter permissão de atualizar `auth.users`
- A verificação é atômica (contagem + atualização)
- Apenas o primeiro professor recebe superadmin automaticamente
- Demais professores precisam ser promovidos manualmente (se necessário)

