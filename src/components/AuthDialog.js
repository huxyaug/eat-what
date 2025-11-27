import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import Modal from './Modal';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
export default function AuthDialog() {
    const { authPromptOpen, dismissAuthPrompt } = useApp();
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const submit = async (e) => {
        e?.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error)
                    setError(error.message);
            }
            else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error)
                    setError(error.message);
            }
            if (!error)
                dismissAuthPrompt(true);
        }
        finally {
            setLoading(false);
        }
    };
    const oauth = async (provider) => {
        setError(null);
        const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } });
        if (error)
            setError(error.message);
    };
    const reset = async () => {
        setError(null);
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/login' });
        if (error)
            setError(error.message);
        else
            alert('已发送密码重置邮件，请查收');
    };
    return (_jsx(Modal, { open: authPromptOpen, onClose: () => dismissAuthPrompt(), children: _jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "text-lg font-bold", children: "\u6B22\u8FCE\u4F7F\u7528 EatWhat" }), _jsx("div", { className: "text-sm text-gray-600", children: "\u8BF7\u767B\u5F55\u6216\u6CE8\u518C\u4EE5\u4FDD\u5B58\u4F60\u7684\u83DC\u54C1\u4E0E\u504F\u597D" }), _jsxs("form", { className: "space-y-2", onSubmit: submit, children: [_jsx("input", { type: "email", placeholder: "\u90AE\u7BB1", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full border border-gray-200 rounded-xl px-3 py-2", required: true }), _jsx("input", { type: "password", placeholder: "\u5BC6\u7801", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full border border-gray-200 rounded-xl px-3 py-2", required: true }), error ? _jsx("div", { className: "text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2", children: error }) : null, _jsx("button", { type: "submit", disabled: loading, className: "w-full bg-brand-red text-white py-2 rounded-xl", children: mode === 'login' ? '登录' : '注册' })] }), _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("button", { className: "text-brand-red", onClick: () => setMode(mode === 'login' ? 'signup' : 'login'), children: mode === 'login' ? '没有账号？去注册' : '已有账号？去登录' }), _jsx("button", { className: "text-gray-600", onClick: reset, children: "\u5FD8\u8BB0\u5BC6\u7801" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx("button", { className: "btn bg-gray-100 text-gray-700", onClick: () => oauth('github'), children: "\u4F7F\u7528 GitHub \u767B\u5F55" }), _jsx("button", { className: "btn bg-gray-100 text-gray-700", onClick: () => oauth('google'), children: "\u4F7F\u7528 Google \u767B\u5F55" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("button", { className: "text-sm text-gray-600", onClick: () => dismissAuthPrompt(), children: "\u7A0D\u540E\u767B\u5F55" }), _jsx("div", { className: "text-xs text-gray-400", children: "\u9996\u6B21\u8BBF\u95EE\u81EA\u52A8\u5F39\u51FA\uFF0C\u7A0D\u540E\u53EF\u5728\u8BBE\u7F6E\u4E2D\u767B\u5F55" })] })] }) }));
}
