import { NavLink, useLocation } from 'react-router-dom'
import { Home, Dice5, Settings as SettingsIcon, MessageSquare } from 'lucide-react'

export default function BottomNav() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login'
  const isHome = location.pathname === '/'
  const isDraw = location.pathname === '/draw'
  const isAI = location.pathname === '/ai'
  if (isAuthPage) return null
  return (
    <nav className="blur-nav">
      <div className="mx-auto max-w-md grid grid-cols-4 text-center">
        <NavLink to="/" className={({ isActive }) => `py-3 flex items-center justify-center gap-1 ${isActive ? 'text-brand-red' : 'text-gray-500'} active:scale-95 transition-transform`}>
          <Home className="mr-1" size={22} strokeWidth={isHome ? 2.5 : 1.5} /> 首页
        </NavLink>
        <NavLink to="/draw" className={({ isActive }) => `py-3 flex items-center justify-center gap-1 ${isActive ? 'text-brand-red' : 'text-gray-500'} active:scale-95 transition-transform`}>
          <Dice5 className="mr-1" size={22} strokeWidth={isDraw ? 2.5 : 1.5} /> 抽签
        </NavLink>
        <NavLink to="/ai" className={({ isActive }) => `py-3 flex items-center justify-center gap-1 ${isActive ? 'text-brand-red' : 'text-gray-500'} active:scale-95 transition-transform`}>
          <MessageSquare className="mr-1" size={22} strokeWidth={isAI ? 2.5 : 1.5} /> AI
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `py-3 flex items-center justify-center gap-1 ${isActive ? 'text-brand-red' : 'text-gray-500'} active:scale-95 transition-transform`}>
          <SettingsIcon className="mr-1" size={22} strokeWidth={location.pathname === '/settings' ? 2.5 : 1.5} /> 设置
        </NavLink>
      </div>
    </nav>
  )
}
