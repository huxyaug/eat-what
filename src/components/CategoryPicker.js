import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
function buildTree(categories) {
    const root = {};
    for (const c of categories) {
        const parts = String(c.name).split('/');
        let node = root;
        for (let i = 0; i < parts.length; i++) {
            const key = parts[i];
            node.children = node.children || {};
            node.children[key] = node.children[key] || { name: key, children: {} };
            node = node.children[key];
            if (i === parts.length - 1)
                node.id = c.id;
        }
    }
    return root.children || {};
}
export default function CategoryPicker({ categories, value, onChange }) {
    const tree = useMemo(() => buildTree(categories), [categories]);
    const [path, setPath] = useState([]);
    const level = path.length;
    const getLevelKeys = (lvl) => {
        let node = { children: tree };
        for (let i = 0; i < lvl; i++)
            node = node.children[path[i]] || { children: {} };
        return Object.keys(node.children || {});
    };
    const currentNode = (() => {
        let node = { children: tree };
        for (const p of path)
            node = node.children[p] || { children: {} };
        return node;
    })();
    const keys = getLevelKeys(level);
    return (_jsxs("div", { children: [_jsx("div", { className: "flex flex-wrap gap-2", children: path.map((p, i) => (_jsx("span", { className: "text-xs px-2 py-1 rounded-full bg-pink-50 text-pink-600", children: p }, i))) }), _jsx("div", { className: "mt-3 grid grid-cols-3 gap-2", children: keys.map((k) => (_jsx("button", { onClick: () => setPath([...path, k]), className: "btn bg-gray-100 text-gray-700", children: k }, k))) }), _jsxs("div", { className: "mt-3 flex gap-2", children: [level > 0 ? (_jsx("button", { onClick: () => setPath(path.slice(0, -1)), className: "btn bg-gray-100 text-gray-700", children: "\u8FD4\u56DE\u4E0A\u4E00\u7EA7" })) : null, currentNode?.id ? (_jsx("button", { onClick: () => onChange(currentNode.id), className: "btn bg-brand-red text-white", children: "\u9009\u62E9\u6B64\u5206\u7C7B" })) : null] })] }));
}
