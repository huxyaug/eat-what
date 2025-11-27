import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Heart, Trash } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { useState, useEffect, useRef, memo } from 'react';
import { generateDishCaption } from '../lib/ai';
import { imageUrlForDishName } from '../lib/ai';
function DishCard({ dish, category }) {
    const { refreshDishes, user } = useApp();
    const [flipped, setFlipped] = useState(false);
    const [desc, setDesc] = useState('');
    const [removed, setRemoved] = useState(false);
    const [visible, setVisible] = useState(false);
    const rootRef = useRef(null);
    const fallback = (n) => imageUrlForDishName(n);
    useEffect(() => {
        const key = `cap:${dish.id}`;
        const cached = localStorage.getItem(key);
        if (cached)
            setDesc(cached);
    }, [dish.id]);
    useEffect(() => {
        const el = rootRef.current;
        if (!el)
            return;
        const io = new IntersectionObserver((entries) => {
            for (const e of entries) {
                if (e.isIntersecting)
                    setVisible(true);
            }
        }, { rootMargin: '200px' });
        io.observe(el);
        return () => { io.disconnect(); };
    }, []);
    useEffect(() => {
        if (!visible || desc)
            return;
        const key = `cap:${dish.id}`;
        generateDishCaption(dish.name, dish.calories).then((t) => {
            setDesc(t);
            try {
                localStorage.setItem(key, t);
            }
            catch { }
        }).catch(() => { });
    }, [visible, desc, dish.id, dish.name, dish.calories]);
    const removeDish = async (e) => {
        e.stopPropagation();
        try {
            if (!user)
                return;
            const { data, error } = await supabase
                .from('dishes')
                .delete()
                .eq('id', dish.id)
                .eq('user_id', user.id)
                .select('id');
            if (error) {
                alert(error.message);
                return;
            }
            let removedCount = (data || []).length;
            if (!removedCount) {
                let q = supabase.from('dishes').select('id').eq('user_id', user.id).eq('name', dish.name);
                if (dish.category_id)
                    q = q.eq('category_id', dish.category_id);
                else
                    q = q.is('category_id', null);
                const { data: ids } = await q;
                const list = (ids || []).map((x) => x.id);
                if (list.length) {
                    const { data: d2, error: e2 } = await supabase.from('dishes').delete().in('id', list).select('id');
                    if (e2) {
                        alert(e2.message);
                        return;
                    }
                    removedCount = (d2 || []).length;
                }
            }
            await refreshDishes();
            setRemoved(true);
            try {
                const arr = JSON.parse(localStorage.getItem('hidden.dishes') || '[]');
                arr.push(dish.id);
                localStorage.setItem('hidden.dishes', JSON.stringify(Array.from(new Set(arr))));
            }
            catch { }
            alert('已删除该菜品');
        }
        catch { }
    };
    if (removed)
        return null;
    return (_jsxs("div", { ref: rootRef, className: `card pop-in group`, children: [_jsxs("div", { className: "relative bg-gray-100", children: [_jsx("img", { src: dish.image_url || fallback(dish.name), alt: dish.name, className: "h-48 w-full object-cover rounded-t-xl", loading: "lazy", onError: (e) => { e.currentTarget.src = fallback(dish.name); } }), _jsx("button", { onClick: removeDish, className: "absolute top-2 right-2 p-1 rounded-full bg-white/80 shadow-sm opacity-0 group-hover:opacity-100 active:scale-95", children: _jsx(Trash, { size: 14, className: "text-gray-300 hover:text-red-500" }) }), _jsx("div", { className: "absolute bottom-2 left-0 right-0 px-3 flex items-center justify-end", children: _jsxs("span", { className: "tag", children: ["\uD83D\uDD25 ", dish.calories, "kcal"] }) })] }), _jsxs("div", { className: "p-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-sm font-semibold text-gray-900", children: dish.name }), category ? (_jsx("span", { className: "text-xs px-2 py-0.5 rounded-full bg-red-50 text-brand-red", children: category.name })) : null] }), desc ? (_jsx("div", { className: "mt-1", children: _jsx("span", { className: "text-xs px-2 py-1 rounded-full bg-pink-50 text-pink-600", children: desc.length > 24 ? `${desc.slice(0, 24)}…` : desc }) })) : null, _jsxs("div", { className: "mt-2 flex items-center justify-between", children: [_jsxs("div", { className: "text-xs text-gray-600", children: ["\u559C\u7231\u5EA6 ", dish.weight] }), _jsxs("div", { className: "flex items-center gap-1 text-brand-red", children: [_jsx(Heart, { size: 16 }), _jsx("span", { className: "text-xs", children: dish.weight })] })] })] })] }));
}
export default memo(DishCard);
