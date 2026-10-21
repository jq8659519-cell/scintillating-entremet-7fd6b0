import type { ReactNode } from 'react'
import { Award, BookOpen, Wallet } from 'lucide-react'
import { Logo } from '../../components/Logo'

const highlights = [
  { icon: BookOpen, text: 'Structured courses with lesson-by-lesson progress' },
  { icon: Award, text: 'Earn points for every lesson you complete' },
  { icon: Wallet, text: 'Invite friends and withdraw your rewards' },
]

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <aside className="hidden w-[42%] flex-col justify-between border-r border-border bg-surface p-10 lg:flex">
        <Logo />
        <div className="flex flex-col gap-6">
          <h2 className="text-3xl font-semibold tracking-tight text-balance">Learn something new and get rewarded for it.</h2>
          <ul className="flex flex-col gap-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-muted">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-muted">Prototype — all data is stored in your browser&apos;s localStorage.</p>
      </aside>
      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted">{subtitle}</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
