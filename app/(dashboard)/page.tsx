import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { requireUser } from '@/lib/auth'
import { getDefaultRouteForRole } from '@/lib/roles'

export const metadata: Metadata = {
  title: 'Dashboard'
}

export default async function DashboardLanding() {
  const user = await requireUser()
  redirect(getDefaultRouteForRole(user.role))
}