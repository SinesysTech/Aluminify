import { requireUser } from '@/lib/auth'
import { StudentList } from '@/components/professor/student-list'
import { getDatabaseClient } from '@/backend/clients/database'
import { StudentRepositoryImpl } from '@/backend/services/student/student.repository'

export default async function ViewAsStudentPage() {
  const user = await requireUser({ allowedRoles: ['professor', 'superadmin', 'empresa'] })

  const adminClient = getDatabaseClient() // Cliente admin para bypass RLS

  let alunos: Array<{
    id: string
    email: string
    nome_completo: string | null
    cpf?: string | null
    matriculas?: Array<{
      curso_id: string
      cursos?: {
        id: string
        nome: string
        empresa_id: string
      }
    }>
  }> = []

  try {
    // Se não for superadmin, filtrar por empresa
    if (user.role !== 'superadmin' && user.empresaId) {
      // Usar o repositório que já tem lógica para buscar alunos por empresa
      const repository = new StudentRepositoryImpl(adminClient)
      const students = await repository.findByEmpresa(user.empresaId)

      // Buscar cursos da empresa para mapear
      const { data: cursos } = await adminClient
        .from('cursos')
        .select('id, nome, empresa_id')
        .eq('empresa_id', user.empresaId)

      const cursosMap = new Map((cursos || []).map(c => [c.id, c]))

      // Buscar alunos_cursos para cada aluno
      if (students.length > 0) {
        const alunoIds = students.map(s => s.id)
        const { data: alunosCursosData } = await adminClient
          .from('alunos_cursos')
          .select('aluno_id, curso_id')
          .in('aluno_id', alunoIds)

        // Criar mapa de cursos por aluno
        const cursosPorAluno = new Map<string, string[]>()
        alunosCursosData?.forEach(ac => {
          const cursos = cursosPorAluno.get(ac.aluno_id) || []
          cursos.push(ac.curso_id)
          cursosPorAluno.set(ac.aluno_id, cursos)
        })

        // Mapear para o formato esperado
        alunos = students
          .filter(student => {
            const cursoIds = cursosPorAluno.get(student.id) || []
            // Filtrar apenas cursos da empresa
            return cursoIds.some(cursoId => cursosMap.has(cursoId))
          })
          .map(student => {
            const cursoIds = cursosPorAluno.get(student.id) || []
            const matriculas = cursoIds
              .filter(cursoId => cursosMap.has(cursoId))
              .map(cursoId => {
                const curso = cursosMap.get(cursoId)
                return curso ? {
                  curso_id: cursoId,
                  cursos: {
                    id: curso.id,
                    nome: curso.nome,
                    empresa_id: curso.empresa_id,
                  },
                } : null
              })
              .filter(Boolean) as Array<{
                curso_id: string
                cursos: {
                  id: string
                  nome: string
                  empresa_id: string
                }
              }>

            return {
              id: student.id,
              email: student.email,
              nome_completo: student.fullName || null,
              cpf: student.cpf,
              matriculas,
            }
          })
      }
    } else {
      // Superadmin: buscar todos os alunos
      const { data: alunosData, error: alunosError } = await adminClient
        .from('alunos')
        .select(`
          id,
          email,
          nome_completo,
          cpf,
          alunos_cursos (
            curso_id,
            cursos (
              id,
              nome,
              empresa_id
            )
          )
        `)
        .order('nome_completo', { ascending: true })

      if (alunosError) {
        console.error('Erro ao buscar alunos:', alunosError)
      } else {
        // Mapear alunos_cursos para matriculas para manter compatibilidade
        alunos = (alunosData || []).map(aluno => {
          const alunoTyped = aluno as { cpf?: string | null }
          return {
            id: aluno.id,
            email: aluno.email,
            nome_completo: aluno.nome_completo,
            cpf: alunoTyped.cpf || null,
            matriculas: (aluno.alunos_cursos as Array<{
              curso_id: string
              cursos?: {
                id: string
                nome: string
                empresa_id: string
              } | {
                id: string
                nome: string
                empresa_id: string
              }[]
            }>)?.map(ac => {
              const cursos = Array.isArray(ac.cursos) ? ac.cursos[0] : ac.cursos;
              return {
                curso_id: ac.curso_id,
                cursos: cursos,
              };
            }),
          }
        })
      }
    }
  } catch (error) {
    console.error('Erro ao buscar alunos:', error)
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Visualizar como Aluno</h1>
        <p className="text-muted-foreground mt-2">
          Selecione um aluno para visualizar seu ambiente de estudo
        </p>
      </div>

      <StudentList alunos={alunos || []} />
    </div>
  )
}


