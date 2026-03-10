## Context

A plataforma Aluminify opera em modelo multi-tenant onde instituições educacionais (empresas) são criadas por um administrador inicial via `POST /api/empresa/self`. O auth flow já possui um padrão de "gate" — quando `mustChangePassword` é `true`, `requireUser()` redireciona para `/primeiro-acesso` bloqueando acesso ao sistema.

Os 3 documentos legais já existem como Markdown em `docs/`:
- `Aluminify_01_Termos_de_Uso.md` (v2.0)
- `Aluminify_02_Politica_de_Privacidade.md` (v2.0)
- `Aluminify_03_DPA_Acordo_Processamento_Dados.md` (v1.0)

Não existe nenhuma tabela, campo ou mecanismo para rastrear aceite de termos no banco de dados atual.

## Goals / Non-Goals

**Goals:**
- Registrar aceite formal dos 3 documentos legais por administradores de tenant com trilha de auditoria completa
- Bloquear acesso ao sistema para admins que não aceitaram os termos vigentes (gate pattern)
- Disponibilizar documentos legais publicamente na landing page
- Permitir consulta dos termos dentro da plataforma por qualquer usuário autenticado
- Suportar versionamento para exigir re-aceite quando documentos forem atualizados

**Non-Goals:**
- Aceite por alunos ou professores não-admin (a instituição é a contratante, o admin aceita em nome dela)
- Editor de termos no painel administrativo (versões são gerenciadas via código/deploy)
- Assinatura digital ou certificação de aceite (registro simples com metadados é suficiente)
- Tradução dos termos para outros idiomas

## Decisions

### 1. Tabela `termos_aceite` no Supabase

**Decisão:** Criar tabela dedicada para registrar cada aceite individual.

```sql
create table termos_aceite (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id),
  empresa_id uuid not null references empresas(id),
  tipo_documento text not null check (tipo_documento in ('termos_uso', 'politica_privacidade', 'dpa')),
  versao text not null,
  ip_address inet,
  user_agent text,
  accepted_at timestamptz not null default now()
);
```

**Alternativa descartada:** Campo JSONB em `empresas.configuracoes` — não permite auditoria individual por admin nem rastreio de IP/user-agent.

**RLS:** Policy de leitura para admins do tenant. Inserção via service-role no endpoint de aceite.

### 2. Gate de aceite via extensão do `requireUser()`

**Decisão:** Adicionar verificação de aceite de termos no `requireUser()`, similar ao padrão `mustChangePassword`. Se o usuário é admin/owner e não aceitou todos os termos vigentes, redirecionar para `/{tenant}/aceite-termos`.

**Fluxo:**
1. `getAuthenticatedUser()` já retorna `isAdmin` e `isOwner`
2. Para admins, verificar no Redis cache (ou DB fallback) se aceitou todas as versões vigentes
3. Se não aceitou → `redirect("/{tenant}/aceite-termos")`
4. A página de aceite exibe os 3 documentos e um checkbox para cada
5. Ao aceitar, `POST /api/empresa/{empresaId}/termos/aceitar` registra os aceites e invalida cache

**Alternativa descartada:** Middleware de Next.js — o middleware não tem acesso ao contexto completo do usuário (role, tenant) necessário para a verificação. Manter no `requireUser()` é mais consistente com o padrão existente.

### 3. Versões dos termos como constantes no código

**Decisão:** Manter um mapa de versões vigentes em uma constante TypeScript (`TERMOS_VIGENTES`), não no banco de dados.

```typescript
export const TERMOS_VIGENTES = {
  termos_uso: "2.0",
  politica_privacidade: "2.0",
  dpa: "1.0",
} as const;
```

**Justificativa:** Os documentos já são versionados manualmente nos arquivos Markdown. Manter a versão vigente como constante no código garante que uma atualização de termos é um deploy consciente. Quando uma versão muda, todos os admins que aceitaram a versão anterior serão re-direcionados para aceitar a nova.

### 4. Páginas públicas renderizando Markdown

**Decisão:** Criar rotas públicas em `app/(landing-page)/termos-de-uso/`, `app/(landing-page)/politica-de-privacidade/` e `app/(landing-page)/dpa/` que leem os arquivos `.md` de `docs/` e renderizam como HTML no servidor.

**Abordagem:** Usar uma lib leve como `marked` ou `react-markdown` para converter MD → HTML. Server Components nativos, sem JS no cliente.

### 5. Aceite durante criação de empresa

**Decisão:** Estender o `POST /api/empresa/self` para aceitar um campo `termos_aceitos: boolean` obrigatório. O frontend exibirá checkboxes para cada documento com links para visualização. O backend registra os aceites na tabela `termos_aceite` como parte da transação de criação.

### 6. Página de consulta no tenant

**Decisão:** Nova rota `app/[tenant]/(modules)/termos/page.tsx` acessível por qualquer usuário autenticado. Exibe os 3 documentos renderizados e, para admins, mostra o histórico de aceites.

## Risks / Trade-offs

- **[Performance] Verificação de aceite em cada request** → Cache em Redis (mesma infra já usada para sessões). TTL de 30min alinhado com cache de sessão. Invalidar ao aceitar novos termos.

- **[UX] Bloqueio total do sistema até aceite** → Necessário para conformidade legal. A tela de aceite será clara e rápida (3 checkboxes + botão). Admin aceita uma vez por versão.

- **[Deploy] Mudança de versão exige deploy** → Trade-off aceitável. Mudanças de termos legais são raras e devem ser um ato deliberado, não uma operação de banco de dados.

- **[Escopo] Apenas admins aceitam** → Alinhado com o modelo jurídico: a instituição (representada pelo admin) é a contratante. Alunos são usuários finais cujos dados são responsabilidade da instituição.

## Open Questions

- Definir se o aceite deve ser por admin individual ou se o aceite de qualquer admin/owner vale para todo o tenant (recomendação: por admin individual para maior rastreabilidade)
