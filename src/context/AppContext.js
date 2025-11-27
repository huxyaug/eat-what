import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
const C = createContext(null);
export function AppProvider({ children }) {
    const [user, setUser] = useState(null);
    const [initialized, setInitialized] = useState(false);
    const [dishes, setDishes] = useState([]);
    const [categories, setCategories] = useState([]);
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setUser(data.session?.user ? { id: data.session.user.id } : null);
            setInitialized(true);
        });
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ? { id: session.user.id } : null);
        });
        return () => {
            sub.subscription.unsubscribe();
        };
    }, []);
    const refreshDishes = async () => {
        if (!user)
            return;
        const { data } = await supabase
            .from('dishes')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        setDishes(data || []);
    };
    const refreshCategories = async () => {
        if (!user) {
            setCategories([]);
            return;
        }
        const { data } = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', user.id)
            .order('name');
        setCategories(data || []);
    };
    useEffect(() => {
        if (user) {
            try {
                localStorage.setItem('user_id', user.id);
            }
            catch { }
            refreshCategories();
            refreshDishes();
        }
        else {
            setDishes([]);
            try {
                localStorage.removeItem('user_id');
            }
            catch { }
        }
    }, [user]);
    const value = useMemo(() => ({ user, initialized, dishes, categories, refreshDishes, refreshCategories }), [user, initialized, dishes, categories]);
    return _jsx(C.Provider, { value: value, children: children });
}
export function useApp() {
    const v = useContext(C);
    if (!v)
        throw new Error('AppContext');
    return v;
}
