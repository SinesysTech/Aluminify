'use server'

import { createClient } from '@/lib/server'
import { revalidatePath } from 'next/cache'

export type Disponibilidade = {
  id?: string
  professor_id?: string
  dia_semana: number // 0-6
  hora_inicio: string // HH:MM
  hora_fim: string // HH:MM
  ativo: boolean
}

export type Agendamento = {
  id?: string
  professor_id: string
  aluno_id: string
  data_inicio: string | Date
  data_fim: string | Date
  status: 'pendente' | 'confirmado' | 'cancelado' | 'concluido'
  link_reuniao?: string | null
  observacoes?: string | null
  motivo_cancelamento?: string | null
  cancelado_por?: string | null
  confirmado_em?: string | null
  lembrete_enviado?: boolean
  lembrete_enviado_em?: string | null
  created_at?: string
  updated_at?: string
}

export type AgendamentoComDetalhes = Agendamento & {
  aluno?: {
    id: string
    nome: string
    email: string
    avatar_url?: string | null
  }
  professor?: {
    id: string
    nome: string
    email: string
    avatar_url?: string | null
  }
}

export type ConfiguracoesProfessor = {
  id?: string
  professor_id?: string
  auto_confirmar: boolean
  tempo_antecedencia_minimo: number // minutes
  tempo_lembrete_minutos: number // minutes
  link_reuniao_padrao?: string | null
  mensagem_confirmacao?: string | null
  created_at?: string
  updated_at?: string
}

export type AgendamentoFilters = {
  status?: string | string[]
  dateStart?: Date
  dateEnd?: Date
}

export type AgendamentoNotificacao = {
  id?: string
  agendamento_id: string
  tipo: 'criacao' | 'confirmacao' | 'cancelamento' | 'lembrete' | 'alteracao' | 'rejeicao'
  destinatario_id: string
  enviado: boolean
  enviado_em?: string | null
  erro?: string | null
  created_at?: string
}

export async function getDisponibilidade(professorId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('agendamento_disponibilidade')
    .select('*')
    .eq('professor_id', professorId)
    .eq('ativo', true)
    
  if (error) {
    console.error('Error fetching availability:', error)
    return []
  }
  
  return data
}

export async function upsertDisponibilidade(data: Disponibilidade) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const payload = {
    ...data,
    professor_id: user.id
  }

  const { error } = await supabase
    .from('agendamento_disponibilidade')
    .upsert(payload)
    .select()

  if (error) {
    console.error('Error upserting availability:', error)
    throw new Error('Failed to update availability')
  }

  revalidatePath('/agendamentos')
  return { success: true }
}

export async function getAgendamentos(professorId: string, start: Date, end: Date) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('agendamentos')
    .select('*')
    .eq('professor_id', professorId)
    .gte('data_inicio', start.toISOString())
    .lte('data_fim', end.toISOString())
    .neq('status', 'cancelado') // Usually want to see occupied slots
    
  if (error) {
    console.error('Error fetching appointments:', error)
    return []
  }
  
  return data
}

export async function createAgendamento(data: Omit<Agendamento, 'id' | 'created_at' | 'updated_at' | 'status'>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const payload = {
    ...data,
    aluno_id: user.id,
    status: 'pendente'
  }

  const { data: result, error } = await supabase
    .from('agendamentos')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('Error creating appointment:', error)
    throw new Error('Failed to create appointment')
  }

  revalidatePath('/agendamentos')
  return result
}

export async function cancelAgendamento(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { error } = await supabase
        .from('agendamentos')
        .update({ status: 'cancelado' })
        .eq('id', id)
    
    if (error) {
        console.error('Error cancelling appointment:', error)
        throw new Error('Failed to cancel appointment')
    }

    revalidatePath('/agendamentos')
    return { success: true }
}

