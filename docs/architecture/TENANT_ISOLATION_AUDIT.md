# Tenant Isolation Audit

> Generated: 2026-01-30
> Purpose: Inventory of all tables, RLS policies, helper functions, and isolation status.

## 1. Table Inventory

### Tables WITH `empresa_id` (40 tables)

| Table | RLS Enabled | Policy Count | Notes |
|---|---|---|---|
| agendamento_bloqueios | Yes | 8 | |
| agendamento_configuracoes | Yes | 4 | |
| agendamento_disponibilidade | Yes | 3 | |
| agendamento_notificacoes | Yes | 3 | |
| agendamento_recorrencia | Yes | 5 | |
| agendamentos | Yes | 8 | |
| ai_agents | Yes | 2 | Admin-only management |
| atividades | Yes | 5 | |
| aulas | Yes | 5 | |
| aulas_concluidas | Yes | 3 | |
| chat_conversation_history | Yes | 2 | |
| chat_conversations | Yes | 2 | |
| color_palettes | Yes | 1 | Branding |
| coupons | Yes | 4 | E-commerce |
| cronogramas | Yes | 3 | |
| cursos | Yes | 7 | Core academic |
| custom_theme_presets | Yes | 1 | Branding |
| disciplinas | Yes | 4 | |
| flashcards | Yes | 4 | |
| font_schemes | Yes | 1 | Branding |
| frentes | Yes | 5 | |
| materiais_curso | Yes | 6 | |
| matriculas | Yes | 5 | |
| modulos | Yes | 5 | |
| papeis | Yes | 6 | Custom roles per tenant |
| payment_providers | Yes | 4 | E-commerce |
| products | Yes | 4 | E-commerce |
| progresso_atividades | Yes | 5 | |
| progresso_flashcards | Yes | 4 | |
| regras_atividades | Yes | 3 | |
| segmentos | Yes | 4 | |
| sessoes_estudo | Yes | 3 | |
| tenant_branding | Yes | 1 | |
| tenant_module_visibility | Yes | 2 | |
| tenant_submodule_visibility | Yes | 2 | |
| transactions | Yes | 4 | E-commerce |
| turmas | Yes | 3 | |
| usuarios | Yes | 6 | Core user table |
| usuarios_disciplinas | Yes | 5 | |
| usuarios_empresas | Yes | 4 | Tenant binding |

### Tables WITHOUT `empresa_id` (11 tables)

| Table | RLS Enabled | Policy Count | User Ref Columns | Risk Level | Action Needed |
|---|---|---|---|---|---|
| alunos_cursos | Yes | 7 | usuario_id | LOW | Junction table; isolated via curso RLS |
| alunos_turmas | Yes | 3 | usuario_id | LOW | Junction table; isolated via turma RLS |
| api_keys | Yes | 7 | created_by | MEDIUM | Add empresa_id for direct filtering |
| cronograma_itens | Yes | 2 | — | LOW | Linked to cronogramas (has empresa_id) |
| cronograma_semanas_dias | Yes | 2 | — | LOW | Linked to cronogramas |
| cronograma_tempo_estudos | Yes | 2 | — | LOW | Linked to cronogramas |
| cursos_disciplinas | Yes | 4 | — | LOW | Junction table; isolated via cursos RLS |
| empresas | Yes | 2 | — | N/A | IS the tenant table |
| module_definitions | Yes | 1 | — | N/A | Global config (USING true is acceptable) |
| submodule_definitions | Yes | 1 | — | N/A | Global config (USING true is acceptable) |
| tenant_logos | Yes | 1 | — | MEDIUM | Add empresa_id for direct filtering |

## 2. Helper Functions Inventory

| Function | Arguments | Security | Volatility | Search Path | Status |
|---|---|---|---|---|---|
| `get_user_empresa_id` | — | DEFINER | STABLE | `""` | OK |
| `is_empresa_admin` | — | DEFINER | STABLE | `""` | OK |
| `is_empresa_admin` | user_id, empresa_id | DEFINER | STABLE | `""` | OK |
| `is_empresa_owner` | empresa_id | DEFINER | STABLE | `""` | OK |
| `user_belongs_to_empresa` | empresa_id | DEFINER | STABLE | `""` | OK |
| `aluno_matriculado_empresa` | empresa_id | DEFINER | STABLE | `""` | OK |
| `get_aluno_empresa_id` | — | DEFINER | STABLE | `""` | OK |
| `get_aluno_empresas` | — | **INVOKER** | STABLE | `""` | **NEEDS FIX** |
| `get_auth_user_empresa_id` | — | DEFINER | STABLE | `""` | OK |
| `get_auth_user_id_by_email` | email | DEFINER | VOLATILE | `public,auth,pg_temp` | OK |
| `get_student_ids_by_empresa_courses` | empresa_id | DEFINER | VOLATILE | `""` | OK |
| `get_matriculas_aluno` | aluno_id | DEFINER | VOLATILE | `public` | OK |
| `is_aluno` | — | DEFINER | STABLE | `""` | OK |
| `aluno_em_turma` | turma_id | DEFINER | VOLATILE | `public` | OK |
| `handle_new_user` | — | DEFINER | VOLATILE | `""` | OK |
| `validate_curso_disciplina_tenant` | — | DEFINER | VOLATILE | `public` | OK |
| `validate_curso_tenant_references` | — | DEFINER | VOLATILE | `public` | OK |
| `sync_aluno_empresa_id` | — | DEFINER | VOLATILE | `public` | OK |

## 3. Tables with Dependencies Between Tenants

```
empresas (tenant root)
├── usuarios (empresa_id) ──┐
├── usuarios_empresas ──────┤
├── cursos ─────────────────┤
│   ├── frentes             │
│   ├── modulos             │
│   │   ├── aulas           │
│   │   ├── flashcards      │
│   │   └── atividades      │
│   ├── materiais_curso     │
│   └── cursos_disciplinas (no empresa_id — via cursos)
├── disciplinas             │
├── segmentos               │
├── cronogramas             │
├── agendamentos            │
├── turmas                  │
├── tenant_branding         │
├── papeis                  │
└── ai_agents               │
                            │
alunos_cursos (no empresa_id — junction via cursos + usuarios)
alunos_turmas (no empresa_id — junction via turmas + usuarios)
api_keys (no empresa_id — via created_by → usuarios)
```

## 4. Identified Issues

### CRITICAL
- **`get_aluno_empresas()`** still uses SECURITY INVOKER — should be SECURITY DEFINER to avoid permission issues when called from RLS policies.

### HIGH
- **`api_keys`** lacks `empresa_id` — isolated only via `created_by` user reference, which requires joins.
- **`tenant_logos`** lacks `empresa_id` — isolated only via branding table joins.

### MEDIUM
- Some autofill trigger functions use `search_path = 'public, pg_temp'` instead of empty string. Not a vulnerability but inconsistent.
- Junction tables (`alunos_cursos`, `alunos_turmas`, `cursos_disciplinas`) rely on parent table RLS for isolation. This is acceptable but adds join overhead.

### LOW
- `module_definitions` and `submodule_definitions` use `USING (true)` — acceptable for global config tables.
- Some policies reference `usuarios` table directly for empresa lookup instead of using `get_user_empresa_id()`, creating slightly different code paths.
