import { ArrowDownToLine, BookPlus, LayoutDashboard, Users } from 'lucide-react'
import { AppShell, type NavItem } from './AppShell'

const nav: NavItem[] = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/courses', label: 'Courses', icon: BookPlus },
  { to: '/admin/withdrawals', label: 'Payouts', icon: ArrowDownToLine },
]

export function AdminLayout() {
  return <AppShell nav={nav} badge="Admin" />
}
