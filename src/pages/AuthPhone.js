import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { supabase } from '../lib/supabase';
export default function AuthPhone() {
    const [phone, setPhone] = useState('');
    const [token, setToken] = useState('');
    const [sent, setSent] = useState(false);
    const [error, setError] = useState(null);
    const send = async () => {
        setError(null);
        const { error } = await supabase.auth.signInWithOtp({ phone });
        if (error)
            setError(error.message);
        else
            setSent(true);
    };
    const verify = async () => {
        setError(null);
        const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
        if (error)
            setError(error.message);
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-white", children: _jsxs("div", { className: "w-full max-w-sm p-6", children: [_jsx("div", { className: "text-center text-2xl font-bold text-brand-red", children: "\u624B\u673A\u53F7\u767B\u5F55" }), _jsxs("div", { className: "mt-6 space-y-3", children: [_jsx("input", { value: phone, onChange: (e) => setPhone(e.target.value), placeholder: "\u624B\u673A\u53F7", className: "w-full rounded-xl px-3 py-3 bg-gray-100" }), !sent ? (_jsx("button", { onClick: send, className: "btn w-full bg-brand-red text-white", children: "\u53D1\u9001\u9A8C\u8BC1\u7801" })) : (_jsxs(_Fragment, { children: [_jsx("input", { value: token, onChange: (e) => setToken(e.target.value), placeholder: "\u9A8C\u8BC1\u7801", className: "w-full rounded-xl px-3 py-3 bg-gray-100" }), _jsx("button", { onClick: verify, className: "btn w-full bg-brand-red text-white", children: "\u767B\u5F55" })] })), error ? _jsx("div", { className: "text-xs text-red-500", children: error }) : null] })] }) }));
}
