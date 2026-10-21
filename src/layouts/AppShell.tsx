import { LogOut, type LucideIcon } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { Badge } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { cn, formatPoints } from '../lib/utils'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export function AppShell({ nav, badge }: { nav: NavItem[]; badge?: string }) {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border bg-surface p-4 md:flex">
        <div className="flex items-center justify-between px-2 py-1">
          <Logo />
          {badge && <Badge tone="warning">{badge}</Badge>}
        </div>
        <nav aria-label="Main" className="mt-8 flex flex-1 flex-col gap-1">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                  isActive ? 'bg-primary/15 text-primary' : 'text-muted hover:bg-surface-muted hover:text-foreground',
                )
              }
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
        {user && (
          <div className="flex flex-col gap-3 border-t border-border pt-4">
            <div className="flex flex-col px-2">
              <span className="truncate text-sm font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted">{user.email}</span>
            </div>
            <button onClick={logout} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface-muted hover:text-foreground">
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/85 px-4 py-3 backdrop-blur md:hidden">
          <Logo />
          <div className="flex items-center gap-2">
            {user?.role === 'user' && <Badge tone="warning">{`${formatPoints(user.points)} pts`}</Badge>}
            {badge && <Badge tone="warning">{badge}</Badge>}
            <button onClick={logout} className="rounded-lg p-2 text-muted hover:bg-surface-muted hover:text-foreground" aria-label="Sign out">
              <LogOut className="size-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 pt-6 pb-24 md:px-8 md:py-8">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <Outlet />
          </div>
        </main>

        <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-20 flex border-t border-border bg-surface/95 backdrop-blur md:hidden">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn('flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium', isActive ? 'text-primary' : 'text-muted')
              }
            >
              <Icon className="size-5" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
