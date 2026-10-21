import { BookOpen, Gift, LayoutDashboard, Wallet } from 'lucide-react'
import { AppShell, type NavItem } from './AppShell'

const nav: NavItem[] = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/courses', label: 'Courses', icon: BookOpen },
  { to: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
  { to: '/dashboard/referrals', label: 'Referrals', icon: Gift },
]

export function DashboardLayout() {
  return <AppShell nav={nav} />
}