export async function getAvailableSlots(professorId: string, dateStr: string) {
  const supabase = await createClient()
  
  const date = new Date(dateStr)
  // Ensure we are working with the date part only for dayOfWeek check if possible, but JS Date uses local or UTC. 
  // Let's rely on the input dateStr being ISO or YYYY-MM-DD.
  // Ideally, use a library like date-fns for timezone handling, but native is fine if careful.
  const dayOfWeek = date.getUTCDay() // 0-6
  
  // 1. Get availability rules
  const { data: rules } = await supabase
    .from('agendamento_disponibilidade')
    .select('*')
    .eq('professor_id', professorId)
    .eq('dia_semana', dayOfWeek)
    .eq('ativo', true)
    
  if (!rules || rules.length === 0) {
    return []
  }

  // 2. Get existing bookings
  const startOfDay = new Date(dateStr)
  startOfDay.setUTCHours(0, 0, 0, 0)
  const endOfDay = new Date(dateStr)
  endOfDay.setUTCHours(23, 59, 59, 999)

  const { data: bookings } = await supabase
    .from('agendamentos')
    .select('*')
    .eq('professor_id', professorId)
    .gte('data_inicio', startOfDay.toISOString())
    .lte('data_fim', endOfDay.toISOString())
    .neq('status', 'cancelado')

  // 3. Generate slots
  const slots: string[] = []
  const SLOT_DURATION_MINUTES = 30

  // Helper to parse "HH:MM:SS" or "HH:MM" to minutes from midnight
  const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number)
    return h * 60 + m
  }

  for (const rule of rules) {
    const startMins = timeToMinutes(rule.hora_inicio)
    const endMins = timeToMinutes(rule.hora_fim)
    
    for (let time = startMins; time + SLOT_DURATION_MINUTES <= endMins; time += SLOT_DURATION_MINUTES) {
      // Create slot date in UTC
      const slotStart = new Date(dateStr)
      slotStart.setUTCHours(Math.floor(time / 60), time % 60, 0, 0)
      
      const slotEnd = new Date(slotStart)
      slotEnd.setUTCMinutes(slotEnd.getUTCMinutes() + SLOT_DURATION_MINUTES)

      // Check collision
      const isOccupied = bookings?.some(booking => {
        const bookingStart = new Date(booking.data_inicio)
        const bookingEnd = new Date(booking.data_fim)
        // Overlap check
        return (slotStart < bookingEnd && slotEnd > bookingStart)
      })

      if (!isOccupied) {
        slots.push(slotStart.toISOString())
      }
    }
  }

  return slots.sort()
}

// =============================================
// Professor Dashboard Functions
// =============================================

export async function getAgendamentosProfessor(
  professorId: string,
  filters?: AgendamentoFilters
): Promise<AgendamentoComDetalhes[]> {
  const supabase = await createClient()

  let query = supabase
    .from('agendamentos')
    .select(`
      *,
      aluno:alunos!agendamentos_aluno_id_fkey(id, nome, email, avatar_url)
    `)
    .eq('professor_id', professorId)
    .order('data_inicio', { ascending: true })

  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      query = query.in('status', filters.status)
    } else {
      query = query.eq('status', filters.status)
    }
  }

  if (filters?.dateStart) {
    query = query.gte('data_inicio', filters.dateStart.toISOString())
  }

  if (filters?.dateEnd) {
    query = query.lte('data_inicio', filters.dateEnd.toISOString())
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching professor appointments:', error)
    return []
  }

  return data || []
}

export async function getAgendamentosAluno(alunoId: string): Promise<AgendamentoComDetalhes[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('agendamentos')
    .select(`
      *,
      professor:professores!agendamentos_professor_id_fkey(id, nome, email, avatar_url)
    `)
    .eq('aluno_id', alunoId)
    .order('data_inicio', { ascending: false })

  if (error) {
    console.error('Error fetching student appointments:', error)
    return []
  }

  return data || []
}

