import { useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function LoginGate() {
  const { user, initialized } = useApp()
  const nav = useNavigate()
  const loc = useLocation()
  if (!initialized) return null
  if (user) return null
  if (/\/login$/.test(loc.pathname)) return null
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-white/80" />
      <div className="relative w-full max-w-xs px-6">
        <button className="w-full py-3 rounded-2xl bg-brand-red text-white text-lg font-bold shadow" onClick={() => nav('/login')}>立即登录 / 注册</button>
      </div>
    </div>
  )
}
