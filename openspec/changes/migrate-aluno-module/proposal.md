
# Migrate Aluno Module

## Status
Proposed

## Goal
Migrate the 'aluno' module specific code to a self-contained structure within 'app/[tenant]/(dashboard)/aluno'.

## Scope
- Move 'app/(dashboard)/aluno' contents (dashboard, cronograma, etc.) to 'app/[tenant]/(dashboard)/aluno'.
- Move 'components/aluno/*' to 'app/[tenant]/(dashboard)/aluno/components/'.
- Move 'components/dashboard/*' (student specific) to 'app/[tenant]/(dashboard)/aluno/components/dashboard/'.
- Move 'lib/services/dashboardService.ts' to 'app/[tenant]/(dashboard)/aluno/services/dashboard.service.ts'.
- Move 'types/dashboard.ts' to 'app/[tenant]/(dashboard)/aluno/types/dashboard.ts'.
- Update all imports to use relative paths where possible or specific absolute paths.
- Remove legacy directories.

## Design
- strict encapsulation: 'aluno' features should not rely on 'admin' components unless they are in 'components/ui' or 'components/shared'.
- no legacy support: straight move and refactor.

