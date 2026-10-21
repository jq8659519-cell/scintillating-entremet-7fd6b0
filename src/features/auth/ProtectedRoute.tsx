import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Role } from '../../db/schema'
import { useAuth } from '../../hooks/useAuth'

export function homePathFor(role: Role) {
  return role === 'admin' ? '/admin' : '/dashboard'
}

export function ProtectedRoute({ role }: { role: Role }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (user.role !== role) return <Navigate to={homePathFor(user.role)} replace />
  return <Outlet />
}

export function GuestRoute() {
  const { user } = useAuth()
  if (user) return <Navigate to={homePathFor(user.role)} replace />
  return <Outlet />
}
