import { useState } from 'react'
import Modal from './Modal'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'

export default function AuthDialog() {
  const { authPromptOpen, dismissAuthPrompt } = useApp()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) setError(error.message)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setError(error.message)
      }
      if (!error) dismissAuthPrompt(true)
    } finally {
      setLoading(false)
    }
  }

  const oauth = async (provider: 'github' | 'google') => {
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } })
    if (error) setError(error.message)
  }

  const reset = async () => {
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/login' })
    if (error) setError(error.message)
    else alert('已发送密码重置邮件，请查收')
  }

  return (
    <Modal open={authPromptOpen} onClose={() => dismissAuthPrompt()}>
      <div className="space-y-3">
        <div className="text-lg font-bold">欢迎使用 EatWhat</div>
        <div className="text-sm text-gray-600">请登录或注册以保存你的菜品与偏好</div>
        <form className="space-y-2" onSubmit={submit}>
          <input type="email" placeholder="邮箱" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2" required />
          <input type="password" placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2" required />
          {error ? <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</div> : null}
          <button type="submit" disabled={loading} className="w-full bg-brand-red text-white py-2 rounded-xl">{mode === 'login' ? '登录' : '注册'}</button>
        </form>
        <div className="flex items-center justify-between text-sm">
          <button className="text-brand-red" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? '没有账号？去注册' : '已有账号？去登录'}</button>
          <button className="text-gray-600" onClick={reset}>忘记密码</button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button className="btn bg-gray-100 text-gray-700" onClick={() => oauth('github')}>使用 GitHub 登录</button>
          <button className="btn bg-gray-100 text-gray-700" onClick={() => oauth('google')}>使用 Google 登录</button>
        </div>
        <div className="flex items-center justify-between">
          <button className="text-sm text-gray-600" onClick={() => dismissAuthPrompt()}>稍后登录</button>
          <div className="text-xs text-gray-400">首次访问自动弹出，稍后可在设置中登录</div>
        </div>
      </div>
    </Modal>
  )
}
