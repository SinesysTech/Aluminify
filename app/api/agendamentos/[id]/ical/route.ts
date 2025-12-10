import { createClient } from "@/lib/server"
import { NextRequest, NextResponse } from "next/server"
import ical, { ICalCalendarMethod } from "ical-generator"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  // Fetch agendamento with user validation
  const { data: agendamento, error } = await supabase
    .from("agendamentos")
    .select(`
      *,
      professor:professores!agendamentos_professor_id_fkey(id, nome, email),
      aluno:alunos!agendamentos_aluno_id_fkey(id, nome, email)
    `)
    .eq("id", id)
    .single()

  if (error || !agendamento) {
    return NextResponse.json(
      { error: "Agendamento nao encontrado" },
      { status: 404 }
    )
  }

  // Verify user is participant
  if (agendamento.professor_id !== user.id && agendamento.aluno_id !== user.id) {
    return NextResponse.json(
      { error: "Nao autorizado" },
      { status: 403 }
    )
  }

  const isProfessor = agendamento.professor_id === user.id
  const outraParte = isProfessor ? agendamento.aluno : agendamento.professor
  const outraParteNome = outraParte?.nome || "Participante"

  // Create calendar
  const calendar = ical({
    name: "Agendamento de Mentoria",
    method: ICalCalendarMethod.PUBLISH,
    prodId: {
      company: "Area do Aluno",
      product: "Agendamentos",
      language: "PT-BR"
    }
  })

  const dataInicio = new Date(agendamento.data_inicio)
  const dataFim = new Date(agendamento.data_fim)

  const eventTitle = isProfessor
    ? `Mentoria com ${outraParteNome}`
    : `Mentoria com Prof. ${outraParteNome}`

  let description = `Sessao de mentoria agendada.`
  if (agendamento.observacoes) {
    description += `\n\nObservacoes: ${agendamento.observacoes}`
  }
  if (agendamento.link_reuniao) {
    description += `\n\nLink da reuniao: ${agendamento.link_reuniao}`
  }

  // Create event
  calendar.createEvent({
    id: agendamento.id,
    start: dataInicio,
    end: dataFim,
    summary: eventTitle,
    description: description,
    location: agendamento.link_reuniao || undefined,
    url: agendamento.link_reuniao || undefined,
    organizer: {
      name: agendamento.professor?.nome || "Professor",
      email: agendamento.professor?.email || "professor@areadoaluno.com"
    },
    attendees: [
      {
        name: agendamento.aluno?.nome || "Aluno",
        email: agendamento.aluno?.email || "aluno@areadoaluno.com",
        rsvp: true
      }
    ],
    status: agendamento.status === "cancelado" ? "CANCELLED" : "CONFIRMED",
    alarms: [
      {
        type: "display",
        trigger: 15 * 60, // 15 minutes before
        description: "Lembrete: Mentoria em 15 minutos"
      },
      {
        type: "display",
        trigger: 60 * 60, // 1 hour before
        description: "Lembrete: Mentoria em 1 hora"
      },
      {
        type: "display",
        trigger: 24 * 60 * 60, // 1 day before
        description: "Lembrete: Mentoria amanha"
      }
    ]
  })

  // Generate iCal string
  const icalString = calendar.toString()

  // Create filename
  const dateStr = dataInicio.toISOString().split("T")[0]
  const filename = `mentoria-${dateStr}.ics`

  // Return as downloadable file
  return new NextResponse(icalString, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-cache"
    }
  })
}
