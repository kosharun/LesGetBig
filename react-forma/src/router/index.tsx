import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import App from '../App'
import ErrorPage from '../components/ErrorPage'
import { lazy } from 'react'

// Lazy import pages when implemented
const Landing = () => import('../pages/Landing').then(m => ({ Component: m.Landing }))
const Login = () => import('../pages/Login').then(m => ({ Component: m.Login }))
const Register = () => import('../pages/Register').then(m => ({ Component: m.Register }))
const Dashboard = () => import('../pages/Dashboard').then(m => ({ Component: m.Dashboard }))
const ProfilesList = () => import('../pages/Profiles/ProfilesList').then(m => ({ Component: m.ProfilesList }))
const MyProfile = () => import('../pages/Profiles/MyProfile').then(m => ({ Component: m.MyProfile }))
const Schedule = () => import('../pages/Schedule').then(m => ({ Component: m.Schedule }))
const Progress = () => import('../pages/Progress').then(m => ({ Component: m.Progress }))
const Plans = () => import('../pages/Plans').then(m => ({ Component: m.Plans }))
const Chat = () => import('../pages/Chat').then(m => ({ Component: m.Chat }))
const Settings = () => import('../pages/Settings').then(m => ({ Component: m.Settings }))

// Simple session reader; will be replaced by store usage
function isAuthenticated(): boolean {
  const raw = sessionStorage.getItem('forma-session')
  return !!raw
}

function ProtectedLayout() {
  if (!isAuthenticated()) return <Navigate to="/login" replace />
  return <Outlet />
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, lazy: Landing },
      { path: 'login', lazy: Login },
      { path: 'register', lazy: Register },
      {
        path: '',
        element: <ProtectedLayout />,
        children: [
          { path: 'dashboard', lazy: Dashboard },
          { path: 'profiles', lazy: ProfilesList },
          { path: 'profiles/me', lazy: MyProfile },
          { path: 'schedule', lazy: Schedule },
          { path: 'progress', lazy: Progress },
          { path: 'plans', lazy: Plans },
          { path: 'chat', lazy: Chat },
          { path: 'settings', lazy: Settings },
        ],
      },
    ],
  },
])

export default router


