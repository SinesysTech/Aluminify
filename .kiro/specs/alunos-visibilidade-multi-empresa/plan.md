# Plano: Alunos visíveis em múltiplas empresas e revogação por empresa

## Objetivo

1. **Visibilidade:** Um aluno matriculado em cursos de mais de uma empresa (ex.: CDF e Química Online) deve aparecer na tela de alunos de cada empresa e em cada curso correspondente.
2. **Revogação por empresa:** Quando uma empresa "exclui" o aluno, deve remover apenas o vínculo dele com os cursos dessa empresa; o usuário continua existindo e mantém acesso aos cursos das outras empresas.

## Contexto do problema

- **Visibilidade:** A política RLS de SELECT em `usuarios` hoje só permite ver linhas onde `empresa_id = get_auth_user_empresa_id()`. Alunos com `empresa_id` de outra empresa (ex.: CDF) não aparecem para o Química Online, mesmo estando em `alunos_cursos` para curso do Química Online.
- **Exclusão:** O "excluir aluno" atual faz soft delete global em `usuarios` (`deleted_at = now()`). Assim, quando CDF exclui o Simas Turbo, ele some em todo o sistema, inclusive no Química Online.

## Solução em dois pilares

---

### Pilar 1: RLS SELECT em `usuarios` (visibilidade)

**Arquivo:** Nova migration em `supabase/migrations/` (ex.: `YYYYMMDDHHMMSS_usuarios_select_policy_alunos_matriculados.sql`).

**Alteração:** Ajustar apenas a política de **SELECT** em `usuarios`:

- **Nome:** "Users can view empresa colleagues" (manter).
- **USING:** permitir ver um usuário quando:
  1. `empresa_id = get_auth_user_empresa_id()` (comportamento atual), **ou**
  2. O usuário está matriculado em algum curso da empresa do usuário logado:
     - `EXISTS (SELECT 1 FROM public.alunos_cursos ac INNER JOIN public.cursos c ON c.id = ac.curso_id WHERE ac.usuario_id = usuarios.id AND c.empresa_id = get_auth_user_empresa_id())`.

**Não alterar:** políticas de INSERT, UPDATE e DELETE em `usuarios` (continuam restritas à própria empresa).

**Referência:** Política atual em [supabase/migrations/20260129000000_remove_superadmin.sql](supabase/migrations/20260129000000_remove_superadmin.sql) (linhas 1443–1450). Tabela `alunos_cursos` usa `usuario_id` ([database.types](app/shared/types/entities/database.types.ts)).

---

### Pilar 2: "Excluir aluno" = revogar acesso só da minha empresa

**Objetivo:** Ao "excluir" um aluno no contexto de uma empresa, remover apenas as matrículas dele nos cursos dessa empresa; não fazer soft delete global em `usuarios`.

**Fluxo desejado:**

1. Admin da CDF clica em "excluir" no Simas Turbo → removem-se apenas as linhas em `alunos_cursos` onde `usuario_id = Simas` e o curso pertence à CDF. O registro em `usuarios` permanece; Simas continua visível e com acesso no Química Online.
2. Se ambas as empresas revogarem → o usuário fica sem matrículas em nenhum curso; o registro em `usuarios` continua existindo (opcional: `empresa_id = null` quando não houver mais matrículas).

**Implementação:**

| Camada | Arquivo | Alteração |
|--------|---------|-----------|
| Repository | [app/[tenant]/(modules)/usuario/services/student.repository.ts](app/[tenant]/(modules)/usuario/services/student.repository.ts) | Trocar `delete(id)` por lógica "revogar por empresa": receber `empresaId`; deletar em `alunos_cursos` onde `usuario_id = id` e `curso_id` em cursos com `cursos.empresa_id = empresaId`; **não** atualizar `usuarios.deleted_at`. Opcional: se o usuário ficar sem nenhuma matrícula em nenhum curso, atualizar `usuarios.empresa_id = null`. |
| Service | [app/[tenant]/(modules)/usuario/services/student.service.ts](app/[tenant]/(modules)/usuario/services/student.service.ts) | Assinatura do método de exclusão passar a receber `empresaId` (do usuário autenticado) e repassar ao repository. |
| Action | [app/[tenant]/(modules)/usuario/(gestao)/alunos/actions.ts](app/[tenant]/(modules)/usuario/(gestao)/alunos/actions.ts) | Em `deleteStudentAction`, obter `user.empresaId` e passar para o service. |
| API | [app/api/usuario/alunos/[id]/route.ts](app/api/usuario/alunos/[id]/route.ts) | No handler DELETE, obter `empresaId` do request (usuário autenticado) e passar para o service. |

