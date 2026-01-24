
# Tasks

- [ ] Create directory structure 'app/[tenant]/(dashboard)/aluno/{components,hooks,lib,services,types}'
- [ ] Move 'components/aluno/*' to 'app/[tenant]/(dashboard)/aluno/components/'
- [ ] Move 'components/dashboard/*' (Student specific) to 'app/[tenant]/(dashboard)/aluno/components/dashboard/'
- [ ] Move 'types/dashboard.ts' to 'app/[tenant]/(dashboard)/aluno/types/dashboard.ts'
- [ ] Move 'lib/services/dashboardService.ts' to 'app/[tenant]/(dashboard)/aluno/services/dashboard.service.ts'
- [ ] Move 'app/(dashboard)/aluno/*' content to 'app/[tenant]/(dashboard)/aluno/'
- [ ] Update imports in new 'aluno' module to point to local components/services
- [ ] Create 'app/[tenant]/(dashboard)/aluno/layout.tsx' (adapt from legacy or create new)
- [ ] Delete legacy 'app/(dashboard)/aluno' directory
- [ ] Delete legacy 'components/aluno' directory
- [ ] Delete legacy 'components/dashboard' files (that were moved)
- [ ] Verify build and lint

