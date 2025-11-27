import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { pickDish } from '../lib/lottery'
import { imageUrlForDishName } from '../lib/ai'

export default function Draw() {
  const { dishes, categories } = useApp()
  const nav = useNavigate()
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0)
  const [slot1, setSlot1] = useState('')
  const [slot2, setSlot2] = useState('')
  const timerRef = useRef<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [finalDish, setFinalDish] = useState<import('../types').Dish | null>(null)
  const [finalTrail, setFinalTrail] = useState<string[]>([])
  const [history, setHistory] = useState<{ name: string; calories: number; time: number }[]>([])

  const total = useMemo(() => dishes.reduce((s, d) => s + Math.max(0, d.weight), 0), [dishes])

  const catParts = (n: string) => String(n).split('/')
  const childrenOf = (path: string[]) => categories.filter((c) => {
    const p = catParts(c.name)
    return path.every((seg, i) => p[i] === seg) && p.length === path.length + 1
  }).map((c) => ({ id: c.id, path: c.name, label: catParts(c.name)[path.length] }))
  const roots = Array.from(new Set(categories.map((c) => catParts(c.name)[0]))).sort()
  const rootItems = roots.map((r) => ({ id: categories.find((c) => c.name === r)?.id || r, path: r, label: r }))

  

  const [pieces, setPieces] = useState<{ left: number; color: string; delay: number }[]>([])
  const colors = ['#FF2442', '#34d399', '#60a5fa', '#f59e0b', '#a78bfa']

  useEffect(() => {
    try {
      const raw = localStorage.getItem('drawHistory')
      if (raw) setHistory(JSON.parse(raw))
    } catch {}
  }, [])

  const clearTimer = () => { if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null } }

  const spinThrough = (labels: string[], setLabel: (s: string) => void, stopAfterMs: number, final: string, next: () => void) => {
    clearTimer()
    let i = 0
    setLabel(labels[0] || '')
    timerRef.current = window.setInterval(() => { i = (i + 1) % (labels.length || 1); setLabel(labels[i]) }, 80)
    window.setTimeout(() => { clearTimer(); setLabel(final); next() }, stopAfterMs)
  }

  const draw = () => {
    if (!dishes.length) return
    const { dish, trail } = pickDish(categories, dishes)
    const pick1 = trail[0] || ''
    const pick2 = trail[1] || ''
    const lvl1Labels = rootItems.map((x) => x.label)
    const lvl2Labels = pick1 ? childrenOf([pick1]).map((x) => x.label) : []
    setStage(1)
    spinThrough(lvl1Labels.length ? lvl1Labels : [''], setSlot1, 1000, pick1 || '', () => {
      setStage(2)
      spinThrough(lvl2Labels.length ? lvl2Labels : [''], setSlot2, 1000, pick2 || '', () => {
        setStage(3)
        window.setTimeout(() => {
          setFinalDish(dish)
          setFinalTrail(trail)
          const arr = Array.from({ length: 24 }).map(() => ({ left: Math.floor(Math.random() * 100), color: colors[Math.floor(Math.random() * colors.length)], delay: Math.random() * 0.4 }))
          setPieces(arr)
          setShowResult(true)
          try {
            const item = { name: dish?.name || '', calories: dish?.calories || 0, time: Date.now() }
            const next = [...history, item].slice(-10)
            setHistory(next)
            localStorage.setItem('drawHistory', JSON.stringify(next))
          } catch {}
          setStage(0)
        }, 600)
      })
    })
  }

  return (
    <div className="pb-16 px-4">
      <div className="pt-4 text-2xl font-bold text-brand-red">抽签</div>
      <div className="mt-6">
        <button onClick={draw} className="btn w-full bg-brand-red text-white"><Sparkles className="mr-2" /> 今天吃啥</button>
      </div>

      <div className="mt-10 flex justify-center">
        <div className="relative w-40 h-40">
          <div className={`absolute inset-0 rounded-full bg-[conic-gradient(var(--tw-gradient-stops))] from-pink-500 via-red-500 to-yellow-400 animate-spin ${stage ? 'opacity-100' : 'opacity-60'} blur-[0.6px]`} />
          <div className="absolute inset-2 rounded-full bg-white shadow-xl flex items-center justify-center">
            <div className="text-sm font-semibold text-gray-700">
              {stage === 0 ? '等待抽取' : stage === 1 ? `正在选大类 [${slot1}]` : stage === 2 ? `正在选细分 [${slot2}]` : '最终决定...'}
            </div>
          </div>
        </div>
      </div>

      {showResult && finalDish ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowResult(false)} />
          <div className="absolute inset-0 overflow-auto">
            <div className="min-h-screen bg-white">
              <div className="mx-auto max-w-md">
                <div className="px-5 pt-6">
                  <div className="rounded-t-2xl bg-gradient-to-r from-pink-500 to-orange-400 p-4 text-white font-bold">决定就是它了！</div>
                  <div className="overflow-hidden rounded-b-2xl shadow-xl">
                    <div className="h-[50vh] bg-gray-100">
                      <img
                        src={finalDish.image_url || imageUrlForDishName(finalDish.name)}
                        alt={finalDish.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = imageUrlForDishName(finalDish.name) }}
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-xl font-bold text-gray-900">{finalDish.name}</div>
                        <div className="text-xs px-2 py-1 rounded-full bg-pink-50 text-pink-600">{finalTrail.join(' > ')}</div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">热量 {finalDish.calories}kcal · 喜爱度 {finalDish.weight}</div>
                      <div className="mt-4">
                        <div className="text-sm font-semibold mb-2">营养成分</div>
                        <div className="bg-gray-100 rounded-xl p-3">
                          {(() => {
                            const carbs = Math.round((finalDish.calories * 0.5) / 4)
                            const protein = Math.round((finalDish.calories * 0.25) / 4)
                            const fat = Math.round((finalDish.calories * 0.25) / 9)
                            const total = carbs + protein + fat
                            const cp = total ? Math.round((carbs / total) * 100) : 0
                            const pp = total ? Math.round((protein / total) * 100) : 0
                            const fp = 100 - cp - pp
                            return (
                              <div>
                                <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                                  <div className="h-3 bg-blue-500" style={{ width: `${cp}%` }} />
                                  <div className="h-3 bg-yellow-400" style={{ width: `${fp}%` }} />
                                  <div className="h-3 bg-pink-500" style={{ width: `${pp}%` }} />
                                </div>
                                <div className="mt-2 grid grid-cols-3 text-xs text-gray-600">
                                  <div>碳水 {carbs}g ({cp}%)</div>
                                  <div>脂肪 {fat}g ({fp}%)</div>
                                  <div>蛋白质 {protein}g ({pp}%)</div>
                                </div>
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button onClick={() => setShowResult(false)} className="btn flex-1 bg-brand-red text-white">关闭</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 pointer-events-none">
                  {pieces.map((p, i) => (
                    <span key={i} className="confetti-piece" style={{ left: `${p.left}%`, backgroundColor: p.color, animationDelay: `${p.delay}s` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <div className="mt-8">
        <div className="text-sm text-gray-500 mb-2">最近抽签</div>
        <div className="space-y-2">
          {history.slice().reverse().map((h, i) => (
            <div key={i} className="card p-3 flex items-center justify-between">
              <div className="text-sm font-semibold">{h.name}</div>
              <div className="text-xs text-gray-500">{new Date(h.time).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
