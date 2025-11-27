import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { Trash, PlusCircle, Pencil, Star, ChevronRight, ArrowRight } from 'lucide-react';
import Slider from '../components/Slider';
export default function Categories() {
    const { categories, refreshCategories, user } = useApp();
    const [error, setError] = useState(null);
    const [renameFor, setRenameFor] = useState(null);
    const [renameValue, setRenameValue] = useState('');
    const [renameWeight, setRenameWeight] = useState(50);
    const [weightFor, setWeightFor] = useState(null);
    const [weightValue, setWeightValue] = useState(50);
    const [path, setPath] = useState([]);
    const [newName, setNewName] = useState('');
    const [newWeight, setNewWeight] = useState(50);
    useEffect(() => { refreshCategories(); }, []);
    useEffect(() => {
        ;
        (async () => {
            if (!user)
                return;
            try {
                await supabase.from('categories').update({ weight: 50 }).is('weight', null).eq('user_id', user.id);
                await refreshCategories();
            }
            catch { }
        })();
    }, [user?.id]);
    const add = async () => {
        setError(null);
        const nm = newName.trim();
        if (!nm)
            return;
        if (!user) {
            setError('未登录');
            return;
        }
        const parent = path.join('/');
        const fullname = parent ? `${parent}/${nm}` : nm;
        const { error } = await supabase.from('categories').insert({ name: fullname, user_id: user.id, weight: newWeight });
        if (error)
            setError(error.message);
        setNewName('');
        setNewWeight(50);
        await refreshCategories();
    };
    const parts = (n) => String(n).split('/');
    const childrenOf = (pArr) => categories.filter((c) => {
        const p = parts(c.name);
        return pArr.every((seg, i) => p[i] === seg) && p.length === pArr.length + 1;
    }).map((c) => ({ id: c.id, name: c.name, label: parts(c.name)[pArr.length] }));
    const current = childrenOf(path);
    const remove = async (id) => {
        await supabase.from('categories').delete().eq('id', id);
        await refreshCategories();
    };
    const rename = async () => {
        if (!renameFor || !renameValue.trim())
            return;
        const { id, path } = renameFor;
        const parts = path.split('/');
        parts[parts.length - 1] = renameValue.trim();
        const fullname = parts.join('/').replace(/^\/+/, '');
        const { error } = await supabase.from('categories').update({ name: fullname, weight: renameWeight }).eq('id', id);
        if (!error) {
            setRenameFor(null);
            setRenameValue('');
            await refreshCategories();
        }
    };
    const getWeights = () => {
        try {
            return JSON.parse(localStorage.getItem('catWeights') || '{}');
        }
        catch {
            return {};
        }
    };
    const setWeights = (obj) => { try {
        localStorage.setItem('catWeights', JSON.stringify(obj));
    }
    catch { } };
    const getWeight = (id) => getWeights()[id] ?? 50;
    const openWeight = (id, label) => { setWeightFor({ id, label }); setWeightValue(getWeight(id)); };
    const saveWeight = async () => {
        if (!weightFor)
            return;
        const map = getWeights();
        map[weightFor.id] = weightValue;
        setWeights(map);
        try {
            await supabase.from('categories').update({ weight: weightValue }).eq('id', weightFor.id);
        }
        catch { }
        setWeightFor(null);
    };
    return (_jsxs("div", { className: "pb-20 px-4", children: [_jsx("div", { className: "pt-4 text-2xl font-bold text-brand-red", children: "\u5206\u7C7B\u7BA1\u7406" }), error ? _jsx("div", { className: "mt-2 text-xs text-red-500", children: error }) : null, _jsxs("div", { className: "mt-4 flex items-center gap-2 text-sm", children: [_jsx("button", { onClick: () => setPath([]), className: "btn bg-gray-100 text-gray-700", children: "\u5168\u90E8" }), path.map((seg, idx) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(ChevronRight, { size: 14, className: "text-gray-400" }), _jsx("button", { onClick: () => setPath(path.slice(0, idx + 1)), className: "btn bg-gray-100 text-gray-700", children: seg })] }, idx)))] }), _jsx("div", { className: "mt-4", children: _jsxs("div", { className: "card p-3", children: [_jsxs("div", { className: "text-sm", children: ["\u5728 ", path.length ? path.join(' / ') : '根目录', " \u4E0B\u65B0\u589E\u5206\u7C7B"] }), _jsxs("div", { className: "mt-2 flex gap-2", children: [_jsx("input", { value: newName, onChange: (e) => setNewName(e.target.value), placeholder: "\u5206\u7C7B\u540D", className: "flex-1 rounded-xl px-3 py-2 bg-gray-100 focus:outline-none" }), _jsx("button", { onClick: add, className: "btn bg-brand-red text-white", children: _jsx(PlusCircle, { size: 16 }) })] }), _jsxs("div", { className: "mt-2", children: [_jsx("div", { className: "text-xs text-gray-500 mb-1", children: "\u6743\u91CD\uFF080-100\uFF09" }), _jsx(Slider, { value: newWeight, onChange: setNewWeight, min: 0, max: 100 }), _jsxs("div", { className: "mt-1 text-xs text-gray-500", children: ["\u5F53\u524D\u6743\u91CD ", newWeight] })] })] }) }), _jsx("div", { className: "mt-4 space-y-2", children: current.length === 0 ? (_jsx("div", { className: "text-xs text-gray-500", children: "\u6B64\u5C42\u7EA7\u6682\u65E0\u5206\u7C7B" })) : current.map((item) => (_jsxs("div", { className: "rounded-2xl bg-white/90 border border-gray-200 shadow-sm p-3 flex items-center justify-between", children: [_jsxs("div", { className: "text-sm font-semibold flex items-center gap-2", children: [_jsx("span", { children: item.label }), _jsxs("span", { className: "text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600", children: ["\u6743\u91CD ", getWeight(item.id)] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => setPath([...path, item.label]), className: "btn bg-gray-100 text-gray-700", children: _jsx(ArrowRight, { size: 16 }) }), _jsx("button", { onClick: () => { setRenameFor({ id: item.id, path: item.name }); setRenameValue(''); setRenameWeight(getWeight(item.id)); }, className: "btn bg-gray-100 text-gray-700", children: _jsx(Pencil, { size: 16 }) }), _jsx("button", { onClick: () => openWeight(item.id, item.label), className: "btn bg-gray-100 text-gray-700", children: _jsx(Star, { size: 16 }) }), _jsx("button", { onClick: () => remove(item.id), className: "btn bg-gray-100 text-gray-700 px-3", children: _jsx(Trash, { size: 16 }) })] })] }, item.id))) }), renameFor ? (_jsx("div", { className: "fixed bottom-40 left-0 right-0 px-4", children: _jsxs("div", { className: "card p-3", children: [_jsxs("div", { className: "text-sm", children: ["\u7F16\u8F91 ", renameFor.path] }), _jsx("div", { className: "mt-2 flex gap-2", children: _jsx("input", { value: renameValue, onChange: (e) => setRenameValue(e.target.value), placeholder: "\u65B0\u540D\u79F0", className: "flex-1 rounded-xl px-3 py-2 bg-gray-100 focus:outline-none" }) }), _jsxs("div", { className: "mt-2", children: [_jsx("div", { className: "text-xs text-gray-500 mb-1", children: "\u6743\u91CD\uFF080-100\uFF09" }), _jsx(Slider, { value: renameWeight, onChange: setRenameWeight, min: 0, max: 100 }), _jsxs("div", { className: "mt-1 text-xs text-gray-500", children: ["\u5F53\u524D\u6743\u91CD ", renameWeight] })] }), _jsxs("div", { className: "mt-2 flex gap-2", children: [_jsx("button", { onClick: rename, className: "btn bg-brand-red text-white", children: _jsx(Pencil, { size: 16 }) }), _jsx("button", { onClick: () => { setRenameFor(null); setRenameValue(''); }, className: "btn bg-gray-100 text-gray-700", children: "\u53D6\u6D88" })] })] }) })) : null, weightFor ? (_jsx("div", { className: "fixed bottom-20 left-0 right-0 px-4", children: _jsxs("div", { className: "card p-3", children: [_jsxs("div", { className: "text-sm", children: ["\u8BBE\u7F6E ", weightFor.label, " \u6743\u91CD"] }), _jsxs("div", { className: "mt-2", children: [_jsx(Slider, { value: weightValue, onChange: setWeightValue, min: 0, max: 100 }), _jsxs("div", { className: "mt-1 text-xs text-gray-500", children: ["\u5F53\u524D\u6743\u91CD ", weightValue] })] }), _jsxs("div", { className: "mt-2 flex gap-2", children: [_jsx("button", { onClick: saveWeight, className: "btn bg-brand-red text-white", children: "\u4FDD\u5B58" }), _jsx("button", { onClick: () => setWeightFor(null), className: "btn bg-gray-100 text-gray-700", children: "\u53D6\u6D88" })] })] }) })) : null] }));
}
function indent(depth) { return { marginLeft: depth ? depth * 12 : 0 }; }
