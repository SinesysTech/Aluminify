# Tasks: Refactor RBAC - Remove Legacy Code and Add Papéis Management UI

## 1. Migração de Dados

- [ ] 1.1 Criar migration SQL para atualizar metadata de usuários com role="professor" para role="usuario"
- [ ] 1.2 Criar migration SQL para atualizar metadata de usuários com role="empresa" para role="usuario"
- [ ] 1.3 Validar que não existem mais usuários com roles legados após migration

## 2. Remoção de Tipos Legados

- [ ] 2.1 Remover `LegacyAppUserRole` de `types/shared/entities/user.ts`
- [ ] 2.2 Remover `isEmpresaAdmin` de `AppUser` em `types/shared/entities/user.ts`
- [ ] 2.3 Remover `LegacyUserRole` de `backend/auth/types.ts`
- [ ] 2.4 Remover `isAdmin` deprecated de `AuthUser` em `backend/auth/types.ts`

## 3. Limpeza de lib/roles.ts

- [ ] 3.1 Remover import de `LegacyAppUserRole`
- [ ] 3.2 Remover array `PROFESSOR_ROLES`
- [ ] 3.3 Remover array `ADMIN_ROLES` (versão legada com "empresa")
- [ ] 3.4 Remover `LEGACY_ROUTE_BY_ROLE`
- [ ] 3.5 Remover função `isProfessorRole()`
- [ ] 3.6 Remover função `roleSatisfies()`
- [ ] 3.7 Remover função `hasRequiredRole()`
- [ ] 3.8 Atualizar função `isAdminRole()` para aceitar apenas `RoleTipo`
- [ ] 3.9 Simplificar `getDefaultRouteForRole()` para usar apenas `AppUserRole`
- [ ] 3.10 Atualizar função `canImpersonate()` para usar nova assinatura

## 4. Limpeza de lib/auth.ts

- [ ] 4.1 Remover import de `LegacyAppUserRole` e `hasRequiredRole`
- [ ] 4.2 Remover lógica de mapeamento "professor"/"empresa" → "usuario" em `getAuthenticatedUser()`
- [ ] 4.3 Remover tipo `allowedRoles` de `RequireUserOptions`
- [ ] 4.4 Remover checagem de `hasRequiredRole` em `requireUser()`
- [ ] 4.5 Atualizar callers de `requireUser({ allowedRoles: [...] })` para usar permissões

## 5. Limpeza de backend/auth/middleware.ts

- [ ] 5.1 Remover import de `LegacyUserRole`
- [ ] 5.2 Remover lógica de mapeamento "professor"/"empresa" → "usuario" em `mapSupabaseUserToAuthUser()`
- [ ] 5.3 Simplificar tipagem de `metadataRole`

## 6. Limpeza de app/api/user/profile/route.ts

- [ ] 6.1 Remover lógica de mapeamento legado
- [ ] 6.2 Remover derivação de `isEmpresaAdmin` da resposta

## 7. Componente de Matriz de Permissões

- [ ] 7.1 Criar `components/admin/permissions-matrix.tsx`
- [ ] 7.2 Implementar grid visual com recursos x ações
- [ ] 7.3 Implementar lógica de dependência (view required for create/edit/delete)
- [ ] 7.4 Implementar modo somente leitura
- [ ] 7.5 Adicionar labels traduzidos para recursos e ações

## 8. Formulário de Papel

- [ ] 8.1 Criar `components/admin/papel-form.tsx`
- [ ] 8.2 Implementar campos: nome, tipo, descrição
- [ ] 8.3 Integrar componente de matriz de permissões
- [ ] 8.4 Implementar validação de formulário
- [ ] 8.5 Implementar preview de permissões antes de salvar

## 9. Páginas de Gerenciamento de Papéis

- [ ] 9.1 Criar `app/(dashboard)/admin/empresa/papeis/page.tsx` - listagem
- [ ] 9.2 Implementar tabela de papéis com badges (sistema/customizado)
- [ ] 9.3 Criar `app/(dashboard)/admin/empresa/papeis/novo/page.tsx` - criar
- [ ] 9.4 Criar `app/(dashboard)/admin/empresa/papeis/[papelId]/page.tsx` - editar
- [ ] 9.5 Implementar dialog de confirmação para exclusão
- [ ] 9.6 Adicionar link no menu lateral de admin

## 10. Validação e Testes

- [ ] 10.1 Verificar que build compila sem erros de tipo
- [ ] 10.2 Testar login com usuários de diferentes papéis
- [ ] 10.3 Testar criação de papel customizado via UI
- [ ] 10.4 Testar edição de papel customizado via UI
- [ ] 10.5 Testar que papéis do sistema não podem ser editados/excluídos
- [ ] 10.6 Testar atribuição de papel customizado a usuário
