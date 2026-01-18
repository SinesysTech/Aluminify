import React from 'react'

"use client"

import { Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

export function StudentFilters() {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set('query', term)
            params.set('page', '1') // Reset to first page on search
        } else {
            params.delete('query')
        }
        replace(`${pathname}?${params.toString()}`)
    }, 300)

    return (
        <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 w-5 h-5 text-zinc-400" strokeWidth={1.5} />
                <input
                    type="text"
                    placeholder="Buscar por nome, email ou ID..."
                    className="w-full h-10 pl-9 pr-4 rounded-md border border-[#E4E4E7] bg-white text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] transition-all"
                    onChange={(e) => handleSearch(e.target.value)}
                    defaultValue={searchParams.get('query')?.toString()}
                />
            </div>
            <div className="flex items-center gap-2">
                {/* TODO: Add functional filters for Status and Cohort if supported by backend later */}
                <select className="h-10 px-3 rounded-md border border-[#E4E4E7] bg-white text-sm text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-400 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] cursor-pointer">
                    <option>Status: Todos</option>
                    <option>Ativos</option>
                    <option>Inadimplentes</option>
                </select>
                <select className="h-10 px-3 rounded-md border border-[#E4E4E7] bg-white text-sm text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-400 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] cursor-pointer">
                    <option>Turma: Todas</option>
                    <option>Extensivo 2024</option>
                    <option>Intensivo Med</option>
                </select>
            </div>
        </div>
    )
}
