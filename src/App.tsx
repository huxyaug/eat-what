import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Login from './pages/Login'
import Home from './pages/Home'
import Add from './pages/Add'
import Draw from './pages/Draw'
import Categories from './pages/Categories'
import Settings from './pages/Settings'
import AuthPhone from './pages/AuthPhone'
import BottomNav from './components/BottomNav'
import AIChat from './pages/AIChat'
import AuthPrompt from './components/AuthPrompt'

function RequireAuth() {
  const { user, initialized } = useApp()
  const location = useLocation()
  if (!initialized) return null
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
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
        <AuthPrompt />
        <BottomNav />
      </div>
    </AppProvider>
  )
}
