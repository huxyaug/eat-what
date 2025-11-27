import { useNavigate } from 'react-router-dom'
import Modal from './Modal'
import { useApp } from '../context/AppContext'

export default function AuthPrompt() {
  const { authPromptOpen, dismissAuthPrompt } = useApp()
  const nav = useNavigate()
  return (
    <Modal open={authPromptOpen} onClose={() => dismissAuthPrompt()}>
      <div className="space-y-3">
        <div className="text-lg font-bold">欢迎使用 EatWhat</div>
        <div className="text-sm text-gray-600">登录后可同步你的数据与偏好</div>
        <div className="grid grid-cols-1 gap-2">
          <button className="btn w-full bg-brand-red text-white" onClick={() => nav('/login')}>邮箱登录/注册</button>
          <button className="btn w-full bg-gray-100 text-gray-700" onClick={() => nav('/phone')}>手机验证码登录</button>
        </div>
        <div className="flex items-center justify-between">
          <button className="text-sm text-gray-600" onClick={() => dismissAuthPrompt()}>稍后登录</button>
          <div className="text-xs text-gray-400">未登录时自动弹出</div>
        </div>
      </div>
    </Modal>
  )
}
