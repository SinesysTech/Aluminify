import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nova Empresa'
}

export default function NovaEmpresaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
