import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Dice5, Settings as SettingsIcon, MessageSquare } from 'lucide-react';
export default function BottomNav() {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login';
    const isHome = location.pathname === '/';
    const isDraw = location.pathname === '/draw';
    const isAI = location.pathname === '/ai';
    if (isAuthPage)
        return null;
    return (_jsx("nav", { className: "blur-nav", children: _jsxs("div", { className: "mx-auto max-w-md grid grid-cols-4 text-center", children: [_jsxs(NavLink, { to: "/", className: ({ isActive }) => `py-3 flex items-center justify-center gap-1 ${isActive ? 'text-brand-red' : 'text-gray-500'} active:scale-95 transition-transform`, children: [_jsx(Home, { className: "mr-1", size: 22, strokeWidth: isHome ? 2.5 : 1.5 }), " \u9996\u9875"] }), _jsxs(NavLink, { to: "/draw", className: ({ isActive }) => `py-3 flex items-center justify-center gap-1 ${isActive ? 'text-brand-red' : 'text-gray-500'} active:scale-95 transition-transform`, children: [_jsx(Dice5, { className: "mr-1", size: 22, strokeWidth: isDraw ? 2.5 : 1.5 }), " \u62BD\u7B7E"] }), _jsxs(NavLink, { to: "/ai", className: ({ isActive }) => `py-3 flex items-center justify-center gap-1 ${isActive ? 'text-brand-red' : 'text-gray-500'} active:scale-95 transition-transform`, children: [_jsx(MessageSquare, { className: "mr-1", size: 22, strokeWidth: isAI ? 2.5 : 1.5 }), " AI"] }), _jsxs(NavLink, { to: "/settings", className: ({ isActive }) => `py-3 flex items-center justify-center gap-1 ${isActive ? 'text-brand-red' : 'text-gray-500'} active:scale-95 transition-transform`, children: [_jsx(SettingsIcon, { className: "mr-1", size: 22, strokeWidth: location.pathname === '/settings' ? 2.5 : 1.5 }), " \u8BBE\u7F6E"] })] }) }));
}
