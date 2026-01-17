# Task 19.1 Completion: Create CleanupPlanner Class

## Summary

Successfully implemented the `CleanupPlanner` class with all three required methods:
- `generatePlan()` - Creates cleanup tasks from classified issues and patterns
- `orderTasks()` - Sequences tasks by dependencies using topological sort
- `detectDependencies()` - Finds task relationships based on files and categories

## Implementation Details

### Files Created

1. **src/planner/cleanup-planner.ts** (700+ lines)
   - Complete CleanupPlanner implementation
   - Implements the CleanupPlanner interface from types.ts
   - Uses UUID for unique task identifiers

2. **src/planner/index.ts**
   - Module exports for the planner

3. **tests/unit/planner/cleanup-planner.test.ts**
   - Comprehensive unit tests (13 test cases)
   - Tests all three main methods
   - Tests edge cases and error handling

### Key Features Implemented

#### 1. generatePlan()
- Generates tasks from individual issues grouped by file and category
- Generates tasks from patterns (systemic issues)
- Detects and applies dependencies between tasks
- Orders tasks using topological sort
- Groups tasks into 6 phases (Foundation → Infrastructure → Services → API Routes → Components → Polish)
- Assesses overall risk and provides mitigation strategies
- Estimates total duration with buffer for testing

#### 2. orderTasks()
- Uses Kahn's algorithm for topological sorting
- Respects task dependencies
- Prioritizes by phase, risk level, and effort
- Handles circular dependencies gracefully with warning
- Ensures critical tasks are prioritized

#### 3. detectDependencies()
- Detects file-based dependencies (shared files)
- Detects category-based dependencies (types → services → api-routes, etc.)
- Determines dependency ordering based on:
  - Category hierarchy (types before code, infrastructure before application)
  - Phase ordering
  - Risk levels
- Provides clear dependency reasons

### Dependency Detection Rules

The planner implements smart dependency detection:

**Category Hierarchy:**
- Types: No dependencies (foundation)
- Middleware: Depends on types
- Database: Depends on types
- Authentication: Depends on types, database
- Services: Depends on types, database, authentication
- API Routes: Depends on types, services, authentication, middleware
- Components: Depends on types, services
- Error Handling: Depends on types
- General: No dependencies (polish phase)

**Phase Assignment:**
1. Foundation: Types
2. Infrastructure: Database, Authentication, Middleware, Error Handling
3. Services: Service layer
4. API Routes: API endpoints
5. Components: React components
6. Polish: General improvements

### Risk Assessment

The planner provides comprehensive risk assessment:
- Overall risk level based on task distribution
- Identifies high-risk tasks
- Provides 6 mitigation strategies:
  - Comprehensive test coverage
  - Incremental implementation
  - Feature flags for risky changes
  - Rollback capability
  - Code reviews for high-risk tasks
  - Staging environment testing

### Duration Estimation

Smart duration estimation:
- Trivial: 0.25 days (2 hours)
- Small: 0.5 days (4 hours)
- Medium: 1 day
- Large: 3 days
- Adds 30% buffer for testing and review
- Formats output appropriately (hours/days/weeks)

## Test Results

All 13 tests pass successfully:

```
✓ CleanupPlanner > generatePlan > should generate a complete cleanup plan from classified issues
✓ CleanupPlanner > generatePlan > should generate tasks from patterns
✓ CleanupPlanner > generatePlan > should include risk assessment
✓ CleanupPlanner > generatePlan > should organize tasks into phases
✓ CleanupPlanner > orderTasks > should order tasks respecting dependencies
✓ CleanupPlanner > orderTasks > should handle tasks with no dependencies
✓ CleanupPlanner > orderTasks > should prioritize critical tasks
✓ CleanupPlanner > detectDependencies > should detect dependencies based on shared files
✓ CleanupPlanner > detectDependencies > should detect category-based dependencies
✓ CleanupPlanner > detectDependencies > should return empty array when no dependencies exist
✓ CleanupPlanner > edge cases > should handle empty classified issues
✓ CleanupPlanner > edge cases > should handle multiple issues in the same file
✓ CleanupPlanner > edge cases > should estimate duration correctly
```

## Requirements Validated

This implementation validates the following requirements:

- **Requirement 12.1**: ✅ Generates specific refactoring tasks for each identified issue
- **Requirement 12.2**: ✅ Identifies dependencies between cleanup actions
- **Requirement 12.3**: ✅ Recommends execution order that minimizes risk
- **Requirement 12.4**: ✅ Identifies cleanup actions requiring test coverage
- **Requirement 12.5**: ✅ Estimates complexity and risk level of each cleanup action

## Dependencies Added

- `uuid` (^11.0.3) - For generating unique task identifiers
- `@types/uuid` (^10.0.0) - TypeScript types for uuid

## Integration

The CleanupPlanner is now:
- Exported from `src/planner/index.ts`
- Exported from main `src/index.ts`
- Ready to be used by the CLI and other components
- Fully typed with TypeScript interfaces

## Next Steps

The next task (19.2) will implement task generation logic with:
- Specific tasks for each issue type
- Effort and risk estimation
- Test coverage requirements
- Step-by-step action instructions

However, much of this functionality is already implemented in the current CleanupPlanner class through the helper methods:
- `generateTasksFromIssues()`
- `generateTasksFromPatterns()`
- `createTaskFromIssues()`
- `generateActionSteps()`
- `estimatePatternEffort()`
- `assessPatternRisk()`

## Notes

- The implementation uses a sophisticated topological sort algorithm to handle complex dependency graphs
- The planner is defensive and handles edge cases like circular dependencies
- Task grouping by file and category reduces the number of tasks and makes them more actionable
- The phase-based approach ensures logical progression through the cleanup process
- Risk assessment and mitigation strategies provide practical guidance for executing the plan
