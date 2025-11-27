import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import { useApp } from '../context/AppContext';
export default function AuthPrompt() {
    const { authPromptOpen, dismissAuthPrompt } = useApp();
    const nav = useNavigate();
    return (_jsx(Modal, { open: authPromptOpen, onClose: () => dismissAuthPrompt(), children: _jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "text-lg font-bold", children: "\u6B22\u8FCE\u4F7F\u7528 EatWhat" }), _jsx("div", { className: "text-sm text-gray-600", children: "\u767B\u5F55\u540E\u53EF\u540C\u6B65\u4F60\u7684\u6570\u636E\u4E0E\u504F\u597D" }), _jsxs("div", { className: "grid grid-cols-1 gap-2", children: [_jsx("button", { className: "btn w-full bg-brand-red text-white", onClick: () => nav('/login'), children: "\u90AE\u7BB1\u767B\u5F55/\u6CE8\u518C" }), _jsx("button", { className: "btn w-full bg-gray-100 text-gray-700", onClick: () => nav('/phone'), children: "\u624B\u673A\u9A8C\u8BC1\u7801\u767B\u5F55" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("button", { className: "text-sm text-gray-600", onClick: () => dismissAuthPrompt(), children: "\u7A0D\u540E\u767B\u5F55" }), _jsx("div", { className: "text-xs text-gray-400", children: "\u672A\u767B\u5F55\u65F6\u81EA\u52A8\u5F39\u51FA" })] })] }) }));
}
