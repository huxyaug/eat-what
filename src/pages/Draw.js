import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { pickDish } from '../lib/lottery';
import { imageUrlForDishName } from '../lib/ai';
export default function Draw() {
    const { dishes, categories } = useApp();
    const nav = useNavigate();
    const [stage, setStage] = useState(0);
    const [slot1, setSlot1] = useState('');
    const [slot2, setSlot2] = useState('');
    const timerRef = useRef(null);
    const [showResult, setShowResult] = useState(false);
    const [finalDish, setFinalDish] = useState(null);
    const [finalTrail, setFinalTrail] = useState([]);
    const [history, setHistory] = useState([]);
    const total = useMemo(() => dishes.reduce((s, d) => s + Math.max(0, d.weight), 0), [dishes]);
    const catParts = (n) => String(n).split('/');
    const childrenOf = (path) => categories.filter((c) => {
        const p = catParts(c.name);
        return path.every((seg, i) => p[i] === seg) && p.length === path.length + 1;
    }).map((c) => ({ id: c.id, path: c.name, label: catParts(c.name)[path.length] }));
    const roots = Array.from(new Set(categories.map((c) => catParts(c.name)[0]))).sort();
    const rootItems = roots.map((r) => ({ id: categories.find((c) => c.name === r)?.id || r, path: r, label: r }));
    const [pieces, setPieces] = useState([]);
    const colors = ['#FF2442', '#34d399', '#60a5fa', '#f59e0b', '#a78bfa'];
    useEffect(() => {
        try {
            const raw = localStorage.getItem('drawHistory');
            if (raw)
                setHistory(JSON.parse(raw));
        }
        catch { }
    }, []);
    const clearTimer = () => { if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
    } };
    const spinThrough = (labels, setLabel, stopAfterMs, final, next) => {
        clearTimer();
        let i = 0;
        setLabel(labels[0] || '');
        timerRef.current = window.setInterval(() => { i = (i + 1) % (labels.length || 1); setLabel(labels[i]); }, 80);
        window.setTimeout(() => { clearTimer(); setLabel(final); next(); }, stopAfterMs);
    };
    const draw = () => {
        if (!dishes.length)
            return;
        const { dish, trail } = pickDish(categories, dishes);
        const pick1 = trail[0] || '';
        const pick2 = trail[1] || '';
        const lvl1Labels = rootItems.map((x) => x.label);
        const lvl2Labels = pick1 ? childrenOf([pick1]).map((x) => x.label) : [];
        setStage(1);
        spinThrough(lvl1Labels.length ? lvl1Labels : [''], setSlot1, 1000, pick1 || '', () => {
            setStage(2);
            spinThrough(lvl2Labels.length ? lvl2Labels : [''], setSlot2, 1000, pick2 || '', () => {
                setStage(3);
                window.setTimeout(() => {
                    setFinalDish(dish);
                    setFinalTrail(trail);
                    const arr = Array.from({ length: 24 }).map(() => ({ left: Math.floor(Math.random() * 100), color: colors[Math.floor(Math.random() * colors.length)], delay: Math.random() * 0.4 }));
                    setPieces(arr);
                    setShowResult(true);
                    try {
                        const item = { name: dish?.name || '', calories: dish?.calories || 0, time: Date.now() };
                        const next = [...history, item].slice(-10);
                        setHistory(next);
                        localStorage.setItem('drawHistory', JSON.stringify(next));
                    }
                    catch { }
                    setStage(0);
                }, 600);
            });
        });
    };
    return (_jsxs("div", { className: "pb-16 px-4", children: [_jsx("div", { className: "pt-4 text-2xl font-bold text-brand-red", children: "\u62BD\u7B7E" }), _jsx("div", { className: "mt-6", children: _jsxs("button", { onClick: draw, className: "btn w-full bg-brand-red text-white", children: [_jsx(Sparkles, { className: "mr-2" }), " \u4ECA\u5929\u5403\u5565"] }) }), _jsx("div", { className: "mt-10 flex justify-center", children: _jsxs("div", { className: "relative w-40 h-40", children: [_jsx("div", { className: `absolute inset-0 rounded-full bg-[conic-gradient(var(--tw-gradient-stops))] from-pink-500 via-red-500 to-yellow-400 animate-spin ${stage ? 'opacity-100' : 'opacity-60'} blur-[0.6px]` }), _jsx("div", { className: "absolute inset-2 rounded-full bg-white shadow-xl flex items-center justify-center", children: _jsx("div", { className: "text-sm font-semibold text-gray-700", children: stage === 0 ? '等待抽取' : stage === 1 ? `正在选大类 [${slot1}]` : stage === 2 ? `正在选细分 [${slot2}]` : '最终决定...' }) })] }) }), showResult && finalDish ? (_jsxs("div", { className: "fixed inset-0 z-50", children: [_jsx("div", { className: "absolute inset-0 bg-black/40 backdrop-blur-sm", onClick: () => setShowResult(false) }), _jsx("div", { className: "absolute inset-0 overflow-auto", children: _jsx("div", { className: "min-h-screen bg-white", children: _jsxs("div", { className: "mx-auto max-w-md", children: [_jsxs("div", { className: "px-5 pt-6", children: [_jsx("div", { className: "rounded-t-2xl bg-gradient-to-r from-pink-500 to-orange-400 p-4 text-white font-bold", children: "\u51B3\u5B9A\u5C31\u662F\u5B83\u4E86\uFF01" }), _jsxs("div", { className: "overflow-hidden rounded-b-2xl shadow-xl", children: [_jsx("div", { className: "h-[50vh] bg-gray-100", children: _jsx("img", { src: finalDish.image_url || imageUrlForDishName(finalDish.name), alt: finalDish.name, className: "w-full h-full object-cover", onError: (e) => { e.currentTarget.src = imageUrlForDishName(finalDish.name); } }) }), _jsxs("div", { className: "p-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-xl font-bold text-gray-900", children: finalDish.name }), _jsx("div", { className: "text-xs px-2 py-1 rounded-full bg-pink-50 text-pink-600", children: finalTrail.join(' > ') })] }), _jsxs("div", { className: "mt-2 text-sm text-gray-600", children: ["\u70ED\u91CF ", finalDish.calories, "kcal \u00B7 \u559C\u7231\u5EA6 ", finalDish.weight] }), _jsxs("div", { className: "mt-4", children: [_jsx("div", { className: "text-sm font-semibold mb-2", children: "\u8425\u517B\u6210\u5206" }), _jsx("div", { className: "bg-gray-100 rounded-xl p-3", children: (() => {
                                                                            const carbs = Math.round((finalDish.calories * 0.5) / 4);
                                                                            const protein = Math.round((finalDish.calories * 0.25) / 4);
                                                                            const fat = Math.round((finalDish.calories * 0.25) / 9);
                                                                            const total = carbs + protein + fat;
                                                                            const cp = total ? Math.round((carbs / total) * 100) : 0;
                                                                            const pp = total ? Math.round((protein / total) * 100) : 0;
                                                                            const fp = 100 - cp - pp;
                                                                            return (_jsxs("div", { children: [_jsxs("div", { className: "h-3 rounded-full bg-gray-200 overflow-hidden", children: [_jsx("div", { className: "h-3 bg-blue-500", style: { width: `${cp}%` } }), _jsx("div", { className: "h-3 bg-yellow-400", style: { width: `${fp}%` } }), _jsx("div", { className: "h-3 bg-pink-500", style: { width: `${pp}%` } })] }), _jsxs("div", { className: "mt-2 grid grid-cols-3 text-xs text-gray-600", children: [_jsxs("div", { children: ["\u78B3\u6C34 ", carbs, "g (", cp, "%)"] }), _jsxs("div", { children: ["\u8102\u80AA ", fat, "g (", fp, "%)"] }), _jsxs("div", { children: ["\u86CB\u767D\u8D28 ", protein, "g (", pp, "%)"] })] })] }));
                                                                        })() })] }), _jsx("div", { className: "mt-4 flex gap-2", children: _jsx("button", { onClick: () => setShowResult(false), className: "btn flex-1 bg-brand-red text-white", children: "\u5173\u95ED" }) })] })] })] }), _jsx("div", { className: "absolute inset-0 pointer-events-none", children: pieces.map((p, i) => (_jsx("span", { className: "confetti-piece", style: { left: `${p.left}%`, backgroundColor: p.color, animationDelay: `${p.delay}s` } }, i))) })] }) }) })] })) : null, _jsxs("div", { className: "mt-8", children: [_jsx("div", { className: "text-sm text-gray-500 mb-2", children: "\u6700\u8FD1\u62BD\u7B7E" }), _jsx("div", { className: "space-y-2", children: history.slice().reverse().map((h, i) => (_jsxs("div", { className: "card p-3 flex items-center justify-between", children: [_jsx("div", { className: "text-sm font-semibold", children: h.name }), _jsx("div", { className: "text-xs text-gray-500", children: new Date(h.time).toLocaleString() })] }, i))) })] })] }));
}
