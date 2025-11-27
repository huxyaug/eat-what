import { Outlet, Route, Routes } from 'react-router-dom'
import { useEffect, Suspense, lazy } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import BottomNav from './components/BottomNav'
import AuthDialog from './components/AuthDialog'

const Login = lazy(() => import('./pages/Login'))
const Home = lazy(() => import('./pages/Home'))
const Add = lazy(() => import('./pages/Add'))
const Draw = lazy(() => import('./pages/Draw'))
const Categories = lazy(() => import('./pages/Categories'))
const Settings = lazy(() => import('./pages/Settings'))
const AuthPhone = lazy(() => import('./pages/AuthPhone'))
const AIChat = lazy(() => import('./pages/AIChat'))

function RequireAuth() {
  const { initialized } = useApp()
  if (!initialized) return null
  return <Outlet />
}

export default function App() {
  useEffect(() => {
    const key = (import.meta.env.VITE_AI_KEY as string | undefined) || ''
    const endpoint = (import.meta.env.VITE_AI_ENDPOINT as string | undefined) || ''
    const masked = key ? key.slice(0, 6) + '...' : '(none)'
    console.log('AI 配置检测', { key: masked, endpoint })
  }, [])
  return (
    <AppProvider>
      <div className="min-h-screen bg-bg text-text">
        <Suspense fallback={<div className="p-6 text-center text-sm text-gray-500">页面加载中…</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/phone" element={<AuthPhone />} />
            <Route element={<RequireAuth />}>
              <Route path="/" element={<Home />} />
              <Route path="/add" element={<Add />} />
              <Route path="/draw" element={<Draw />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/ai" element={<AIChat />} />
            </Route>
          </Routes>
        </Suspense>
        <AuthDialog />
        <BottomNav />
      </div>
    </AppProvider>
  )
}
