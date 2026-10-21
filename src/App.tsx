import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminOverview } from './features/admin/AdminOverview'
import { CourseBuilder } from './features/admin/CourseBuilder'
import { UserManagement } from './features/admin/UserManagement'
import { WithdrawalRequests } from './features/admin/WithdrawalRequests'
import { Login } from './features/auth/Login'
import { GuestRoute, ProtectedRoute } from './features/auth/ProtectedRoute'
import { Register } from './features/auth/Register'
import { CourseList } from './features/courses/CourseList'
import { LessonPlayer } from './features/courses/LessonPlayer'
import { Overview } from './features/courses/Overview'
import { Referrals } from './features/wallet/Referrals'
import { WalletView } from './features/wallet/WalletView'
import { AdminLayout } from './layouts/AdminLayout'
import { DashboardLayout } from './layouts/DashboardLayout'

export default function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* User Dashboard */}
      <Route element={<ProtectedRoute role="user" />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="courses" element={<CourseList />} />
          <Route path="courses/:courseId" element={<LessonPlayer />} />
          <Route path="wallet" element={<WalletView />} />
          <Route path="referrals" element={<Referrals />} />
        </Route>
      </Route>

      {/* Admin Dashboard */}
      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="courses" element={<CourseBuilder />} />
          <Route path="withdrawals" element={<WithdrawalRequests />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
