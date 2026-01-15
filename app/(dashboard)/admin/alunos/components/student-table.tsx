"use client"

import { MoreHorizontal } from 'lucide-react'
import { Student } from '@/types/shared/entities/user'

interface StudentTableProps {
    students: Student[]
}

export function StudentTable({ students }: StudentTableProps) {
    return (
        <div className="rounded-lg border border-[#E4E4E7] bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] overflow-hidden flex-1">
            <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 border-b border-[#E4E4E7]">
                    <tr>
                        <th className="h-10 px-4 font-mono text-xs font-medium text-[#71717A] uppercase tracking-wider w-[120px]">ID Sistema</th>
                        <th className="h-10 px-4 font-medium text-[#71717A] uppercase tracking-wider text-xs">Aluno / Email</th>
                        <th className="h-10 px-4 font-medium text-[#71717A] uppercase tracking-wider text-xs w-[150px]">Status</th>
                        <th className="h-10 px-4 font-medium text-[#71717A] uppercase tracking-wider text-xs w-[200px]">Progresso</th>
                        <th className="h-10 px-4 font-medium text-[#71717A] uppercase tracking-wider text-xs text-right w-[60px]">Ações</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-[#E4E4E7]">
                    {students.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-zinc-500">
                                Nenhum aluno encontrado com esses filtros.
                            </td>
                        </tr>
                    ) : (
                        students.map((student) => {
                            const initials = student.fullName
                                ? student.fullName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
                                : '??';
                            const status = 'Ativo'; // Mocked for now as it's not in Student type yet
                            const progress = 0; // Mocked for now

                            return (
                                <tr key={student.id} className="group hover:bg-zinc-50 transition-colors">
                                    <td className="p-4 font-mono text-xs text-[#71717A]">{student.id.substring(0, 8)}...</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600">
                                                {initials}
                                            </div>
                                            <div>
                                                <div className="font-medium text-zinc-900">{student.fullName || 'Sem nome'}</div>
                                                <div className="font-mono text-xs text-[#71717A]">{student.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${status === 'Ativo'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : 'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                            {status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${status === 'Ativo' ? 'bg-zinc-800' : 'bg-zinc-300'}`}
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                            <span className="font-mono text-xs text-[#71717A]">{progress}%</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-zinc-400 hover:text-zinc-900 transition-colors">
                                            <MoreHorizontal className="w-5 h-5" strokeWidth={1.5} />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })
                    )}
                </tbody>
            </table>

            <div className="bg-zinc-50 border-t border-[#E4E4E7] px-4 py-3 flex items-center justify-between">
                {/* Simple pagination mock for UI parity - logic to be added with real pagination props */}
                <span className="text-xs text-[#71717A]">Mostrando <strong>{students.length}</strong> resultados</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1 border border-[#E4E4E7] bg-white rounded text-xs font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50" disabled>Anterior</button>
                    <button className="px-3 py-1 border border-[#E4E4E7] bg-white rounded text-xs font-medium text-zinc-600 hover:bg-zinc-50">Próximo</button>
                </div>
            </div>
        </div>
    )
}
