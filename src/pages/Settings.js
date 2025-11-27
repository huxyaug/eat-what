import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import Add from './Add';
import Categories from './Categories';
import menu from '../data/defaultMenu.json';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
export default function Settings() {
    const [theme, setTheme] = useState('classic');
    const [tab, setTab] = useState('general');
    const [aiEndpoint, setAiEndpoint] = useState('');
    const [aiModel, setAiModel] = useState('');
    const [aiKeys, setAiKeys] = useState('');
    const { user, categories, dishes, refreshCategories, refreshDishes } = useApp();
    const [autoImportOn, setAutoImportOn] = useState(false);
    useEffect(() => {
        const root = document.body;
        root.dataset.theme = theme;
    }, [theme]);
    useEffect(() => {
        try {
            setAiEndpoint(localStorage.getItem('ai.endpoint') || import.meta.env.VITE_AI_ENDPOINT || '');
            setAiModel(localStorage.getItem('ai.model') || import.meta.env.VITE_AI_MODEL || '');
            setAiKeys(localStorage.getItem('ai.keys') || import.meta.env.VITE_AI_KEYS || '');
            setAutoImportOn((localStorage.getItem('auto.import.defaults') || 'off') === 'on');
        }
        catch { }
    }, []);
    useEffect(() => {
    }, []);
    const saveAI = () => {
        try {
            localStorage.setItem('ai.endpoint', aiEndpoint);
            localStorage.setItem('ai.model', aiModel);
            localStorage.setItem('ai.keys', aiKeys);
            alert('AI 配置已保存');
        }
        catch { }
    };
    const initMassMenu = async () => {
        if (!user) {
            alert('请先登录');
            return;
        }
        const flagKey = `mass.import.done:${user.id}`;
        try {
        }
        catch { }
        const { data: existDishes } = await supabase.from('dishes').select('id,name,category_id').eq('user_id', user.id);
        const names = new Set([...menu.categories, ...menu.dishes.map((d) => d.category)]);
        const exist = new Map(categories.map((c) => [c.name, c.id]));
        const missing = Array.from(names).filter((n) => !exist.has(n));
        if (missing.length) {
            const { data, error } = await supabase.from('categories').insert(missing.map((name) => ({ name, user_id: user.id }))).select('id,name');
            if (error) {
                alert(error.message);
                return;
            }
            if (data)
                for (const row of data)
                    exist.set(row.name, row.id);
        }
        const existingKeys = new Set((existDishes || []).map((x) => `${x.name}|${x.category_id || ''}`));
        const rowsAll = menu.dishes.map((d) => ({
            user_id: user.id,
            name: d.name,
            calories: Number(d.calories) || 0,
            weight: 2,
            image_url: d.image_url,
            category_id: exist.get(d.category) || null,
        }));
        const rows = rowsAll.filter((r) => !existingKeys.has(`${r.name}|${r.category_id || ''}`));
        if (rows.length === 0) {
            await refreshCategories();
            await refreshDishes();
            try { }
            catch { }
            ;
            alert('已初始化，无需重复导入');
            return;
        }
        const { error: err2 } = await supabase.from('dishes').insert(rows);
        if (err2) {
            alert(err2.message);
            return;
        }
        await refreshCategories();
        await refreshDishes();
        try { }
        catch { }
        alert('已初始化海量美食库');
    };
    const clearAllDishes = async () => {
        if (!user) {
            alert('请先登录');
            return;
        }
        const { data: all } = await supabase.from('dishes').select('id').eq('user_id', user.id);
        const ids = (all || []).map((x) => x.id);
        if (ids.length === 0) {
            await refreshDishes();
            alert('无可清空的菜品');
            return;
        }
        const { data: removed, error } = await supabase.from('dishes').delete().in('id', ids).select('id');
        if (error) {
            alert(error.message);
            return;
        }
        await refreshDishes();
        if (!removed || removed.length === 0) {
            alert('清空未生效，可能是权限或数据不匹配');
            return;
        }
        try {
            localStorage.removeItem('hidden.dishes');
        }
        catch { }
        alert('已清空当前菜品');
    };
    return (_jsxs("div", { className: "pb-20 px-4", children: [_jsx("div", { className: "pt-4 text-2xl font-bold text-brand-red", children: "\u8BBE\u7F6E" }), _jsxs("div", { className: "mt-4 flex gap-2", children: [_jsx("button", { onClick: () => setTab('general'), className: `btn ${tab === 'general' ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-700'}`, children: "\u901A\u7528" }), _jsx("button", { onClick: () => setTab('add'), className: `btn ${tab === 'add' ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-700'}`, children: "\u53D1\u5E03\u7F8E\u98DF" }), _jsx("button", { onClick: () => setTab('categories'), className: `btn ${tab === 'categories' ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-700'}`, children: "\u5206\u7C7B\u7BA1\u7406" })] }), tab === 'general' ? (_jsxs("div", { className: "mt-6", children: [_jsx("div", { className: "text-sm text-gray-500 mb-2", children: "\u76AE\u80A4/\u4E3B\u9898" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setTheme('classic'), className: `btn ${theme === 'classic' ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-700'}`, children: "\u7B80\u7EA6\u98CE" }), _jsx("button", { onClick: () => setTheme('cyber'), className: `btn ${theme === 'cyber' ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-700'}`, children: "\u8D5B\u535A\u670B\u514B\u98CE" }), _jsx("button", { onClick: () => setTheme('anime'), className: `btn ${theme === 'anime' ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-700'}`, children: "\u4E8C\u6B21\u5143\u7F8E\u98DF\u98CE" })] }), _jsxs("div", { className: "mt-6 card p-4", children: [_jsx("div", { className: "text-sm font-semibold mb-2", children: "\u6570\u636E\u7EDF\u8BA1" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "text-sm", children: ["\u5F53\u524D\u83DC\u54C1\u603B\u6570\uFF1A", _jsx("span", { className: "font-bold text-brand-red", children: dishes.length }), " / 1000"] }), _jsx("div", { className: `text-xs px-2 py-1 rounded-full ${dishes.length >= 1000 ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-700'}`, children: dishes.length >= 1000 ? '已达标' : '未达标' })] }), _jsx("div", { className: "mt-3", children: _jsx("button", { onClick: async () => { await refreshCategories(); await refreshDishes(); }, className: "btn w-full bg-gray-100 text-gray-700", children: "\u5237\u65B0\u7EDF\u8BA1" }) })] }), _jsxs("div", { className: "mt-6 card p-4", children: [_jsx("div", { className: "text-sm font-semibold mb-2", children: "\u6570\u636E\u521D\u59CB\u5316" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: clearAllDishes, className: "btn flex-1 bg-gray-100 text-gray-700", children: "\u6E05\u7A7A\u5F53\u524D\u83DC\u54C1" }), _jsx("button", { onClick: async () => { if (confirm('确认导入真实菜品库？这将为当前用户初始化菜品。')) {
                                            await initMassMenu();
                                        } }, className: "btn flex-1 bg-brand-red text-white", children: "\u5BFC\u5165\u771F\u5B9E\u83DC\u54C1\u5E93" })] })] }), _jsxs("div", { className: "mt-6 card p-4", children: [_jsx("div", { className: "text-sm font-semibold mb-2", children: "\u6570\u636E\u6E05\u7406" }), _jsx("div", { className: "flex gap-2", children: _jsx("button", { onClick: async () => {
                                        if (!user) {
                                            alert('请先登录');
                                            return;
                                        }
                                        const { data: all } = await supabase.from('dishes').select('id,name,category_id,created_at').eq('user_id', user.id);
                                        const groups = {};
                                        for (const d of (all || [])) {
                                            const key = `${d.name}|${d.category_id || ''}`;
                                            if (!groups[key])
                                                groups[key] = { keep: d.id, remove: [] };
                                            else
                                                groups[key].remove.push(d.id);
                                        }
                                        const toDelete = Object.values(groups).flatMap((g) => g.remove);
                                        if (toDelete.length === 0) {
                                            alert('无重复项，无需清理');
                                            return;
                                        }
                                        const { error } = await supabase.from('dishes').delete().in('id', toDelete);
                                        if (error) {
                                            alert(error.message);
                                            return;
                                        }
                                        await refreshDishes();
                                        alert(`已清理重复菜品 ${toDelete.length} 条`);
                                    }, className: "btn flex-1 bg-gray-100 text-gray-700", children: "\u6E05\u7406\u91CD\u590D\u83DC\u54C1" }) })] })] })) : null, tab === 'add' ? (_jsx("div", { className: "mt-6", children: _jsx(Add, {}) })) : null, tab === 'categories' ? (_jsx("div", { className: "mt-6", children: _jsx(Categories, {}) })) : null] }));
}
