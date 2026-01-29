# Correção: Cadastro de aluno falhando ("Database error creating new user")

**Data:** 2026-01-29  
**Caso:** Cadastro do aluno IGOR CARLOS DE BARROS (igorcontapessoal@outlook.com) falhava.

## Causa raiz

1. **Trigger `handle_new_user`** (em `auth.users`): ao criar usuário no Auth, o trigger inseria em `public.alunos` e `public.professores`. Neste projeto, o modelo foi unificado em **`usuarios`** e essas tabelas **não existem**. O INSERT falhava e o Supabase devolvia "Database error creating new user".

2. **Trigger `sync_aluno_empresa_id`** (em `alunos_cursos`): ao inserir matrícula, atualizava `public.alunos` usando `NEW.aluno_id`. A tabela `alunos_cursos` usa **`usuario_id`** e `alunos` não existe, gerando "relation public.alunos does not exist".

3. **Upsert em `usuarios_empresas`**: o código usava `onConflict: "usuario_id,empresa_id"`, mas a constraint única é **`uq_usuario_empresa_papel`** em `(usuario_id, empresa_id, papel_base)`, gerando "there is no unique or exclusion constraint matching the ON CONFLICT specification".

## Correções aplicadas

### 1. Migration `20260129150000_handle_new_user_skip_missing_tables.sql`

- Atualizada `handle_new_user` para checar existência de `alunos` e `professores` antes de inserir.
- Se as tabelas não existirem, o trigger não insere nelas; a aplicação segue criando o registro em `usuarios`.

### 2. Migration `20260129160000_fix_sync_aluno_empresa_id_...` (via MCP)

- `sync_aluno_empresa_id` passou a atualizar **`usuarios`** usando **`NEW.usuario_id`** (em vez de `alunos` e `aluno_id`).

### 3. Código da aplicação

- **`student.repository`**: `usuarios_empresas` upsert com `onConflict: "usuario_id,empresa_id,papel_base"`.
- **`teacher.repository`**: mesmo ajuste no `onConflict` do upsert em `usuarios_empresas`.

## Como cadastrar o aluno (gestão)

1. **Professor** logado acessa a gestão de alunos (ex.: `/{tenant}/usuario/alunos`).
2. Clica em **Adicionar aluno**.
3. Preenche:
   - **Nome completo:** IGOR CARLOS DE BARROS  
   - **E-mail:** igorcontapessoal@outlook.com  
   - **CPF:** 44074639882  
   - **Telefone:** 16991703993  
   - **Número de matrícula:** (opcional, mas recomendado)  
   - **Ao menos um curso**  
   - **Senha temporária** (mín. 8 caracteres) ou use "Gerar senha" com CPF + curso.
4. Salva.

**Importação em lote:** planilha deve ter `fullName`, `email`, `enrollmentNumber`, CPF ou senha temporária, e ao menos um curso por linha.

## Script de diagnóstico

`scripts/usuario/create-aluno-diagnostico.ts` tenta cadastrar o aluno com dados fixos (empresa/curso de exemplo). Uso:

```bash
npx tsx scripts/usuario/create-aluno-diagnostico.ts
```

Requer `.env.local` com `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SECRET_KEY` (ou `SUPABASE_SERVICE_ROLE_KEY`).

## Status

O cadastro do Igor foi concluído com sucesso (usuário em `usuarios`, matrícula em `alunos_cursos`). Novos cadastros de alunos devem funcionar com as correções acima.
