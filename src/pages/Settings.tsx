import { useEffect, useState } from 'react'
import Add from './Add'
import Categories from './Categories'
import menu from '../data/defaultMenu.json'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'
import { imageUrlForDishName } from '../lib/ai'

export default function Settings() {
  const [theme, setTheme] = useState('classic')
  const [tab, setTab] = useState<'general' | 'add' | 'categories'>('general')
  const [aiEndpoint, setAiEndpoint] = useState('')
  const [aiModel, setAiModel] = useState('')
  const [aiKeys, setAiKeys] = useState('')
  const { user, categories, dishes, refreshCategories, refreshDishes } = useApp()
  const [autoImportOn, setAutoImportOn] = useState(false)
  useEffect(() => {
    const root = document.body
    root.dataset.theme = theme
  }, [theme])
  useEffect(() => {
    try {
      setAiEndpoint(localStorage.getItem('ai.endpoint') || (import.meta.env.VITE_AI_ENDPOINT as string) || '')
      setAiModel(localStorage.getItem('ai.model') || (import.meta.env.VITE_AI_MODEL as string) || '')
      setAiKeys(localStorage.getItem('ai.keys') || (import.meta.env.VITE_AI_KEYS as string) || '')
      setAutoImportOn((localStorage.getItem('auto.import.defaults') || 'off') === 'on')
    } catch {}
  }, [])
  useEffect(() => {
  }, [])
  const saveAI = () => {
    try {
      localStorage.setItem('ai.endpoint', aiEndpoint)
      localStorage.setItem('ai.model', aiModel)
      localStorage.setItem('ai.keys', aiKeys)
      alert('AI 配置已保存')
    } catch {}
  }

  const initMassMenu = async () => {
    if (!user) { alert('请先登录'); return }
    const flagKey = `mass.import.done:${user.id}`
    try {
    } catch {}
    const { data: existDishes } = await supabase.from('dishes').select('id,name,category_id').eq('user_id', user.id)
    const names = new Set<string>([...menu.categories, ...menu.dishes.map((d: any) => d.category)])
    const exist = new Map<string, string>(categories.map((c) => [c.name, c.id]))
    const missing = Array.from(names).filter((n) => !exist.has(n))
    if (missing.length) {
      const { data, error } = await supabase.from('categories').insert(missing.map((name) => ({ name, user_id: user.id }))).select('id,name')
      if (error) { alert(error.message); return }
      if (data) for (const row of data) exist.set(row.name as string, row.id as string)
    }
    const existingKeys = new Set<string>((existDishes || []).map((x: any) => `${x.name}|${x.category_id || ''}`))
    const rowsAll = menu.dishes.map((d: any) => ({
      user_id: user.id,
      name: d.name,
      calories: Number(d.calories) || 0,
      weight: 2,
      image_url: d.image_url,
      category_id: exist.get(d.category) || null,
    }))
    const rows = rowsAll.filter((r: any) => !existingKeys.has(`${r.name}|${r.category_id || ''}`))
    if (rows.length === 0) { await refreshCategories(); await refreshDishes(); try { } catch {}; alert('已初始化，无需重复导入'); return }
    const { error: err2 } = await supabase.from('dishes').insert(rows)
    if (err2) { alert(err2.message); return }
    await refreshCategories(); await refreshDishes()
    try { } catch {}
    alert('已初始化海量美食库')
  }

  const clearAllDishes = async () => {
    if (!user) { alert('请先登录'); return }
    const { data: all } = await supabase.from('dishes').select('id').eq('user_id', user.id)
    const ids = (all || []).map((x: any) => x.id)
    if (ids.length === 0) { await refreshDishes(); alert('无可清空的菜品'); return }
    const { data: removed, error } = await supabase.from('dishes').delete().in('id', ids).select('id')
    if (error) { alert(error.message); return }
    await refreshDishes()
    if (!removed || removed.length === 0) { alert('清空未生效，可能是权限或数据不匹配'); return }
    try { localStorage.removeItem('hidden.dishes') } catch {}
    alert('已清空当前菜品')
  }
  return (
    <div className="pb-20 px-4">
      <div className="pt-4 text-2xl font-bold text-brand-red">设置</div>
      <div className="mt-4 flex gap-2">
        <button onClick={() => setTab('general')} className={`btn ${tab==='general' ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-700'}`}>通用</button>
        <button onClick={() => setTab('add')} className={`btn ${tab==='add' ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-700'}`}>发布美食</button>
        <button onClick={() => setTab('categories')} className={`btn ${tab==='categories' ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-700'}`}>分类管理</button>
      </div>
      {tab === 'general' ? (
      <div className="mt-6">
        <div className="text-sm text-gray-500 mb-2">皮肤/主题</div>
        <div className="flex gap-2">
          <button onClick={() => setTheme('classic')} className={`btn ${theme==='classic' ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-700'}`}>简约风</button>
          <button onClick={() => setTheme('cyber')} className={`btn ${theme==='cyber' ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-700'}`}>赛博朋克风</button>
          <button onClick={() => setTheme('anime')} className={`btn ${theme==='anime' ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-700'}`}>二次元美食风</button>
        </div>
        <div className="mt-6 card p-4">
          <div className="text-sm font-semibold mb-2">数据统计</div>
          <div className="flex items-center justify-between">
            <div className="text-sm">当前菜品总数：<span className="font-bold text-brand-red">{dishes.length}</span> / 1000</div>
            <div className={`text-xs px-2 py-1 rounded-full ${dishes.length >= 1000 ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-700'}`}>{dishes.length >= 1000 ? '已达标' : '未达标'}</div>
          </div>
          <div className="mt-3">
            <button onClick={async () => { await refreshCategories(); await refreshDishes() }} className="btn w-full bg-gray-100 text-gray-700">刷新统计</button>
          </div>
        </div>
        
        <div className="mt-6 card p-4">
          <div className="text-sm font-semibold mb-2">数据初始化</div>
          <div className="flex gap-2">
            <button onClick={clearAllDishes} className="btn flex-1 bg-gray-100 text-gray-700">清空当前菜品</button>
            <button onClick={async () => { if (confirm('确认导入真实菜品库？这将为当前用户初始化菜品。')) { await initMassMenu() } }} className="btn flex-1 bg-brand-red text-white">导入真实菜品库</button>
          </div>
        </div>
        <div className="mt-6 card p-4">
          <div className="text-sm font-semibold mb-2">数据清理</div>
          <div className="flex gap-2">
            <button onClick={async () => {
              if (!user) { alert('请先登录'); return }
              const { data: all } = await supabase.from('dishes').select('id,name,category_id,created_at').eq('user_id', user.id)
              const groups: Record<string, { keep: string; remove: string[] }> = {}
              for (const d of (all || [])) {
                const key = `${d.name}|${d.category_id || ''}`
                if (!groups[key]) groups[key] = { keep: d.id as string, remove: [] }
                else groups[key].remove.push(d.id as string)
              }
              const toDelete = Object.values(groups).flatMap((g) => g.remove)
              if (toDelete.length === 0) { alert('无重复项，无需清理'); return }
              const { error } = await supabase.from('dishes').delete().in('id', toDelete)
              if (error) { alert(error.message); return }
              await refreshDishes()
              alert(`已清理重复菜品 ${toDelete.length} 条`)
            }} className="btn flex-1 bg-gray-100 text-gray-700">清理重复菜品</button>
          </div>
        </div>
      </div>
      ) : null}
      {tab === 'add' ? (
        <div className="mt-6">
          <Add />
        </div>
      ) : null}
      {tab === 'categories' ? (
        <div className="mt-6">
          <Categories />
        </div>
      ) : null}
      
    </div>
  )
}
