import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Login do Aluno'
}

// Esta rota será reativada quando o sistema de multi-tenant baseado em domínio for implementado
// Por enquanto, redireciona para a rota de login genérica
export default function AlunoLoginPage() {
  redirect('/auth/login')
}
