## Context

O Aluminify usa integrações OAuth com Google e Zoom para gerar links de reunião automaticamente ao confirmar agendamentos. A arquitetura atual tem dois níveis:

1. **`empresa_oauth_credentials`** (existe, funcional) — armazena `client_id` + `client_secret` criptografado por tenant. O admin configura as credenciais do app OAuth.
2. **`professor_integracoes`** (fantasma, não existe no banco) — deveria armazenar `access_token` + `refresh_token` por professor. Cada professor conectaria sua conta pessoal.

O modelo per-professor está quebrado em produção (tabela dropada, arquivo de migração deletado, código usa `@ts-ignore`). O modelo correto é per-tenant: o admin conecta UMA conta corporativa.

**Schema atual de `empresa_oauth_credentials`:**

| Coluna | Tipo | Nullable |
|--------|------|----------|
| id | uuid | NOT NULL |
| empresa_id | uuid | NOT NULL |
| provider | text | NOT NULL |
| client_id | text | NOT NULL |
| client_secret_encrypted | bytea | NOT NULL |
| extra_config | jsonb | NULL |
| active | boolean | NOT NULL |
| configured_by | uuid | NULL |
| created_at | timestamptz | NOT NULL |
| updated_at | timestamptz | NULL |

A tabela já usa `pgp_sym_encrypt` para o `client_secret`, via RPCs `upsert_oauth_credential` e `get_oauth_credentials`. Acesso é feito exclusivamente via service-role client (`getDatabaseClient()`).

## Goals / Non-Goals

**Goals:**
- Consolidar o armazenamento de tokens OAuth (access/refresh) na tabela `empresa_oauth_credentials` existente
- Manter a criptografia consistente: tokens criptografados com o mesmo padrão do `client_secret`
- Simplificar o fluxo: admin conecta a conta corporativa → todos os agendamentos usam esses tokens
- Eliminar todo código morto referente a `professor_integracoes`
- Restaurar a feature de geração automática de meeting links (Google Meet / Zoom)

**Non-Goals:**
- Implementar refresh automático de tokens (OAuth token refresh) — fica para uma iteração futura
- Suportar múltiplas contas por provider por tenant (uma conta Google + uma Zoom é suficiente)
- Migrar dados existentes de `professor_integracoes` (tabela não existe, não há dados)
- Alterar o fluxo de configuração de `client_id`/`client_secret` (já funciona)

## Decisions

### 1. Estender `empresa_oauth_credentials` vs criar nova tabela

**Decisão:** Estender a tabela existente com 3 novas colunas.

**Alternativa descartada:** Criar uma tabela separada `empresa_oauth_tokens`. Separaria app credentials de user tokens, mas adicionaria complexidade desnecessária (join extra, mais RLS policies, mais RPCs). Como a relação é 1:1 (um registro por empresa+provider), não há razão para separar.

**Colunas a adicionar:**
- `access_token_encrypted` (bytea, NULL) — criptografado com `pgp_sym_encrypt`
- `refresh_token_encrypted` (bytea, NULL) — criptografado com `pgp_sym_encrypt`
- `token_expiry` (timestamptz, NULL) — quando o access_token expira

Todas nullable porque as credenciais do app (`client_id`/`client_secret`) podem ser configuradas antes do admin completar o fluxo OAuth.

### 2. Criptografia dos tokens

**Decisão:** Usar o mesmo mecanismo de criptografia existente (`pgp_sym_encrypt`/`pgp_sym_decrypt` com `OAUTH_ENCRYPTION_KEY`).

**Rationale:** Consistência com o padrão já estabelecido para `client_secret_encrypted`. A chave de criptografia já existe em `env.OAUTH_ENCRYPTION_KEY`.

**Impacto:** As RPCs `upsert_oauth_credential` e `get_oauth_credentials` precisam ser atualizadas para lidar com os novos campos.

### 3. Fluxo OAuth: admin-only