export async function getAgendamentoById(id: string): Promise<AgendamentoComDetalhes | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('agendamentos')
    .select(`
      *,
      aluno:alunos!agendamentos_aluno_id_fkey(id, nome, email, avatar_url),
      professor:professores!agendamentos_professor_id_fkey(id, nome, email, avatar_url)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching appointment:', error)
    return null
  }

  return data
}

// =============================================
// Appointment Status Management
// =============================================

export async function confirmarAgendamento(id: string, linkReuniao?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const updateData: Record<string, unknown> = {
    status: 'confirmado',
    confirmado_em: new Date().toISOString()
  }

  if (linkReuniao) {
    updateData.link_reuniao = linkReuniao
  }

  const { data, error } = await supabase
    .from('agendamentos')
    .update(updateData)
    .eq('id', id)
    .eq('professor_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error confirming appointment:', error)
    throw new Error('Failed to confirm appointment')
  }

  // Create notification for student
  await createNotificacao(id, 'confirmacao', data.aluno_id)

  revalidatePath('/professor/agendamentos')
  revalidatePath('/meus-agendamentos')
  return data
}

export async function rejeitarAgendamento(id: string, motivo: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('agendamentos')
    .update({
      status: 'cancelado',
      motivo_cancelamento: motivo,
      cancelado_por: user.id
    })
    .eq('id', id)
    .eq('professor_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error rejecting appointment:', error)
    throw new Error('Failed to reject appointment')
  }

  // Create notification for student
  await createNotificacao(id, 'rejeicao', data.aluno_id)

  revalidatePath('/professor/agendamentos')
  revalidatePath('/meus-agendamentos')
  return data
}

export async function cancelAgendamentoWithReason(id: string, motivo?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // First get the agendamento to know who to notify
  const { data: agendamento } = await supabase
    .from('agendamentos')
    .select('professor_id, aluno_id')
    .eq('id', id)
    .single()

  if (!agendamento) {
    throw new Error('Appointment not found')
  }

  const { error } = await supabase
    .from('agendamentos')
    .update({
      status: 'cancelado',
      motivo_cancelamento: motivo || null,
      cancelado_por: user.id
    })
    .eq('id', id)

  if (error) {
    console.error('Error cancelling appointment:', error)
    throw new Error('Failed to cancel appointment')
  }

  // Notify the other party
  const destinatarioId = user.id === agendamento.professor_id
    ? agendamento.aluno_id
    : agendamento.professor_id

  await createNotificacao(id, 'cancelamento', destinatarioId)

  revalidatePath('/professor/agendamentos')
  revalidatePath('/meus-agendamentos')
  revalidatePath('/agendamentos')
  return { success: true }
}

export async function updateAgendamento(id: string, data: Partial<Agendamento>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Remove fields that shouldn't be updated directly
  const { id: _id, created_at, updated_at, ...updateData } = data

  const { data: result, error } = await supabase
    .from('agendamentos')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating appointment:', error)
    throw new Error('Failed to update appointment')
  }

  revalidatePath('/professor/agendamentos')
  revalidatePath('/meus-agendamentos')
  return result
}

// =============================================
// Professor Configuration Functions
// =============================================

export async function getConfiguracoesProfessor(professorId: string): Promise<ConfiguracoesProfessor | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('agendamento_configuracoes')
    .select('*')
    .eq('professor_id', professorId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching professor config:', error)
    return null
  }

  // Return defaults if no config exists
  if (!data) {
    return {
      professor_id: professorId,
      auto_confirmar: false,
      tempo_antecedencia_minimo: 60,
      tempo_lembrete_minutos: 1440,
      link_reuniao_padrao: null,
      mensagem_confirmacao: null
    }
  }

  return data
}

export async function updateConfiguracoesProfessor(
  professorId: string,
  config: Partial<ConfiguracoesProfessor>
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.id !== professorId) {
    throw new Error('Unauthorized')
  }

  const { id, created_at, updated_at, ...configData } = config

  const { data, error } = await supabase
    .from('agendamento_configuracoes')
    .upsert({
      ...configData,
      professor_id: professorId
    })
    .select()
    .single()

  if (error) {
    console.error('Error updating professor config:', error)
    throw new Error('Failed to update configuration')
  }

  revalidatePath('/professor/configuracoes')
  return data
}

// =============================================
// Availability Management
// =============================================

export async function deleteDisponibilidade(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('agendamento_disponibilidade')
    .delete()
    .eq('id', id)
    .eq('professor_id', user.id)

  if (error) {
    console.error('Error deleting availability:', error)
    throw new Error('Failed to delete availability')
  }

  revalidatePath('/professor/disponibilidade')
  revalidatePath('/agendamentos')
  return { success: true }
}

export async function bulkUpsertDisponibilidade(items: Disponibilidade[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const payload = items.map(item => ({
    ...item,
    professor_id: user.id
  }))

  const { error } = await supabase
    .from('agendamento_disponibilidade')
    .upsert(payload)

  if (error) {
    console.error('Error bulk upserting availability:', error)
    throw new Error('Failed to update availability')
  }

  revalidatePath('/professor/disponibilidade')
  revalidatePath('/agendamentos')
  return { success: true }
}

// =============================================
// Conflict Detection & Validation
// =============================================

export async function checkConflitos(
  professorId: string,
  dataInicio: Date,
  dataFim: Date
): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('agendamentos')
    .select('id')
    .eq('professor_id', professorId)
    .neq('status', 'cancelado')
    .or(`and(data_inicio.lt.${dataFim.toISOString()},data_fim.gt.${dataInicio.toISOString()})`)
    .limit(1)

  if (error) {
    console.error('Error checking conflicts:', error)
    return false
  }

  return (data?.length || 0) > 0
}

export async function validateAgendamento(
  professorId: string,
  dataInicio: Date,
  dataFim: Date
): Promise<{ valid: boolean; error?: string }> {
  const supabase = await createClient()

  // Check minimum advance time
  const config = await getConfiguracoesProfessor(professorId)
  const minAdvanceMinutes = config?.tempo_antecedencia_minimo || 60
  const now = new Date()
  const minAllowedTime = new Date(now.getTime() + minAdvanceMinutes * 60 * 1000)

  if (dataInicio < minAllowedTime) {
    return {
      valid: false,
      error: `O agendamento deve ser feito com pelo menos ${minAdvanceMinutes} minutos de antecedência.`
    }
  }

  // Check for conflicts
  const hasConflict = await checkConflitos(professorId, dataInicio, dataFim)
  if (hasConflict) {
    return {
      valid: false,
      error: 'Já existe um agendamento neste horário.'
    }
  }

  // Check if within availability
  const dayOfWeek = dataInicio.getUTCDay()
  const { data: rules } = await supabase
    .from('agendamento_disponibilidade')
    .select('*')
    .eq('professor_id', professorId)
    .eq('dia_semana', dayOfWeek)
    .eq('ativo', true)

  if (!rules || rules.length === 0) {
    return {
      valid: false,
      error: 'O professor não tem disponibilidade neste dia.'
    }
  }

  const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number)
    return h * 60 + m
  }

  const startMinutes = dataInicio.getUTCHours() * 60 + dataInicio.getUTCMinutes()
  const endMinutes = dataFim.getUTCHours() * 60 + dataFim.getUTCMinutes()

  const isWithinAvailability = rules.some(rule => {
    const ruleStart = timeToMinutes(rule.hora_inicio)
    const ruleEnd = timeToMinutes(rule.hora_fim)
    return startMinutes >= ruleStart && endMinutes <= ruleEnd
  })

  if (!isWithinAvailability) {
    return {
      valid: false,
      error: 'O horário selecionado está fora da disponibilidade do professor.'
    }
  }

  return { valid: true }
}

// =============================================
// Notification Helper
// =============================================

async function createNotificacao(
  agendamentoId: string,
  tipo: AgendamentoNotificacao['tipo'],
  destinatarioId: string
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('agendamento_notificacoes')
    .insert({
      agendamento_id: agendamentoId,
      tipo,
      destinatario_id: destinatarioId
    })

  if (error) {
    console.error('Error creating notification:', error)
  }
}

// =============================================
// Statistics
// =============================================

export async function getAgendamentoStats(professorId: string) {
  const supabase = await createClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const { data, error } = await supabase
    .from('agendamentos')
    .select('status, data_inicio')
    .eq('professor_id', professorId)
    .gte('data_inicio', startOfMonth.toISOString())
    .lte('data_inicio', endOfMonth.toISOString())

  if (error) {
    console.error('Error fetching stats:', error)
    return {
      total: 0,
      pendentes: 0,
      confirmados: 0,
      cancelados: 0,
      concluidos: 0
    }
  }

  const stats = {
    total: data?.length || 0,
    pendentes: data?.filter(a => a.status === 'pendente').length || 0,
    confirmados: data?.filter(a => a.status === 'confirmado').length || 0,
    cancelados: data?.filter(a => a.status === 'cancelado').length || 0,
    concluidos: data?.filter(a => a.status === 'concluido').length || 0
  }

  return stats
}
