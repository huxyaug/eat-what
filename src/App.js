import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Login from './pages/Login';
import Home from './pages/Home';
import Add from './pages/Add';
import Draw from './pages/Draw';
import Categories from './pages/Categories';
import Settings from './pages/Settings';
import AuthPhone from './pages/AuthPhone';
import BottomNav from './components/BottomNav';
import AIChat from './pages/AIChat';
function RequireAuth() {
    const { user, initialized } = useApp();
    const location = useLocation();
    if (!initialized)
        return null;
    if (!user)
        return _jsx(Navigate, { to: "/login", state: { from: location }, replace: true });
    return _jsx(Outlet, {});
}
export default function App() {
    useEffect(() => {
        const key = import.meta.env.VITE_AI_KEY || '';
        const endpoint = import.meta.env.VITE_AI_ENDPOINT || '';
        const masked = key ? key.slice(0, 6) + '...' : '(none)';
        console.log('AI 配置检测', { key: masked, endpoint });
    }, []);
    return (_jsx(AppProvider, { children: _jsxs("div", { className: "min-h-screen bg-bg text-text", children: [_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/phone", element: _jsx(AuthPhone, {}) }), _jsxs(Route, { element: _jsx(RequireAuth, {}), children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/add", element: _jsx(Add, {}) }), _jsx(Route, { path: "/draw", element: _jsx(Draw, {}) }), _jsx(Route, { path: "/categories", element: _jsx(Categories, {}) }), _jsx(Route, { path: "/settings", element: _jsx(Settings, {}) }), _jsx(Route, { path: "/ai", element: _jsx(AIChat, {}) })] })] }), _jsx(BottomNav, {})] }) }));
}
