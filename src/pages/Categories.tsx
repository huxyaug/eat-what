import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'
import { Trash, PlusCircle, Pencil, Star, ChevronRight, ArrowRight } from 'lucide-react'
import Slider from '../components/Slider'

export default function Categories() {
  const { categories, refreshCategories, user } = useApp()
  const [error, setError] = useState<string | null>(null)
  const [renameFor, setRenameFor] = useState<{ id: string; path: string } | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [renameWeight, setRenameWeight] = useState(50)
  const [weightFor, setWeightFor] = useState<{ id: string; label: string } | null>(null)
  const [weightValue, setWeightValue] = useState(50)
  const [path, setPath] = useState<string[]>([])
  const [newName, setNewName] = useState('')
  const [newWeight, setNewWeight] = useState(50)

  useEffect(() => { refreshCategories() }, [])
  useEffect(() => {
    ;(async () => {
      if (!user) return
      try {
        await supabase.from('categories').update({ weight: 50 }).is('weight', null).eq('user_id', user.id)
        await refreshCategories()
      } catch {}
    })()
  }, [user?.id])

  const add = async () => {
    setError(null)
    const nm = newName.trim()
    if (!nm) return
    if (!user) { setError('未登录'); return }
    const parent = path.join('/')
    const fullname = parent ? `${parent}/${nm}` : nm
    const { error } = await supabase.from('categories').insert({ name: fullname, user_id: user.id, weight: newWeight })
    if (error) setError(error.message)
    setNewName('')
    setNewWeight(50)
    await refreshCategories()
  }

  

  const parts = (n: string) => String(n).split('/')
  const childrenOf = (pArr: string[]) => categories.filter((c) => {
    const p = parts(c.name)
    return pArr.every((seg, i) => p[i] === seg) && p.length === pArr.length + 1
  }).map((c) => ({ id: c.id, name: c.name, label: parts(c.name)[pArr.length] }))
  const current = childrenOf(path)

  const remove = async (id: string) => {
    await supabase.from('categories').delete().eq('id', id)
    await refreshCategories()
  }

  const rename = async () => {
    if (!renameFor || !renameValue.trim()) return
    const { id, path } = renameFor
    const parts = path.split('/')
    parts[parts.length - 1] = renameValue.trim()
    const fullname = parts.join('/').replace(/^\/+/, '')
    const { error } = await supabase.from('categories').update({ name: fullname, weight: renameWeight }).eq('id', id)
    if (!error) { setRenameFor(null); setRenameValue(''); await refreshCategories() }
  }

  const getWeights = (): Record<string, number> => {
    try { return JSON.parse(localStorage.getItem('catWeights') || '{}') } catch { return {} }
  }
  const setWeights = (obj: Record<string, number>) => { try { localStorage.setItem('catWeights', JSON.stringify(obj)) } catch {} }
  const getWeight = (id: string) => getWeights()[id] ?? 50
  const openWeight = (id: string, label: string) => { setWeightFor({ id, label }); setWeightValue(getWeight(id)) }
  const saveWeight = async () => {
    if (!weightFor) return
    const map = getWeights()
    map[weightFor.id] = weightValue
    setWeights(map)
    try { await supabase.from('categories').update({ weight: weightValue }).eq('id', weightFor.id) } catch {}
    setWeightFor(null)
  }

  

  return (
    <div className="pb-20 px-4">
      <div className="pt-4 text-2xl font-bold text-brand-red">分类管理</div>
      {error ? <div className="mt-2 text-xs text-red-500">{error}</div> : null}
      <div className="mt-4 flex items-center gap-2 text-sm">
        <button onClick={() => setPath([])} className="btn bg-gray-100 text-gray-700">全部</button>
        {path.map((seg, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <ChevronRight size={14} className="text-gray-400" />
            <button onClick={() => setPath(path.slice(0, idx + 1))} className="btn bg-gray-100 text-gray-700">{seg}</button>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <div className="card p-3">
          <div className="text-sm">在 {path.length ? path.join(' / ') : '根目录'} 下新增分类</div>
          <div className="mt-2 flex gap-2">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="分类名" className="flex-1 rounded-xl px-3 py-2 bg-gray-100 focus:outline-none" />
            <button onClick={add} className="btn bg-brand-red text-white"><PlusCircle size={16} /></button>
          </div>
          <div className="mt-2">
            <div className="text-xs text-gray-500 mb-1">权重（0-100）</div>
            <Slider value={newWeight} onChange={setNewWeight} min={0} max={100} />
            <div className="mt-1 text-xs text-gray-500">当前权重 {newWeight}</div>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {current.length === 0 ? (
          <div className="text-xs text-gray-500">此层级暂无分类</div>
        ) : current.map((item) => (
          <div key={item.id} className="rounded-2xl bg-white/90 border border-gray-200 shadow-sm p-3 flex items-center justify-between">
            <div className="text-sm font-semibold flex items-center gap-2">
              <span>{item.label}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">权重 {getWeight(item.id)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPath([...path, item.label])} className="btn bg-gray-100 text-gray-700"><ArrowRight size={16} /></button>
              <button onClick={() => { setRenameFor({ id: item.id, path: item.name }); setRenameValue(''); setRenameWeight(getWeight(item.id)) }} className="btn bg-gray-100 text-gray-700"><Pencil size={16} /></button>
              <button onClick={() => openWeight(item.id, item.label)} className="btn bg-gray-100 text-gray-700"><Star size={16} /></button>
              <button onClick={() => remove(item.id)} className="btn bg-gray-100 text-gray-700 px-3"><Trash size={16} /></button>
            </div>
          </div>
        ))}
      </div>
      
      {renameFor ? (
        <div className="fixed bottom-40 left-0 right-0 px-4">
          <div className="card p-3">
            <div className="text-sm">编辑 {renameFor.path}</div>
            <div className="mt-2 flex gap-2">
              <input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} placeholder="新名称" className="flex-1 rounded-xl px-3 py-2 bg-gray-100 focus:outline-none" />
            </div>
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-1">权重（0-100）</div>
              <Slider value={renameWeight} onChange={setRenameWeight} min={0} max={100} />
              <div className="mt-1 text-xs text-gray-500">当前权重 {renameWeight}</div>
            </div>
            <div className="mt-2 flex gap-2">
              <button onClick={rename} className="btn bg-brand-red text-white"><Pencil size={16} /></button>
              <button onClick={() => { setRenameFor(null); setRenameValue('') }} className="btn bg-gray-100 text-gray-700">取消</button>
            </div>
          </div>
        </div>
      ) : null}
      {weightFor ? (
        <div className="fixed bottom-20 left-0 right-0 px-4">
          <div className="card p-3">
            <div className="text-sm">设置 {weightFor.label} 权重</div>
            <div className="mt-2">
              <Slider value={weightValue} onChange={setWeightValue} min={0} max={100} />
              <div className="mt-1 text-xs text-gray-500">当前权重 {weightValue}</div>
            </div>
            <div className="mt-2 flex gap-2">
              <button onClick={saveWeight} className="btn bg-brand-red text-white">保存</button>
              <button onClick={() => setWeightFor(null)} className="btn bg-gray-100 text-gray-700">取消</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
function indent(depth: number) { return { marginLeft: depth ? depth * 12 : 0 } }
