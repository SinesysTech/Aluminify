import { redirect } from 'next/navigation'
import { createClient } from '@/app/shared/core/server'
import { CronogramaDetailView } from '../components/cronograma-detail-view'

export default async function CronogramaDetailPage({
  params,
}: {
  params: Promise<{ tenant: string; id: string }>
}) {
  const { tenant, id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/${tenant}/auth/login`)

  // Validate the cronograma exists and belongs to this user
  const { data: cronograma } = await supabase
    .from('cronogramas')
    .select('id')
    .eq('id', id)
    .eq('usuario_id', user.id)
    .maybeSingle()

  if (!cronograma) {
    redirect(`/${tenant}/cronograma`)
  }

  return <CronogramaDetailView cronogramaId={cronograma.id} />
}