**Decisão:** O fluxo OAuth (redirect → callback → token storage) é restrito ao admin do tenant.

**Antes:** Qualquer professor podia iniciar o OAuth e conectar sua conta pessoal.
**Depois:** Apenas admins iniciam o OAuth. O `state` parameter no callback não carrega mais `professorId`; apenas `empresaId` e `tenantSlug`.

A UI de integrações (`IntegracaoManager`) passa a ser admin-only. Professores veem o status (Google/Zoom conectado) mas não controlam a conexão.

### 4. `generateMeetingLink()` — buscar tokens do tenant

**Decisão:** Refatorar `confirmarAgendamento()` para buscar tokens via `getOAuthCredentials()` (service existente) ao invés de query a `professor_integracoes`.

O service `oauth-credentials.service.ts` ganha um novo método `getOAuthTokens(empresaId, provider)` que retorna `{ accessToken, refreshToken, tokenExpiry }` decriptados. O `generateMeetingLink()` já aceita `credentials.accessToken` — a interface não muda, apenas a origem do token.

### 5. Cleanup do `professor_integracoes`

**Decisão:** Remoção completa sem backwards compatibility.

- Deletar arquivo `supabase/migrations/20251210_professor_integracoes.sql`
- Remover types `DbProfessorIntegracao` e `ProfessorIntegracao`
- Remover funções `getIntegracaoProfessor()` e `updateIntegracaoProfessor()`
- Remover `@ts-ignore` e casts `as never` nos callbacks e config-actions
- Limpar referências no `integracao-manager.tsx`

Não é necessária migração para dropar a tabela (ela não existe no banco). A entrada fantasma em `schema_migrations` pode ser mantida (não causa efeito).

## Risks / Trade-offs

**[Tokens expirados]** → Google access tokens expiram em ~1h. Sem refresh automático, a geração de meeting links falhará silenciosamente após 1h da conexão. **Mitigação:** O fallback para `link_reuniao_padrao` já existe no `generateMeetingLink()`. Token refresh será implementado numa iteração futura.

**[Conta corporativa compartilhada]** → Todos os meetings são criados na mesma conta Google/Zoom. Se a conta tiver limites (ex: Zoom free = 40min), afeta todos os agendamentos. **Mitigação:** Documentar que contas business/enterprise são recomendadas. Isso é inerente ao modelo per-tenant.

**[Admin desconecta a conta]** → Se o admin remover a integração OAuth, todos os agendamentos futuros perdem a geração automática de links. **Mitigação:** O fallback para link padrão já existe. A UI deve mostrar warning ao desconectar.

**[RPCs existentes]** → As RPCs `upsert_oauth_credential` e `get_oauth_credentials` são functions PostgreSQL que precisam ser atualizadas. Se a migração falhar parcialmente, o fluxo existente de client_id/secret pode ser afetado. **Mitigação:** Migração única e atômica. Testar RPCs antes e depois.

## Migration Plan

1. **Migração SQL (única, atômica):**
   - `ALTER TABLE empresa_oauth_credentials ADD COLUMN access_token_encrypted bytea`
   - `ALTER TABLE empresa_oauth_credentials ADD COLUMN refresh_token_encrypted bytea`
   - `ALTER TABLE empresa_oauth_credentials ADD COLUMN token_expiry timestamptz`
   - `CREATE OR REPLACE FUNCTION upsert_oauth_credential(...)` — atualizada para aceitar novos campos
   - `CREATE OR REPLACE FUNCTION get_oauth_credentials(...)` — atualizada para retornar novos campos decriptados

2. **Deploy:** Migração pode ser aplicada a qualquer momento pois colunas são nullable e RPCs são backwards-compatible (parâmetros extras com defaults).

3. **Rollback:** `ALTER TABLE empresa_oauth_credentials DROP COLUMN` para as 3 colunas. RPCs revertem para versão anterior.

## Open Questions

- Definir a estratégia de token refresh (iteração futura, mas impacta a usabilidade da feature).
