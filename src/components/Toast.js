import { jsx as _jsx } from "react/jsx-runtime";
export default function Toast({ open, message }) {
    if (!open)
        return null;
    return _jsx("div", { className: "toast pop-in", children: message });
}
