import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Flame, Heart, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { generateDishCaption } from '../lib/ai';
import MacrosBar from './MacrosBar';
function estimateMacros(calories) {
    const carbs = Math.round((calories * 0.5) / 4);
    const protein = Math.round((calories * 0.25) / 4);
    const fat = Math.round((calories * 0.25) / 9);
    return { carbs, protein, fat };
}
function caption(d) {
    if (d.calories > 800)
        return '高能量补给，记得均衡膳食与适度运动';
    if (d.calories > 500)
        return '营养均衡的一餐，适合作为正餐选择';
    return '清爽低卡，适合轻食或晚间不重负担';
}
export default function DishDetail({ dish, category }) {
    const { refreshDishes, user } = useApp();
    const m = estimateMacros(dish.calories);
    const [desc, setDesc] = useState('');
    useEffect(() => {
        let mounted = true;
        const cacheKey = `cap:${dish.id}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached)
            setDesc(cached);
        else {
            generateDishCaption(dish.name, dish.calories).then((t) => {
                if (!mounted)
                    return;
                setDesc(t);
                try {
                    localStorage.setItem(cacheKey, t);
                }
                catch { }
            });
        }
        return () => { mounted = false; };
    }, [dish.id, dish.name, dish.calories]);
    return (_jsxs("div", { children: [_jsxs("div", { className: "rounded-xl overflow-hidden", children: [dish.image_url ? (_jsx("img", { src: dish.image_url, alt: dish.name, className: "w-full h-48 object-cover" })) : null, _jsx("button", { onClick: async () => { try {
                            if (!user)
                                return;
                            const { data, error } = await supabase.from('dishes').delete().eq('id', dish.id).eq('user_id', user.id).select('id');
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
                            try {
                                const arr = JSON.parse(localStorage.getItem('hidden.dishes') || '[]');
                                arr.push(dish.id);
                                localStorage.setItem('hidden.dishes', JSON.stringify(Array.from(new Set(arr))));
                            }
                            catch { }
                            alert('已删除该菜品');
                        }
                        catch { } }, className: "absolute top-2 right-2 p-2 rounded-full bg-white/80 shadow-sm active:scale-95", children: _jsx(Trash, { size: 16, className: "text-gray-300 hover:text-red-500" }) })] }), _jsxs("div", { className: "mt-3 flex items-center justify-between", children: [_jsx("div", { className: "text-lg font-bold", children: dish.name }), _jsxs("div", { className: "flex items-center gap-3 text-sm", children: [_jsxs("span", { className: "flex items-center gap-1 text-brand-red", children: [_jsx(Heart, { size: 16 }), " ", dish.weight, "\u5206"] }), _jsxs("span", { className: "flex items-center gap-1 text-orange-500", children: [_jsx(Flame, { size: 16 }), " ", dish.calories, "kcal"] })] })] }), category ? _jsx("div", { className: "mt-1 text-xs text-gray-500", children: category.name }) : null, _jsxs("div", { className: "mt-4", children: [_jsx("div", { className: "text-sm font-semibold mb-2", children: "\u8425\u517B\u6210\u5206" }), _jsx("div", { className: "bg-gray-100 rounded-xl p-3", children: _jsx(MacrosBar, { protein: m.protein, fat: m.fat, carbs: m.carbs }) })] }), _jsxs("div", { className: "mt-4", children: [_jsx("div", { className: "text-sm font-semibold mb-2", children: "\u7F8E\u98DF\u63A8\u8350" }), _jsx("div", { className: "text-sm text-gray-600", children: desc || caption(dish) })] })] }));
}
