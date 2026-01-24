import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Área do Aluno',
    description: 'Acompanhe seu progresso e cronograma de estudos',
}

export default function AlunoLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            {children}
        </div>
    )
}
