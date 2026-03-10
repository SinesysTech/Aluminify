## 1. Migração de banco de dados

- [x] 1.1 Criar migração SQL que adiciona `access_token_encrypted` (bytea, NULL), `refresh_token_encrypted` (bytea, NULL) e `token_expiry` (timestamptz, NULL) em `empresa_oauth_credentials`
- [x] 1.2 Atualizar RPC `upsert_oauth_credential` para aceitar e criptografar `access_token` e `refresh_token` (parâmetros opcionais com default NULL)
- [x] 1.3 Atualizar RPC `get_oauth_credentials` para retornar `access_token` e `refresh_token` decriptados + `token_expiry`
- [x] 1.4 Aplicar migração e regenerar types (`database.types.ts`)

## 2. Service layer — OAuth credentials

- [x] 2.1 Adicionar tipo `OAuthTokens` (`accessToken`, `refreshToken`, `tokenExpiry`) em `oauth-credentials.service.ts`
- [x] 2.2 Criar método `saveOAuthTokens(empresaId, provider, accessToken, refreshToken, tokenExpiry)` que chama a RPC atualizada
- [x] 2.3 Criar método `getOAuthTokens(empresaId, provider)` que retorna tokens decriptados via RPC
- [x] 2.4 Atualizar `getTenantOAuthStatus()` para incluir flag `connected` (tem tokens) além de `configured` (tem client_id)

## 3. Refatorar callbacks OAuth

- [x] 3.1 Refatorar `app/api/empresa/integracoes/google/callback/route.ts` — salvar tokens via `saveOAuthTokens()` em `empresa_oauth_credentials`, remover referência a `professor_integracoes`
- [x] 3.2 Refatorar `app/api/empresa/integracoes/zoom/callback/route.ts` — idem
- [x] 3.3 Atualizar `state` parameter nos callbacks para não exigir `professorId` (apenas `empresaId` + `tenantSlug`)

## 4. Refatorar geração de meeting links

- [x] 4.1 Refatorar `confirmarAgendamento()` em `appointment-actions.ts` — buscar tokens do tenant via `getOAuthTokens(empresaId, provider)` ao invés de query a `professor_integracoes`
- [x] 4.2 Verificar que `generateMeetingLink()` em `meeting-providers.ts` continua funcionando com tokens do tenant (interface `credentials.accessToken` não muda)

## 5. Refatorar UI de integrações

- [x] 5.1 Refatorar `integracao-manager.tsx` para modelo admin-only — admin conecta/desconecta, professor apenas visualiza status
- [x] 5.2 Atualizar `getOAuthAuthorizationUrl()` em `oauth-actions.ts` para não incluir `professorId` no state
- [x] 5.3 Atualizar a página de integrações (`settings/integracoes/page.tsx`) para refletir o modelo per-tenant

## 6. Remover código morto de `professor_integracoes`

- [x] 6.1 Remover `getIntegracaoProfessor()` e `updateIntegracaoProfessor()` de `config-actions.ts`
- [x] 6.2 Remover types `DbProfessorIntegracao` e `ProfessorIntegracao` de `agendamentos/types/types.ts`
- [x] 6.3 Remover todos os `@ts-ignore` e casts `as never` relacionados a `professor_integracoes` em callbacks e config-actions
- [x] 6.4 Deletar arquivo de migração órfão `supabase/migrations/20251210_professor_integracoes.sql`

## 7. Validação

- [x] 7.1 Executar `npm run typecheck` e garantir zero erros (único erro é pré-existente: `v_agendamentos_empresa` view)
- [x] 7.2 Executar `npm run lint` e garantir zero erros
- [x] 7.3 Grep por "professor_integracoes" no codebase e confirmar que não há referências restantes (exceto specs de OpenSpec arquivadas)
