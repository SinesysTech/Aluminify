## Why

As integrações OAuth com Google Meet e Zoom estão implementadas num modelo per-professor (`professor_integracoes`), onde cada professor conecta sua própria conta pessoal. O modelo correto para o Aluminify é per-tenant: o administrador do tenant conecta **uma** conta corporativa e todos os agendamentos usam essa integração. Além disso, a tabela `professor_integracoes` foi dropada manualmente do banco remoto e não existe mais — toda a feature de geração automática de links de reunião está silenciosamente quebrada em produção (callbacks OAuth perdem tokens, queries falham sem erro).

## What Changes

- **BREAKING**: Remover completamente o conceito de `professor_integracoes` (tabela fantasma, types, queries, UI de conexão per-professor)
- Estender `empresa_oauth_credentials` com colunas `access_token`, `refresh_token`, `token_expiry` para armazenar tokens OAuth do tenant (hoje só armazena `client_id` + `client_secret`)
- Refatorar callbacks OAuth (Google/Zoom) para salvar tokens na `empresa_oauth_credentials` ao invés de per-professor
- Refatorar `generateMeetingLink()` e `confirmarAgendamento()` para usar tokens do tenant ao criar reuniões
- Simplificar a UI de integrações: admin conecta a conta corporativa; professores não precisam de fluxo OAuth individual
- Remover arquivo de migração órfão `20251210_professor_integracoes.sql`
- Eliminar todos os `@ts-ignore` e casts `as never` que existiam por causa da tabela fantasma
- Criptografar `access_token` e `refresh_token` com `pgp_sym_encrypt` (mesmo padrão do `client_secret`)

## Capabilities

### New Capabilities

_Nenhuma — a funcionalidade de integrações já existe, apenas muda o modelo de dados._

### Modified Capabilities

- `scheduling`: Os requisitos de "Integration Management" mudam de per-professor para per-tenant. Cenários de OAuth passam do professor para o admin. Geração de meeting links usa tokens do tenant.

## Impact

### Banco de dados
- **Migração**: Adicionar colunas `access_token_encrypted`, `refresh_token_encrypted`, `token_expiry` em `empresa_oauth_credentials`
- **Cleanup**: Remover entrada fantasma de `professor_integracoes` em `schema_migrations` (migração `20260130160030` registrada mas sem efeito)
- **Remover**: Arquivo `supabase/migrations/20251210_professor_integracoes.sql` (naming fora do padrão, nunca aplicado)

### Código afetado
- `app/[tenant]/(modules)/agendamentos/lib/config-actions.ts` — remover `getIntegracaoProfessor()`, `updateIntegracaoProfessor()`; criar funções equivalentes para tenant
- `app/[tenant]/(modules)/agendamentos/lib/appointment-actions.ts` — `confirmarAgendamento()` busca tokens do tenant ao invés do professor
- `app/[tenant]/(modules)/agendamentos/lib/meeting-providers.ts` — `generateMeetingLink()` recebe tokens do tenant
- `app/api/empresa/integracoes/google/callback/route.ts` — salvar tokens em `empresa_oauth_credentials`
- `app/api/empresa/integracoes/zoom/callback/route.ts` — idem
- `app/[tenant]/(modules)/agendamentos/types/types.ts` — remover `DbProfessorIntegracao`, `ProfessorIntegracao`
- `app/[tenant]/(modules)/agendamentos/configuracoes/components/integracao-manager.tsx` — refatorar para modelo tenant (admin-only)
- `app/[tenant]/(modules)/settings/integracoes/` — simplificar UI, remover fluxo OAuth per-professor
- `app/shared/core/services/oauth-credentials/oauth-credentials.service.ts` — adicionar métodos para get/save tokens do tenant

### APIs
- Callbacks OAuth (`/api/empresa/integracoes/{google,zoom}/callback`) mudam o destino dos tokens
- Nenhuma API pública nova; fluxo OAuth existente é reaproveitado

### Segurança
- Tokens OAuth passam a ser criptografados no banco (hoje `professor_integracoes` guardava em texto plano)
- Acesso aos tokens restrito a operações server-side com service-role client
