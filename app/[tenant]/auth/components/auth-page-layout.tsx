import type React from 'react'
import Link from 'next/link'
import { cn } from '@/shared/library/utils'
import { Card } from '@/components/ui/card'

interface AuthPageLayoutProps {
  children: React.ReactNode
  formSide?: 'left' | 'right'
  formWidth?: string
  decorativeContent?: React.ReactNode
  decorativeBackground?: 'light' | 'dark'
  footerContent?: React.ReactNode
}

export function AuthPageLayout({
  children,
  formSide = 'left',
  formWidth = '480px',
  decorativeContent,
  decorativeBackground = 'light',
  footerContent,
}: AuthPageLayoutProps) {
  return (
    <div
      className={cn(
        'flex min-h-screen w-full',
        formSide === 'right' ? 'flex-row-reverse' : 'flex-row'
      )}
      style={{
        // Auth pages use neutral/professional colors independent of tenant theme
        '--primary': 'hsl(240 5.9% 10%)',
        '--primary-foreground': 'hsl(0 0% 98%)',
        '--muted-foreground': 'hsl(240 3.8% 46.1%)',
      } as React.CSSProperties}
    >
      {/* Form Area */}
      <Card
        className={cn(
          'relative z-10 flex w-full flex-col justify-between gap-0 overflow-y-auto bg-card p-8 md:w-1/2 md:p-12 lg:flex-none lg:w-(--form-width) lg:min-w-(--form-width) lg:max-w-(--form-width) rounded-none border-0 shadow-none',
          formSide === 'left'
            ? 'border-r border-gray-200'
            : 'border-l border-gray-200'
        )}
        style={{ '--form-width': formWidth } as React.CSSProperties}
      >
        {/* Logo */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">A</span>
            </div>
            <span className="font-sans text-lg font-bold">Aluminify</span>
          </Link>
        </div>

        {/* Form Content */}
        <div className="flex-1">{children}</div>

        {/* Footer */}
        {footerContent && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            {footerContent}
          </div>
        )}
      </Card>

      {/* Decorative Area */}
      <div
        className={cn(
          'relative hidden flex-1 items-center justify-center overflow-hidden md:flex',
          decorativeBackground === 'dark' ? 'bg-[#111827]' : 'bg-gray-50'
        )}
      >
        {/* Grid Pattern */}
        <div
          className={cn(
            'absolute inset-0',
            decorativeBackground === 'dark'
              ? 'bg-grid-pattern-dark opacity-20'
              : 'bg-grid-pattern opacity-60'
          )}
        />

        {/* Decorative Content */}
        <div className="relative z-10">{decorativeContent}</div>
      </div>
    </div>
  )
}
