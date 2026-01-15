import { studentService } from '@/backend/services/student'
import { courseService } from '@/backend/services/course'
import { AlunosClientPage } from './components/client-page'

export default async function AlunosPage({ searchParams }: { searchParams: { page?: string, query?: string } }) {
  const page = Number(searchParams.page) || 1
  const query = searchParams.query || ''

  const [studentsResult, coursesResult] = await Promise.all([
    studentService.list({ page, perPage: 10, query }),
    courseService.list({ perPage: 100, sortBy: 'name', sortOrder: 'asc' })
  ])

  const { data: students, meta } = studentsResult
  const { data: courses } = coursesResult

  // Map courses to lighter object if needed, or pass Course type if updated on client
  const coursesSimple = courses.map(c => ({ id: c.id, name: c.name }))

  return <AlunosClientPage students={students} meta={meta} courses={coursesSimple} />
}
