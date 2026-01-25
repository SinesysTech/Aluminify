/**
 * Consolidated types for Pessoas (People) module.
 * Re-exports from shared types ensuring single source of truth.
 */

// Re-export common user types
export * from "@/app/shared/types/entities/user";

// Specific role types if needed (that aren't in shared yet)
// Currently, shared/types/entities/user.ts seems to have Student/Teacher.
// We will verify if we need to move anything else here.
