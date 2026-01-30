import { cn } from "@/app/shared/library/utils"

interface PageShellProps {
  title: string | React.ReactNode
  subtitle?: string | React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function PageShell({ title, subtitle, actions, children, className }: PageShellProps) {
  return (
    <div className={cn("space-y-4 md:space-y-6", className)}>
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {typeof title === "string" ? (
            <h1 className="page-title">{title}</h1>
          ) : (
            title
          )}
          {subtitle && (
            typeof subtitle === "string" ? (
              <p className="page-subtitle">{subtitle}</p>
            ) : (
              subtitle
            )
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </header>
      {children}
    </div>
  )
}
