import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function Modal({ open, onClose, children }) {
    return (_jsxs("div", { className: `${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} fixed inset-0 z-50 transition-opacity duration-300`, children: [_jsx("div", { className: `absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity`, onClick: onClose }), _jsx("div", { className: `absolute inset-x-6 top-1/3 bg-white rounded-xl p-5 shadow-xl transition-all duration-300 ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`, children: children })] }));
}
