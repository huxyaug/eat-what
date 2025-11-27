import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthPhone() {
  const [phone, setPhone] = useState('')
  const [token, setToken] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const send = async () => {
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({ phone })
    if (error) setError(error.message)
    else setSent(true)
  }
  const verify = async () => {
    setError(null)
    const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' })
    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm p-6">
        <div className="text-center text-2xl font-bold text-brand-red">手机号登录</div>
        <div className="mt-6 space-y-3">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="手机号" className="w-full rounded-xl px-3 py-3 bg-gray-100" />
          {!sent ? (
            <button onClick={send} className="btn w-full bg-brand-red text-white">发送验证码</button>
          ) : (
            <>
              <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="验证码" className="w-full rounded-xl px-3 py-3 bg-gray-100" />
              <button onClick={verify} className="btn w-full bg-brand-red text-white">登录</button>
            </>
          )}
          {error ? <div className="text-xs text-red-500">{error}</div> : null}
        </div>
      </div>
    </div>
  )
}

