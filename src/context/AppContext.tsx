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
  authPromptOpen: boolean
  dismissAuthPrompt: () => void
  triggerAuthPrompt: () => void
}

const C = createContext<Ctx | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [initialized, setInitialized] = useState(false)
  const [dishes, setDishes] = useState<Dish[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [authPromptOpen, setAuthPromptOpen] = useState(false)

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

  useEffect(() => {
    if (!initialized) return
    const dismissed = sessionStorage.getItem('auth_prompt_dismissed') === '1'
    if (!user && !dismissed) setAuthPromptOpen(true)
  }, [initialized, user])


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
      try { localStorage.setItem('user_id', user.id) } catch {}
      refreshCategories()
      refreshDishes()
    } else {
      setDishes([])
      try { localStorage.removeItem('user_id') } catch {}
    }
  }, [user])

  const dismissAuthPrompt = () => {
    setAuthPromptOpen(false)
    try { sessionStorage.setItem('auth_prompt_dismissed', '1') } catch {}
  }

  const triggerAuthPrompt = () => setAuthPromptOpen(true)

  const value = useMemo(
    () => ({ user, initialized, dishes, categories, refreshDishes, refreshCategories, authPromptOpen, dismissAuthPrompt, triggerAuthPrompt }),
    [user, initialized, dishes, categories, authPromptOpen]
  )

  return <C.Provider value={value}>{children}</C.Provider>
}

export function useApp() {
  const v = useContext(C)
  if (!v) throw new Error('AppContext')
  return v
}
