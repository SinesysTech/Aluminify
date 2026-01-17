import { SupabaseClient } from '@supabase/supabase-js';
import { getDatabaseClient } from '@/backend/clients/database';
import { CourseRepositoryImpl } from './course.repository';
import { CourseService } from './course.service';

/**
 * Factory function para criar CourseService com cliente Supabase específico.
 * Use esta função quando precisar que as RLS policies sejam aplicadas.
 *
 * @param client - Cliente Supabase com contexto do usuário autenticado
 * @returns Instância de CourseService que respeita RLS
 */
export function createCourseService(client: SupabaseClient): CourseService {
  const repository = new CourseRepositoryImpl(client);
  return new CourseService(repository);
}

// === ADMIN SERVICE (bypassa RLS - usar apenas em contextos seguros) ===

let _adminCourseService: CourseService | null = null;

/**
 * @deprecated Use createCourseService(client) com cliente do usuário para respeitar RLS.
 * Este service usa admin client e BYPASSA todas as RLS policies.
 */
function getAdminCourseService(): CourseService {
  if (!_adminCourseService) {
    const databaseClient = getDatabaseClient();
    const repository = new CourseRepositoryImpl(databaseClient);
    _adminCourseService = new CourseService(repository);
  }
  return _adminCourseService;
}

/**
 * @deprecated Use createCourseService(client) com cliente do usuário para respeitar RLS.
 * Este proxy usa admin client e BYPASSA todas as RLS policies.
 */
export const courseService = new Proxy({} as CourseService, {
  get(_target, prop) {
    return getAdminCourseService()[prop as keyof CourseService];
  },
});

export * from './course.types';
export * from './course.service';
export * from './course.repository';
export * from './errors';

