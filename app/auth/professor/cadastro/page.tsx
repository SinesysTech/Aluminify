import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Cadastro do Professor'
}

// Esta rota será reativada quando o sistema de multi-tenant baseado em domínio for implementado
// Por enquanto, redireciona para a rota de login genérica
export default function ProfessorCadastroPage() {
  redirect('/auth/login')
}
