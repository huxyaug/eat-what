import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function MacrosBar({ protein, fat, carbs }) {
    const total = protein + fat + carbs;
    const p = total ? Math.round((protein / total) * 100) : 0;
    const f = total ? Math.round((fat / total) * 100) : 0;
    const c = 100 - p - f;
    return (_jsxs("div", { className: "w-full", children: [_jsxs("div", { className: "h-3 rounded-full bg-gray-200 overflow-hidden", children: [_jsx("div", { className: "h-3 bg-blue-500", style: { width: `${c}%` } }), _jsx("div", { className: "h-3 bg-yellow-400", style: { width: `${f}%` } }), _jsx("div", { className: "h-3 bg-pink-500", style: { width: `${p}%` } })] }), _jsxs("div", { className: "mt-2 grid grid-cols-3 text-xs text-gray-600", children: [_jsxs("div", { children: ["\u86CB\u767D\u8D28 ", protein, "g"] }), _jsxs("div", { children: ["\u8102\u80AA ", fat, "g"] }), _jsxs("div", { children: ["\u78B3\u6C34 ", carbs, "g"] })] })] }));
}