**RLS:** Garantir que a política de DELETE em `alunos_cursos` permita à empresa remover matrículas dos seus cursos (verificar migrations existentes). Não é necessário permitir DELETE em `usuarios` para essa ação.

**Detalhe técnico:** No repository, para deletar apenas matrículas da empresa:

- Buscar `curso_id` dos cursos da empresa: `SELECT id FROM cursos WHERE empresa_id = ?`.
- Deletar de `alunos_cursos` onde `usuario_id = id` e `curso_id IN (...)`.

Ou usar subquery no DELETE: `DELETE FROM alunos_cursos WHERE usuario_id = ? AND curso_id IN (SELECT id FROM cursos WHERE empresa_id = ?)`.

---

## Resumo das tarefas

1. **Migration RLS:** Criar migration que altera a política SELECT em `usuarios` (Pilar 1).
2. **Repository:** Implementar "revogar por empresa" no student repository (substituir/estender `delete` por método que recebe `empresaId` e remove só `alunos_cursos` da empresa; opcional atualizar `usuarios.empresa_id` quando não houver mais matrículas).
3. **Service:** Ajustar student service para receber `empresaId` na exclusão e repassar ao repository.
4. **Action e API:** Passar `empresaId` do usuário autenticado para o service no fluxo de exclusão.
5. **Testes manuais:** (1) Listar alunos do curso Química das Manas como admin Química Online e validar presença do Simas Turbo; (2) Como admin CDF, "excluir" Simas Turbo e validar que ele continua visível e com acesso no Química Online; (3) Como admin Química Online, "excluir" Simas Turbo e validar que ele some só do Química Online.

---

## Segurança e edge cases

- **Leitura:** A mudança de RLS amplia apenas SELECT; não expõe usuários de outras empresas além dos que já têm vínculo via matrícula em curso da empresa.
- **Escrita:** INSERT/UPDATE/DELETE em `usuarios` seguem restritos à própria empresa; a "exclusão" passa a ser feita apenas em `alunos_cursos`.
- **Usuário sem matrículas:** Após ambas as empresas revogarem, o usuário permanece em `usuarios` (sem soft delete); pode ficar com `empresa_id = null` e sem linhas em `alunos_cursos`.

---

## Completude e verificações

- **RLS `alunos_cursos` (DELETE):** As políticas "Apenas admins podem deletar matrículas" e "Admins podem remover matriculas de cursos da sua empresa" em `alunos_cursos` já permitem à empresa remover matrículas dos seus cursos (`cursos.empresa_id = get_user_empresa_id()`). Nenhuma alteração necessária nas políticas de `alunos_cursos`.
- **Função de contexto na migration (Pilar 1):** A política atual em `usuarios` usa `get_auth_user_empresa_id()`. Na nova migration, usar a **mesma** função. Se ao aplicar a migration surgir erro de função inexistente, trocar para `get_user_empresa_id()` (usada no restante das políticas do mesmo arquivo).
- **Interface do repositório:** A assinatura `delete(id: string)` em `StudentRepository` deve passar a `delete(id: string, empresaId: string)` (ou `revokeFromEmpresa(id: string, empresaId: string)` mantendo `delete` como alias). Todos os chamadores (service, e indiretamente action e API) devem ser atualizados para passar `empresaId`.
- **Service `ensureExists`:** O `delete` do service hoje chama `ensureExists(id)` antes de `repository.delete(id)`. Com a nova lógica, continuar garantindo que o usuário exista antes de revogar; após o Pilar 1 (RLS SELECT), o usuário logado (ex.: Química Online) conseguirá ver o aluno de outra empresa (ex.: CDF) quando ele estiver matriculado em curso da Química Online, então `ensureExists` não bloqueará indevidamente.
- **Pontos de entrada da exclusão:** São dois: (1) Server Action `deleteStudentAction` em `actions.ts` (usa `getServiceRoleClient()` — RLS bypassado; basta passar `user.empresaId`); (2) API REST `DELETE /api/usuario/alunos/[id]` em `route.ts` (usa `createClient()` — RLS ativo; obter `empresaId` de `request.user` via middleware `requireAuth` e passar ao service). O plano já cita ambos.
- **UI:** Os componentes que disparam a exclusão (ex.: `delete-student-dialog.tsx`, `student-details.tsx`) continuam chamando a mesma action ou a mesma API; não precisam de alteração desde que a action/API passem a enviar o `empresaId` internamente.
