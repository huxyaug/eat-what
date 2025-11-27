import { jsx as _jsx } from "react/jsx-runtime";
import { Star } from 'lucide-react';
export default function Stars({ value, onChange }) {
    const full = Math.round(value);
    return (_jsx("div", { className: "flex items-center gap-1", children: Array.from({ length: 5 }).map((_, i) => {
            const active = i < full;
            return (_jsx("button", { type: "button", onClick: () => onChange?.(i + 1), className: "active:scale-95", children: _jsx(Star, { size: 16, className: active ? 'text-brand-red' : 'text-gray-300' }) }, i));
        }) }));
}
