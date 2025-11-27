import type { Dish, Category } from '../types'
import { Flame, Heart, Trash } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'
import { generateDishCaption } from '../lib/ai'
import MacrosBar from './MacrosBar'

function estimateMacros(calories: number) {
  const carbs = Math.round((calories * 0.5) / 4)
  const protein = Math.round((calories * 0.25) / 4)
  const fat = Math.round((calories * 0.25) / 9)
  return { carbs, protein, fat }
}

function caption(d: Dish) {
  if (d.calories > 800) return '高能量补给，记得均衡膳食与适度运动'
  if (d.calories > 500) return '营养均衡的一餐，适合作为正餐选择'
  return '清爽低卡，适合轻食或晚间不重负担'
}

export default function DishDetail({ dish, category }: { dish: Dish; category?: Category }) {
  const { refreshDishes, user } = useApp()
  const m = estimateMacros(dish.calories)
  const [desc, setDesc] = useState('')
  useEffect(() => {
    let mounted = true
    const cacheKey = `cap:${dish.id}`
    const cached = localStorage.getItem(cacheKey)
    if (cached) setDesc(cached)
    else {
      generateDishCaption(dish.name, dish.calories).then((t) => {
        if (!mounted) return
        setDesc(t)
        try { localStorage.setItem(cacheKey, t) } catch {}
      })
    }
    return () => { mounted = false }
  }, [dish.id, dish.name, dish.calories])
  return (
    <div>
      <div className="rounded-xl overflow-hidden">
        {dish.image_url ? (
          <img src={dish.image_url} alt={dish.name} className="w-full h-48 object-cover" />
        ) : null}
        <button onClick={async () => { try { if (!user) return; const { data, error } = await supabase.from('dishes').delete().eq('id', dish.id).eq('user_id', user.id).select('id'); if (error) { alert(error.message); return } let removedCount = (data || []).length; if (!removedCount) { let q = supabase.from('dishes').select('id').eq('user_id', user.id).eq('name', dish.name); if (dish.category_id) q = q.eq('category_id', dish.category_id); else q = q.is('category_id', null); const { data: ids } = await q; const list = (ids || []).map((x: any) => x.id); if (list.length) { const { data: d2, error: e2 } = await supabase.from('dishes').delete().in('id', list).select('id'); if (e2) { alert(e2.message); return } removedCount = (d2 || []).length } } await refreshDishes(); try { const arr = JSON.parse(localStorage.getItem('hidden.dishes') || '[]'); arr.push(dish.id); localStorage.setItem('hidden.dishes', JSON.stringify(Array.from(new Set(arr)))) } catch {} alert('已删除该菜品') } catch {} }} className="absolute top-2 right-2 p-2 rounded-full bg-white/80 shadow-sm active:scale-95">
          <Trash size={16} className="text-gray-300 hover:text-red-500" />
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-lg font-bold">{dish.name}</div>
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1 text-brand-red"><Heart size={16} /> {dish.weight}分</span>
          <span className="flex items-center gap-1 text-orange-500"><Flame size={16} /> {dish.calories}kcal</span>
        </div>
      </div>
      {category ? <div className="mt-1 text-xs text-gray-500">{category.name}</div> : null}
      <div className="mt-4">
        <div className="text-sm font-semibold mb-2">营养成分</div>
        <div className="bg-gray-100 rounded-xl p-3">
          <MacrosBar protein={m.protein} fat={m.fat} carbs={m.carbs} />
        </div>
      </div>
      <div className="mt-4">
        <div className="text-sm font-semibold mb-2">美食推荐</div>
        <div className="text-sm text-gray-600">{desc || caption(dish)}</div>
      </div>
    </div>
  )
}
