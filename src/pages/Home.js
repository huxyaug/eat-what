import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import DishCard from '../components/DishCard';
import { supabase } from '../lib/supabase';
import { Search, Inbox, Wand2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import DishDetail from '../components/DishDetail';
import { imageUrlForDishName } from '../lib/ai';
export default function Home() {
    const { user, dishes, categories, refreshDishes, refreshCategories } = useApp();
    const [importing, setImporting] = useState(false);
    const [root, setRoot] = useState('');
    const [lvl2, setLvl2] = useState('');
    const [lvl3, setLvl3] = useState('');
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [toastOpen, setToastOpen] = useState(false);
    const [nlu, setNlu] = useState('');
    const [detail, setDetail] = useState(null);
    const nav = useNavigate();
    useEffect(() => {
        ;
        (async () => {
            await refreshCategories();
            await refreshDishes();
            setLoading(false);
        })();
    }, []);
    useEffect(() => {
        if (detail && !dishes.find((x) => x.id === detail.id)) {
            setDetail(null);
        }
    }, [dishes, detail?.id]);
    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const hiddenSet = useMemo(() => {
        try {
            return new Set(JSON.parse(localStorage.getItem('hidden.dishes') || '[]'));
        }
        catch {
            return new Set();
        }
    }, [dishes]);
    const empty = useMemo(() => dishes.length === 0, [dishes]);
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
    ];
    const ensureCategories = async () => {
        const names = Array.from(new Set(presets.map((p) => p.category)));
        const existing = new Map(categories.map((c) => [c.name, c.id]));
        const missing = names.filter((n) => !existing.has(n));
        if (missing.length) {
            if (!user)
                return existing;
            const { data } = await supabase.from('categories').insert(missing.map((name) => ({ name, user_id: user.id }))).select('*');
            if (data) {
                for (const c of data)
                    existing.set(c.name, c.id);
            }
        }
        return existing;
    };
    const importDefaults = async () => {
        if (!user)
            return;
        setImporting(true);
        const map = await ensureCategories();
        const rows = presets.map((p) => ({
            user_id: user.id,
            name: p.name,
            calories: p.calories,
            weight: p.weight,
            image_url: imageUrlForDishName(p.name),
            category_id: map.get(p.category) || null,
        }));
        await supabase.from('dishes').insert(rows);
        await refreshCategories();
        await refreshDishes();
        setToastOpen(true);
        setTimeout(() => setToastOpen(false), 1500);
        setImporting(false);
    };
    const parts = (n) => String(n).split('/');
    const roots = Array.from(new Set(categories.map((c) => parts(c.name)[0])));
    const lvl2Opts = root ? Array.from(new Set(categories.filter((c) => parts(c.name)[0] === root && parts(c.name).length > 1).map((c) => parts(c.name)[1]))) : [];
    const lvl3Opts = root && lvl2 ? Array.from(new Set(categories.filter((c) => parts(c.name)[0] === root && parts(c.name)[1] === lvl2 && parts(c.name).length > 2).map((c) => parts(c.name)[2]))) : [];
    const activeIds = new Set(categories
        .filter((c) => {
        const p = parts(c.name);
        if (!root)
            return true;
        if (p[0] !== root)
            return false;
        if (lvl2 && p[1] !== lvl2)
            return false;
        if (lvl3 && p[2] !== lvl3)
            return false;
        return true;
    })
        .map((c) => c.id));
    const filtered = useMemo(() => {
        const source = dishes.filter((d) => !hiddenSet.has(d.id));
        const base = root || lvl2 || lvl3 ? source.filter((d) => activeIds.has(d.category_id || '')) : source;
        let list = base;
        if (keyword.trim()) {
            const k = keyword.trim().toLowerCase();
            list = list.filter((d) => d.name.toLowerCase().includes(k));
        }
        if (nlu.trim()) {
            const s = nlu.trim();
            const spicy = /辣|川|火锅/.test(s);
            const light = /清淡|蔬菜|沙拉|素/.test(s);
            const fast = /快餐|汉堡|麦当劳|肯德基/.test(s);
            list = list.filter((d) => {
                const name = d.name;
                if (spicy)
                    return /火锅|麻辣|川|冒菜/.test(name);
                if (light)
                    return /清炒|蔬|沙拉|素/.test(name);
                if (fast)
                    return /麦当劳|肯德基|汉堡|披萨/.test(name);
                return true;
            });
        }
        return list;
    }, [root, lvl2, lvl3, dishes, keyword, nlu, categories, hiddenSet]);
    const pageSize = 30;
    const [visibleCount, setVisibleCount] = useState(pageSize);
    const tickingRef = useRef(false);
    useEffect(() => { setVisibleCount(pageSize); }, [root, lvl2, lvl3, keyword, nlu]);
    useEffect(() => {
        const onScroll = () => {
            if (tickingRef.current)
                return;
            tickingRef.current = true;
            requestAnimationFrame(() => {
                tickingRef.current = false;
                const nearBottom = (window.innerHeight + window.scrollY) > (document.body.offsetHeight - 400);
                if (nearBottom)
                    setVisibleCount((c) => Math.min(c + pageSize, filtered.length));
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [filtered.length]);
    const logout = async () => {
        await supabase.auth.signOut();
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "pb-28 mx-auto max-w-md", children: [_jsx("div", { className: "px-4 pt-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-2xl font-bold text-brand-red", children: "\u4ECA\u5929\u5403\u4EC0\u4E48" }), _jsx("button", { onClick: logout, className: "btn bg-gray-100 text-gray-700", children: "\u9000\u51FA" })] }) }), _jsx("div", { className: "px-4 mt-3", children: _jsxs("div", { className: "input-wrap input-pink", children: [_jsx(Search, { size: 18, className: "text-gray-400" }), _jsx("input", { value: keyword, onChange: (e) => setKeyword(e.target.value), placeholder: "\u641C\u7D22\u83DC\u540D", className: "flex-1 bg-transparent focus:outline-none" })] }) }), _jsx("div", { className: "px-4 mt-3", children: _jsxs("button", { onClick: () => nav('/ai'), className: "w-full input-wrap input-pink text-left", children: [_jsx(Wand2, { size: 18, className: "text-gray-400" }), _jsx("span", { className: "text-gray-500", children: "\u6211\u60F3\u5403\u70B9\u8FA3\u7684\uFF08\u53BB AI \u5BF9\u8BDD\uFF09" })] }) }), loading ? (_jsxs("div", { className: "px-4 mt-4 grid grid-cols-2 gap-4", children: [_jsx("div", { className: "skeleton h-40" }), _jsx("div", { className: "skeleton h-60" }), _jsx("div", { className: "skeleton h-52" }), _jsx("div", { className: "skeleton h-44" })] })) : empty ? (_jsxs("div", { className: "px-6 mt-8 text-center", children: [_jsx("div", { className: "mx-auto w-40 h-40 rounded-full bg-white shadow-sm flex items-center justify-center", children: _jsx(Inbox, { size: 48, className: "text-gray-400" }) }), _jsx("div", { className: "mt-4 text-gray-600", children: "\u8FD8\u6CA1\u6709\u83DC\u54C1\uFF0C\u8BD5\u8BD5\u5BFC\u5165\u70ED\u95E8\u7F8E\u98DF" }), _jsx("button", { disabled: importing, onClick: importDefaults, className: "btn mt-4 w-full max-w-xs bg-brand-red text-white", children: "\u4E00\u952E\u5BFC\u5165\u70ED\u95E8\u7F8E\u98DF" })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "relative", children: [_jsxs("div", { className: "chips scrollbar-hide pr-12", children: [_jsx("button", { onClick: () => { setRoot(''); setLvl2(''); setLvl3(''); }, className: `chip ${!root ? 'chip-active' : ''}`, children: "\u5168\u90E8" }), roots.map((r) => (_jsx("button", { onClick: () => { setRoot(r); setLvl2(''); setLvl3(''); }, className: `chip ${root === r ? 'chip-active' : ''}`, children: r }, r)))] }), _jsx("div", { className: "pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-r from-transparent to-[#F8F8F8]" })] }), root ? (_jsxs("div", { className: "relative", children: [_jsx("div", { className: "chips scrollbar-hide pr-12", children: lvl2Opts.map((o) => (_jsx("button", { onClick: () => { setLvl2(o); setLvl3(''); }, className: `chip ${lvl2 === o ? 'chip-active' : ''}`, children: o }, o))) }), _jsx("div", { className: "pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-r from-transparent to-[#F8F8F8]" })] })) : null, lvl2 ? (_jsxs("div", { className: "relative", children: [_jsx("div", { className: "chips scrollbar-hide pr-12", children: lvl3Opts.map((o) => (_jsx("button", { onClick: () => setLvl3(o), className: `chip ${lvl3 === o ? 'chip-active' : ''}`, children: o }, o))) }), _jsx("div", { className: "pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-r from-transparent to-[#F8F8F8]" })] })) : null, _jsx("div", { className: "grid grid-cols-2 gap-3", children: filtered.slice(0, visibleCount).map((d) => (_jsx("div", { onClick: () => setDetail(d), children: _jsx(DishCard, { dish: d, category: categoryMap.get(d.category_id || '') }) }, d.id))) }), visibleCount < filtered.length ? (_jsxs("div", { className: "mt-4 text-center text-xs text-gray-500", children: ["\u4E0B\u62C9\u52A0\u8F7D\u66F4\u591A\uFF08", visibleCount, "/", filtered.length, "\uFF09"] })) : null] }))] }), _jsx("button", { onClick: () => nav('/add'), className: "fixed bottom-24 right-6 w-16 h-16 rounded-full bg-brand-red text-white shadow-xl flex items-center justify-center active:scale-95", children: _jsx(Plus, { size: 28 }) }), _jsx(Toast, { open: toastOpen, message: "\u5BFC\u5165\u6210\u529F" }), _jsx(Modal, { open: !!detail, onClose: () => setDetail(null), children: detail ? _jsx(DishDetail, { dish: detail, category: categoryMap.get(detail.category_id || '') }) : null })] }));
}
