import { useEffect, useRef, useState } from 'react'
import { chatRecommend, generateShoppingList } from '../lib/ai'
import { useApp } from '../context/AppContext'
import { Send, Wand2 } from 'lucide-react'

type Msg = { role: 'user' | 'assistant'; content: string }

export default function AIChat() {
  const { user } = useApp()
  const [messages, setMessages] = useState<Msg[]>([{ role: 'assistant', content: '告诉我你的口味、预算或场景，我来推荐今天吃什么' }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef<HTMLDivElement | null>(null)
  const [listItems, setListItems] = useState<Array<{ item: string; qty: string }>>([])

  useEffect(() => { listRef.current?.scrollTo({ top: 999999, behavior: 'smooth' }) }, [messages.length])

  const send = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content) return
    setInput('')
    const next: Msg[] = [...messages, { role: 'user', content }]
    setMessages(next)
    setLoading(true)
    try {
      const chain = next.map((m) => ({ role: m.role, content: m.content })) as { role: 'user' | 'assistant'; content: string }[]
      const reply = await chatRecommend(chain)
      setMessages([...next, { role: 'assistant', content: reply }])
    } finally {
      setLoading(false)
    }
  }

  const quick = (t: string) => send(t)

  const buildList = async () => {
    const ctx = messages.slice().reverse().find((m) => m.role === 'assistant')?.content || messages[messages.length - 1]?.content || ''
    if (!ctx) return
    const items = await generateShoppingList(ctx)
    setListItems(items)
  }

  if (!user) return null
  return (
    <div className="pb-20 px-4 mx-auto max-w-md">
      <div className="pt-4 text-2xl font-bold text-brand-red">AI 决策</div>
      <div ref={listRef} className="card p-3 mt-4 h-[60vh] overflow-auto space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[75%] px-3 py-2 rounded-2xl ${m.role === 'assistant' ? 'bg-gray-100 text-gray-800' : 'bg-brand-red text-white'}`}>{m.content}</div>
          </div>
        ))}
        {loading ? <div className="text-xs text-gray-500">AI 正在思考…</div> : null}
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={() => quick('我想吃点辣的，来点重口味')} className="btn flex-1 bg-gray-100 text-gray-700">重口味</button>
        <button onClick={() => quick('我今天想清淡一点，低卡为主')} className="btn flex-1 bg-gray-100 text-gray-700">清淡低卡</button>
        <button onClick={() => quick('我赶时间，来点快捷的')} className="btn flex-1 bg-gray-100 text-gray-700">快捷</button>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="和 AI 聊聊，帮你决定今天吃什么" className="flex-1 rounded-xl px-4 py-3 bg-gray-100 focus:outline-none" />
        <button onClick={() => send()} disabled={loading} className="btn bg-brand-red text-white"><Send size={18} /></button>
        <button onClick={() => quick('随便推荐一份适合今天的菜单')} disabled={loading} className="btn bg-gray-100 text-gray-700"><Wand2 size={18} /></button>
      </div>
      {listItems.length ? (
        <div className="mt-3 card p-3">
          <div className="text-sm font-semibold mb-2">购物清单</div>
          <div className="space-y-1">
            {listItems.map((it, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div>{it.item}</div>
                <div className="text-gray-500">{it.qty}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <div className="mt-2">
        <button onClick={buildList} className="btn w-full bg-gray-100 text-gray-700">从当前建议生成购物清单</button>
      </div>
    </div>
  )
}
