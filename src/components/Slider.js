import { jsx as _jsx } from "react/jsx-runtime";
export default function Slider({ value, onChange, min = 0, max = 100 }) {
    return (_jsx("input", { type: "range", min: min, max: max, value: value, onChange: (e) => onChange(Number(e.target.value)), className: "w-full accent-brand-red" }));
}
