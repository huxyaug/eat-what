import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mode, setMode] = useState('login');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';
    const onSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        if (mode === 'signup') {
            const { error, data } = await supabase.auth.signUp({ email, password });
            if (error)
                setError(error.message);
            else if (!data.user)
                setError('请查收验证邮件以完成注册');
            else
                navigate(from, { replace: true });
        }
        else {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error)
                setError(error.message);
            else
                navigate(from, { replace: true });
        }
        setLoading(false);
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-white", children: _jsxs("div", { className: "w-full max-w-sm p-6", children: [_jsx("div", { className: "text-center text-2xl font-bold text-brand-red", children: "EatWhat" }), _jsxs("form", { className: "mt-6 space-y-3", onSubmit: onSubmit, children: [_jsx("input", { type: "email", placeholder: "\u90AE\u7BB1", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full border border-gray-200 rounded-xl px-3 py-2", required: true }), _jsx("input", { type: "password", placeholder: "\u5BC6\u7801", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full border border-gray-200 rounded-xl px-3 py-2", required: true }), error ? _jsx("div", { className: "text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2", children: error }) : null, _jsx("button", { type: "submit", disabled: loading, className: "w-full bg-brand-red text-white py-2 rounded-xl", children: mode === 'login' ? '登录' : '注册' })] }), _jsx("div", { className: "mt-3 text-center text-sm", children: _jsx("button", { className: "text-brand-red", onClick: () => setMode(mode === 'login' ? 'signup' : 'login'), children: mode === 'login' ? '没有账号？去注册' : '已有账号？去登录' }) })] }) }));
}
