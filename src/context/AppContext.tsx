import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Category, Dish } from '../types'

type Ctx = {
  user: { id: string } | null
  initialized: boolean
  dishes: Dish[]
  categories: Category[]
  refreshDishes: () => Promise<void>
  refreshCategories: () => Promise<void>
}

const C = createContext<Ctx | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [initialized, setInitialized] = useState(false)
  const [dishes, setDishes] = useState<Dish[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ? { id: data.session.user.id } : null)
      setInitialized(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { id: session.user.id } : null)
    })
    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])


  const refreshDishes = async () => {
    if (!user) return
    const { data } = await supabase
      .from('dishes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setDishes((data as Dish[]) || [])
  }

  const refreshCategories = async () => {
    if (!user) { setCategories([]); return }
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name')
    setCategories((data as Category[]) || [])
  }

  useEffect(() => {
    if (user) {
      refreshCategories()
      refreshDishes()
    } else {
      setDishes([])
    }
  }, [user])

  const value = useMemo(
    () => ({ user, initialized, dishes, categories, refreshDishes, refreshCategories }),
    [user, initialized, dishes, categories]
  )

  return <C.Provider value={value}>{children}</C.Provider>
}

export function useApp() {
  const v = useContext(C)
  if (!v) throw new Error('AppContext')
  return v
}
