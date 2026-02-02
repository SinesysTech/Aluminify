## 1. Card Height & Layout Consistency

- [ ] 1.1 Add `h-full flex flex-col` to `StudentSuccessCard` root Card and distribute content with `flex-1` on CardContent
- [ ] 1.2 Add `h-full flex flex-col` to `ProgressStatisticsCard` root Card and distribute content with `flex-1` on CardContent
- [ ] 1.3 Verify all three stats row cards render at equal height at xl breakpoint

## 2. Metric Label Truncation Fix

- [ ] 2.1 Change `InstitutionMetrics` grid from `lg:grid-cols-4` to `xl:grid-cols-4` so 4-column layout only activates at 1280px+
- [ ] 2.2 Add `title` attribute to the label `span` in `MetricCard` for hover fallback
- [ ] 2.3 Verify all four institution metric labels are fully visible without truncation at xl and md breakpoints

## 3. Empty State Improvements

- [ ] 3.1 Update `ChartMostActivity` empty state: add centered Lucide icon (`BarChart3`), descriptive message, and optional CTA
- [ ] 3.2 Update `DisciplinaPerformanceList` empty state: add centered Lucide icon (`GraduationCap`), descriptive message
- [ ] 3.3 Update `LeaderboardCard` empty state: add centered Lucide icon (`Users`), improved message
- [ ] 3.4 Verify all empty states display icon + message + optional action consistently

## 4. Consolidate Duplicate Top Alunos

- [ ] 4.1 Remove `StudentRankingList` import and usage from `InstitutionDashboardClient`
- [ ] 4.2 Update leaderboard data slice from `.slice(0, 4)` to `.slice(0, 5)` in `InstitutionDashboardClient`
- [ ] 4.3 Add `onViewAll` prop to the `LeaderboardCard` instance that navigates to the student list
- [ ] 4.4 Restructure the rankings row: render only `ProfessorRankingList` in a full-width card below the heatmap

## 5. Progress Bar Labels & Badge Colors

- [ ] 5.1 Add `text-xs text-muted-foreground` labels above each progress bar in `ProgressStatisticsCard`
- [ ] 5.2 Change "Cursos Ativos" badge from `bg-orange-500` to `bg-primary` in `ProgressStatisticsCard`
- [ ] 5.3 Fix title accent: change `"Visao Geral"` to `"Visao Geral"` with proper accents in `InstitutionDashboardClient`

## 6. WelcomeCard CTA & Accessibility

- [ ] 6.1 Pass tenant-aware `ctaHref` (e.g., `/${tenant}/alunos`) to `WelcomeCard` in `InstitutionDashboardClient`
- [ ] 6.2 Add `aria-label="Atualizar dados"` to the refresh icon-only Button in `InstitutionDashboardClient`

## 7. Visual Refresh Indicator

- [ ] 7.1 Create `isRefreshing` visual state: add `opacity-50 transition-opacity` to the main content div when refreshing
- [ ] 7.2 Add `animate-spin` class to the `RefreshCw` icon when `isRefreshing` is true
- [ ] 7.3 Verify period change and manual refresh both trigger the visual loading indicator

## 8. Verification

- [ ] 8.1 Run `npm run typecheck` and fix any TypeScript errors
- [ ] 8.2 Run `npm run lint` and fix any linting issues
- [ ] 8.3 Visually verify dashboard at 375px, 768px, 1024px, and 1440px viewports
