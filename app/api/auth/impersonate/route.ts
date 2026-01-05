import { NextResponse } from 'next/server'
import { requireUserAuth, type AuthenticatedRequest } from '@/backend/auth/middleware'
import { getDatabaseClient } from '@/backend/clients/database'
import { setImpersonationContext, canImpersonateUser } from '@/lib/auth-impersonate'
import type { AppUserRole } from '@/types/user'

async function postHandler(request: AuthenticatedRequest) {
  try {
    if (!request.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { studentId } = body

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar dados do aluno a ser impersonado
    const client = getDatabaseClient()
    const { data: aluno, error: alunoError } = await client
      .from('alunos')
      .select('id, email')
      .eq('id', studentId)
      .maybeSingle()

    if (alunoError || !aluno) {
      return NextResponse.json(
        { error: 'Aluno não encontrado' },
        { status: 404 }
      )
    }

    // Buscar empresa_id do aluno (se houver matrícula em alunos_cursos)
    const { data: alunoCurso } = await client
      .from('alunos_cursos')
      .select('curso_id, cursos(empresa_id)')
      .eq('aluno_id', studentId)
      .limit(1)
      .maybeSingle()

    const alunoEmpresaId = (alunoCurso as { cursos?: { empresa_id?: string } } | null)?.cursos?.empresa_id

    // Buscar empresa_id do usuário real (se for professor)
    let realUserEmpresaId: string | undefined
    if (request.user.role === 'professor' || request.user.role === 'empresa') {
      const { data: professor } = await client
        .from('professores')
        .select('empresa_id')
        .eq('id', request.user.id)
        .maybeSingle()
      
      realUserEmpresaId = professor?.empresa_id
    }

    // Validar se pode impersonar
    const validation = canImpersonateUser(
      request.user.role as AppUserRole,
      realUserEmpresaId,
      studentId,
      'aluno',
      alunoEmpresaId
    )

    if (!validation.allowed) {
      return NextResponse.json(
        { error: validation.reason || 'Não autorizado' },
        { status: 403 }
      )
    }

    // Criar contexto de impersonação
    const context = {
      realUserId: request.user.id,
      realUserRole: request.user.role as AppUserRole,
      impersonatedUserId: studentId,
      impersonatedUserRole: 'aluno' as AppUserRole,
      startedAt: new Date().toISOString(),
    }

    await setImpersonationContext(context)

    return NextResponse.json({
      success: true,
      context: {
        ...context,
        impersonatedUser: {
          id: aluno.id,
          email: aluno.email,
        },
      },
    })
  } catch (error) {
    console.error('Erro ao iniciar impersonação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export const POST = requireUserAuth(postHandler)



