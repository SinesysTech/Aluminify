import type { Metadata } from 'next'
import StudentDashboardClientPage from './client'

export const metadata: Metadata = {
  title: 'Dashboard'
}

export default function StudentDashboardPage() {
  return <StudentDashboardClientPage />
}

