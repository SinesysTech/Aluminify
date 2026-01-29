"use client";

import { useEffect, useMemo, useRef } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useStudentOrganizations } from "@/components/providers/student-organizations-provider";

/**
 * Keeps the UI scoped to the currently selected organization (empresa) for multi-org students.
 *
 * Behavior:
 * - If the student is multi-org and no org is selected yet, auto-select the org matching the current tenant slug.
 * - When the selected org changes, navigate to the same path under the selected org's tenant slug.
 *
 * This ensures:
 * - The user sees the correct tenant branding/modules/content.
 * - Cross-tenant navigation is explicit and predictable.
 */
export function StudentTenantCoordinator() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ tenant?: string | string[] }>();

  const tenantSlug = useMemo(() => {
    const raw = params?.tenant;
    const value = Array.isArray(raw) ? raw[0] : raw;
    return (value ?? "").toString();
  }, [params]);

  const {
    organizations,
    activeOrganization,
    setActiveOrganization,
    isMultiOrg,
    loading,
  } = useStudentOrganizations();

  const lastNavigatedToSlug = useRef<string | null>(null);

  useEffect(() => {
    if (!isMultiOrg || loading) return;

    // Auto-select: default to current tenant organization if nothing chosen yet.
    if (!activeOrganization && tenantSlug) {
      const match = organizations.find((o) => o.slug === tenantSlug);
      if (match) {
        setActiveOrganization(match);
      }
      return;
    }

    if (!activeOrganization?.slug || !tenantSlug) return;
    if (activeOrganization.slug === tenantSlug) return;

    // Avoid loops if router hasn't updated params yet.
    if (lastNavigatedToSlug.current === activeOrganization.slug) return;
    lastNavigatedToSlug.current = activeOrganization.slug;

    // Replace the current tenant segment with the selected org slug.
    const currentPrefix = `/${tenantSlug}`;
    const nextPrefix = `/${activeOrganization.slug}`;

    const nextPath =
      pathname && pathname.startsWith(currentPrefix)
        ? `${nextPrefix}${pathname.slice(currentPrefix.length)}`
        : `${nextPrefix}/dashboard`;

    router.push(nextPath);
    router.refresh();
  }, [
    activeOrganization,
    organizations,
    isMultiOrg,
    loading,
    pathname,
    router,
    setActiveOrganization,
    tenantSlug,
  ]);

  return null;
}

