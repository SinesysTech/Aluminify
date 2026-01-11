import Link from 'next/link'
import { cn } from '@/lib/utils'

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
    >
      {/* Form Area */}
      <div
        className={cn(
          'relative z-10 flex w-full flex-col justify-between overflow-y-auto bg-white p-8 md:w-1/2 md:p-12',
          formSide === 'left'
            ? 'border-r border-gray-200'
            : 'border-l border-gray-200'
        )}
        style={{
          minWidth: formWidth,
          maxWidth: formWidth,
        }}
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
      </div>

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
