import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { chatRecommend, generateShoppingList } from '../lib/ai';
import { useApp } from '../context/AppContext';
import { Send, Wand2 } from 'lucide-react';
export default function AIChat() {
    const { user } = useApp();
    const [messages, setMessages] = useState([{ role: 'assistant', content: '告诉我你的口味、预算或场景，我来推荐今天吃什么' }]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const listRef = useRef(null);
    const [listItems, setListItems] = useState([]);
    useEffect(() => { listRef.current?.scrollTo({ top: 999999, behavior: 'smooth' }); }, [messages.length]);
    const send = async (text) => {
        const content = (text ?? input).trim();
        if (!content)
            return;
        setInput('');
        const next = [...messages, { role: 'user', content }];
        setMessages(next);
        setLoading(true);
        try {
            const chain = next.map((m) => ({ role: m.role, content: m.content }));
            const reply = await chatRecommend(chain);
            setMessages([...next, { role: 'assistant', content: reply }]);
        }
        finally {
            setLoading(false);
        }
    };
    const quick = (t) => send(t);
    const buildList = async () => {
        const ctx = messages.slice().reverse().find((m) => m.role === 'assistant')?.content || messages[messages.length - 1]?.content || '';
        if (!ctx)
            return;
        const items = await generateShoppingList(ctx);
        setListItems(items);
    };
    if (!user)
        return null;
    return (_jsxs("div", { className: "pb-20 px-4 mx-auto max-w-md", children: [_jsx("div", { className: "pt-4 text-2xl font-bold text-brand-red", children: "AI \u51B3\u7B56" }), _jsxs("div", { ref: listRef, className: "card p-3 mt-4 h-[60vh] overflow-auto space-y-3", children: [messages.map((m, i) => (_jsx("div", { className: `flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`, children: _jsx("div", { className: `max-w-[75%] px-3 py-2 rounded-2xl ${m.role === 'assistant' ? 'bg-gray-100 text-gray-800' : 'bg-brand-red text-white'}`, children: m.content }) }, i))), loading ? _jsx("div", { className: "text-xs text-gray-500", children: "AI \u6B63\u5728\u601D\u8003\u2026" }) : null] }), _jsxs("div", { className: "mt-3 flex gap-2", children: [_jsx("button", { onClick: () => quick('我想吃点辣的，来点重口味'), className: "btn flex-1 bg-gray-100 text-gray-700", children: "\u91CD\u53E3\u5473" }), _jsx("button", { onClick: () => quick('我今天想清淡一点，低卡为主'), className: "btn flex-1 bg-gray-100 text-gray-700", children: "\u6E05\u6DE1\u4F4E\u5361" }), _jsx("button", { onClick: () => quick('我赶时间，来点快捷的'), className: "btn flex-1 bg-gray-100 text-gray-700", children: "\u5FEB\u6377" })] }), _jsxs("div", { className: "mt-3 flex items-center gap-2", children: [_jsx("input", { value: input, onChange: (e) => setInput(e.target.value), placeholder: "\u548C AI \u804A\u804A\uFF0C\u5E2E\u4F60\u51B3\u5B9A\u4ECA\u5929\u5403\u4EC0\u4E48", className: "flex-1 rounded-xl px-4 py-3 bg-gray-100 focus:outline-none" }), _jsx("button", { onClick: () => send(), disabled: loading, className: "btn bg-brand-red text-white", children: _jsx(Send, { size: 18 }) }), _jsx("button", { onClick: () => quick('随便推荐一份适合今天的菜单'), disabled: loading, className: "btn bg-gray-100 text-gray-700", children: _jsx(Wand2, { size: 18 }) })] }), listItems.length ? (_jsxs("div", { className: "mt-3 card p-3", children: [_jsx("div", { className: "text-sm font-semibold mb-2", children: "\u8D2D\u7269\u6E05\u5355" }), _jsx("div", { className: "space-y-1", children: listItems.map((it, i) => (_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("div", { children: it.item }), _jsx("div", { className: "text-gray-500", children: it.qty })] }, i))) })] })) : null, _jsx("div", { className: "mt-2", children: _jsx("button", { onClick: buildList, className: "btn w-full bg-gray-100 text-gray-700", children: "\u4ECE\u5F53\u524D\u5EFA\u8BAE\u751F\u6210\u8D2D\u7269\u6E05\u5355" }) })] }));
}
