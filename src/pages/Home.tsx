import { useEffect, useMemo, useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import DishCard from '../components/DishCard'
import { supabase } from '../lib/supabase'
import { Search, Inbox, Wand2, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Toast from '../components/Toast'
import Modal from '../components/Modal'
import DishDetail from '../components/DishDetail'
import { imageUrlForDishName } from '../lib/ai'

export default function Home() {
  const { user, dishes, categories, refreshDishes, refreshCategories } = useApp()
  const [importing, setImporting] = useState(false)
  const [root, setRoot] = useState<string>('')
  const [lvl2, setLvl2] = useState<string>('')
  const [lvl3, setLvl3] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [toastOpen, setToastOpen] = useState(false)
  const [nlu, setNlu] = useState('')
  const [detail, setDetail] = useState<import('../types').Dish | null>(null)
  const nav = useNavigate()
  useEffect(() => {
    ;(async () => {
      await refreshCategories()
      await refreshDishes()
      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    if (detail && !dishes.find((x) => x.id === detail.id)) {
      setDetail(null)
    }
  }, [dishes, detail?.id])

  const categoryMap = new Map(categories.map((c) => [c.id, c]))
  const hiddenSet = useMemo(() => {
    try { return new Set<string>(JSON.parse(localStorage.getItem('hidden.dishes') || '[]')) } catch { return new Set<string>() }
  }, [dishes])
  const empty = useMemo(() => dishes.length === 0, [dishes])

  const presets = [
    { name: '米村拌饭', calories: 650, weight: 3, category: '主食' },
    { name: '重庆火锅', calories: 900, weight: 2, category: '火锅' },
    { name: '麦当劳套餐', calories: 800, weight: 2, category: '快餐' },
    { name: '清炒时蔬', calories: 220, weight: 3, category: '素食' },
    { name: '寿司拼盘', calories: 500, weight: 3, category: '日料' },
    { name: '披萨', calories: 700, weight: 2, category: '西餐' },
    { name: '牛肉面', calories: 600, weight: 3, category: '面食' },
    { name: '冒菜', calories: 750, weight: 2, category: '川菜' },
    { name: '煎饺', calories: 450, weight: 2, category: '小吃' },
    { name: '水果沙拉', calories: 300, weight: 4, category: '沙拉' },
  ]

  const ensureCategories = async () => {
    const names = Array.from(new Set(presets.map((p) => p.category)))
    const existing = new Map(categories.map((c) => [c.name, c.id]))
    const missing = names.filter((n) => !existing.has(n))
    if (missing.length) {
      if (!user) return existing
      const { data } = await supabase.from('categories').insert(missing.map((name) => ({ name, user_id: user.id }))).select('*')
      if (data) {
        for (const c of data) existing.set(c.name, c.id)
      }
    }
    return existing
  }

  const importDefaults = async () => {
    if (!user) return
    setImporting(true)
    const map = await ensureCategories()
    const rows = presets.map((p) => ({
      user_id: user.id,
      name: p.name,
      calories: p.calories,
      weight: p.weight,
      image_url: imageUrlForDishName(p.name),
      category_id: map.get(p.category) || null,
    }))
    await supabase.from('dishes').insert(rows)
    await refreshCategories()
    await refreshDishes()
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 1500)
    setImporting(false)
  }

  const parts = (n: string) => String(n).split('/')
  const roots = Array.from(new Set(categories.map((c) => parts(c.name)[0])))
  const lvl2Opts = root ? Array.from(new Set(categories.filter((c) => parts(c.name)[0] === root && parts(c.name).length > 1).map((c) => parts(c.name)[1]))) : []
  const lvl3Opts = root && lvl2 ? Array.from(new Set(categories.filter((c) => parts(c.name)[0] === root && parts(c.name)[1] === lvl2 && parts(c.name).length > 2).map((c) => parts(c.name)[2]))) : []
  const activeIds = new Set(
    categories
      .filter((c) => {
        const p = parts(c.name)
        if (!root) return true
        if (p[0] !== root) return false
        if (lvl2 && p[1] !== lvl2) return false
        if (lvl3 && p[2] !== lvl3) return false
        return true
      })
      .map((c) => c.id)
  )
  const filtered = useMemo(() => {
    const source = dishes.filter((d) => !hiddenSet.has(d.id))
    const base = root || lvl2 || lvl3 ? source.filter((d) => activeIds.has(d.category_id || '')) : source
    let list = base
    if (keyword.trim()) {
      const k = keyword.trim().toLowerCase()
      list = list.filter((d) => d.name.toLowerCase().includes(k))
    }
    if (nlu.trim()) {
      const s = nlu.trim()
      const spicy = /辣|川|火锅/.test(s)
      const light = /清淡|蔬菜|沙拉|素/.test(s)
      const fast = /快餐|汉堡|麦当劳|肯德基/.test(s)
      list = list.filter((d) => {
        const name = d.name
        if (spicy) return /火锅|麻辣|川|冒菜/.test(name)
        if (light) return /清炒|蔬|沙拉|素/.test(name)
        if (fast) return /麦当劳|肯德基|汉堡|披萨/.test(name)
        return true
      })
    }
    return list
  }, [root, lvl2, lvl3, dishes, keyword, nlu, categories, hiddenSet])

  const pageSize = 30
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const tickingRef = useRef(false)
  useEffect(() => { setVisibleCount(pageSize) }, [root, lvl2, lvl3, keyword, nlu])
  useEffect(() => {
    const onScroll = () => {
      if (tickingRef.current) return
      tickingRef.current = true
      requestAnimationFrame(() => {
        tickingRef.current = false
        const nearBottom = (window.innerHeight + window.scrollY) > (document.body.offsetHeight - 400)
        if (nearBottom) setVisibleCount((c) => Math.min(c + pageSize, filtered.length))
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [filtered.length])

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <>
    <div className="pb-28 mx-auto max-w-md">
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-brand-red">今天吃什么</div>
          <button onClick={logout} className="btn bg-gray-100 text-gray-700">退出</button>
        </div>
      </div>
      <div className="px-4 mt-3">
        <div className="input-wrap input-pink">
          <Search size={18} className="text-gray-400" />
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索菜名" className="flex-1 bg-transparent focus:outline-none" />
        </div>
      </div>
      <div className="px-4 mt-3">
        <button onClick={() => nav('/ai')} className="w-full input-wrap input-pink text-left">
          <Wand2 size={18} className="text-gray-400" />
          <span className="text-gray-500">我想吃点辣的（去 AI 对话）</span>
        </button>
      </div>
      {loading ? (
        <div className="px-4 mt-4 grid grid-cols-2 gap-4">
          <div className="skeleton h-40" />
          <div className="skeleton h-60" />
          <div className="skeleton h-52" />
          <div className="skeleton h-44" />
        </div>
      ) : empty ? (
        <div className="px-6 mt-8 text-center">
          <div className="mx-auto w-40 h-40 rounded-full bg-white shadow-sm flex items-center justify-center">
            <Inbox size={48} className="text-gray-400" />
          </div>
          <div className="mt-4 text-gray-600">还没有菜品，试试导入热门美食</div>
          <button disabled={importing} onClick={importDefaults} className="btn mt-4 w-full max-w-xs bg-brand-red text-white">
            一键导入热门美食
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <div className="chips scrollbar-hide pr-12">
              <button onClick={() => { setRoot(''); setLvl2(''); setLvl3('') }} className={`chip ${!root ? 'chip-active' : ''}`}>全部</button>
              {roots.map((r) => (
                <button key={r} onClick={() => { setRoot(r); setLvl2(''); setLvl3('') }} className={`chip ${root === r ? 'chip-active' : ''}`}>{r}</button>
              ))}
            </div>
            <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-r from-transparent to-[#F8F8F8]" />
          </div>
          {root ? (
            <div className="relative">
              <div className="chips scrollbar-hide pr-12">
                {lvl2Opts.map((o) => (
                  <button key={o} onClick={() => { setLvl2(o); setLvl3('') }} className={`chip ${lvl2 === o ? 'chip-active' : ''}`}>{o}</button>
                ))}
              </div>
              <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-r from-transparent to-[#F8F8F8]" />
            </div>
          ) : null}
          {lvl2 ? (
            <div className="relative">
              <div className="chips scrollbar-hide pr-12">
                {lvl3Opts.map((o) => (
                  <button key={o} onClick={() => setLvl3(o)} className={`chip ${lvl3 === o ? 'chip-active' : ''}`}>{o}</button>
                ))}
              </div>
              <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-r from-transparent to-[#F8F8F8]" />
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-3">
            {filtered.slice(0, visibleCount).map((d) => (
              <div key={d.id} onClick={() => setDetail(d)}>
                <DishCard dish={d} category={categoryMap.get(d.category_id || '')} />
              </div>
            ))}
          </div>
          {visibleCount < filtered.length ? (
            <div className="mt-4 text-center text-xs text-gray-500">下拉加载更多（{visibleCount}/{filtered.length}）</div>
          ) : null}
        </>
      )}
    </div>
    <button onClick={() => nav('/add')} className="fixed bottom-24 right-6 w-16 h-16 rounded-full bg-brand-red text-white shadow-xl flex items-center justify-center active:scale-95">
      <Plus size={28} />
    </button>
    <Toast open={toastOpen} message="导入成功" />
    <Modal open={!!detail} onClose={() => setDetail(null)}>
      {detail ? <DishDetail dish={detail} category={categoryMap.get(detail.category_id || '')} /> : null}
    </Modal>
    </>
  )
}
