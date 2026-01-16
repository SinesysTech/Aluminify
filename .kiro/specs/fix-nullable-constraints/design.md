# Fix Nullable Constraints - Design

## 1. Overview

This design addresses the database schema issue where mandatory fields are incorrectly marked as nullable, causing TypeScript type errors and requiring workarounds in the codebase.

## 2. Solution Approach

### 2.1 Database Migration Strategy

**Migration File**: `supabase/migrations/20250116_fix_nullable_constraints.sql`

The migration follows a safe 3-step process:

1. **Data Cleanup**: Update existing NULL values with appropriate defaults
2. **Orphan Removal**: Delete records without required foreign keys
3. **Constraint Addition**: Add NOT NULL constraints to enforce data integrity

### 2.2 Affected Tables and Fields

#### Table: `atividades`
- `modulo_id` → NOT NULL (activities must belong to a module)
- `obrigatorio` → NOT NULL (boolean should never be null, default: TRUE)
- `ordem_exibicao` → NOT NULL (needed for ordering, default: 0)
- `created_at` → NOT NULL (audit field)
- `updated_at` → NOT NULL (audit field)

#### Table: `flashcards`
- `modulo_id` → NOT NULL (flashcards must belong to a module)
- `created_at` → NOT NULL (audit field)

#### Table: `cronogramas`
- `nome` → NOT NULL (every schedule needs a name, default: "Meu Cronograma")

#### Table: `professores`
- `empresa_id` → REMAINS NULLABLE (valid business rule: superadmin professors have no company)

### 2.3 Code Changes

#### TypeScript Interface Updates
- Remove `| null` from field types in interfaces
- Update `FlashcardAdmin.created_at`: `string | null` → `string`
- Update `CronogramaExport.nome`: `string | null` → `string`
- Update `CachedActivity` fields to non-nullable

#### Workaround Removal
- Remove null coalescing operators (`??`) added in previous workaround
- Remove unnecessary type guards
- Add type assertions (`as string`) where database types haven't been regenerated yet

## 3. Migration Safety

### 3.1 Data Preservation
- Existing NULL values are updated with sensible defaults
- No data loss for valid records
- Orphaned records (without required foreign keys) are deleted with logging

### 3.2 Verification
- Migration includes assertion checks to verify constraints
- Logs orphaned record counts before deletion
- Comments added to document field requirements

### 3.3 Rollback Strategy
If migration fails:
1. Restore from backup
2. Investigate data issues
3. Fix data manually
4. Re-run migration

## 4. Testing Strategy

### 4.1 Pre-Migration Tests
- Count records with NULL values in affected fields
- Identify orphaned records
- Backup database

### 4.2 Post-Migration Tests
- Verify TypeScript compilation passes
- Test application functionality:
  - Create new activities/flashcards
  - Update existing records
  - Export cronogramas
- Verify database constraints prevent NULL insertions

## 5. Deployment Plan

### 5.1 Development Environment
1. Run migration on dev database
2. Regenerate TypeScript types (if using generated types)
3. Run `npm run typecheck`
4. Test application manually

### 5.2 Production Environment
1. Create database backup
2. Run migration during low-traffic period
3. Monitor for errors
4. Verify application functionality
5. Keep backup for 7 days

## 6. Correctness Properties

### Property 6.1: Non-Null Enforcement
**Specification**: After migration, database must reject INSERT/UPDATE operations that attempt to set mandatory fields to NULL.

**Test Strategy**: Attempt to insert records with NULL values in constrained fields and verify they are rejected.

### Property 6.2: Data Integrity
**Specification**: All existing records must have non-NULL values in constrained fields after migration.

**Test Strategy**: Query database for NULL values in constrained fields and verify count is zero.

### Property 6.3: Type Safety
**Specification**: TypeScript code must compile without type errors related to nullable fields.

**Test Strategy**: Run `npm run typecheck` and verify exit code is 0.

### Property 6.4: Functional Correctness
**Specification**: Application functionality must work correctly with non-nullable constraints.

**Test Strategy**: 
- Create new activities, flashcards, and cronogramas
- Update existing records
- Export cronogramas in all formats (ICS, PDF, XLSX)
- Verify no runtime errors

## 7. Implementation Notes

### 7.1 Type Assertions
Temporary type assertions (`as string`) are used in the code because:
- Database schema has been updated
- TypeScript types haven't been regenerated yet
- Assertions are safe because migration guarantees non-null values

### 7.2 Future Improvements
- Regenerate TypeScript types from updated schema
- Remove type assertions once types are updated
- Consider adding database-level defaults for better DX

## 8. Dependencies

- Supabase CLI (for running migrations)
- PostgreSQL 12+ (for NOT NULL constraints)
- TypeScript 4.5+ (for type checking)

## 9. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Orphaned records exist | Data loss | Log counts before deletion, review logs |
| Migration fails mid-way | Inconsistent state | Use transactions, test on dev first |
| Application breaks | Downtime | Thorough testing, backup, rollback plan |
| Type generation issues | Build failures | Manual type updates, type assertions |

## 10. Success Criteria

- ✅ Migration runs successfully without errors
- ✅ TypeScript compilation passes (0 errors)
- ✅ All application features work correctly
- ✅ Database enforces NOT NULL constraints
- ✅ No runtime errors in production
