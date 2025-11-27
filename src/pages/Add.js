import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { Heart, Wand2 } from 'lucide-react';
import Slider from '../components/Slider';
import { suggestDishInfo, imageUrlForDishName, keywordsToLoremFlickrUrl } from '../lib/ai';
import Modal from '../components/Modal';
import CategoryPicker from '../components/CategoryPicker';
export default function Add() {
    const { user, categories, refreshCategories, refreshDishes } = useApp();
    const [name, setName] = useState('');
    const [calories, setCalories] = useState(0);
    const [weight, setWeight] = useState(50);
    const [categoryId, setCategoryId] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const fileRef = useRef(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [pickerOpen, setPickerOpen] = useState(false);
    useEffect(() => {
        refreshCategories();
    }, []);
    const randomImage = () => {
        const url = `https://loremflickr.com/400/300/food,dish?random=${Math.random()}`;
        setImageUrl(url);
    };
    const autoComplete = async () => {
        const info = await suggestDishInfo(name);
        setCalories(info.calories);
        const first = imageUrlForDishName(name);
        const second = keywordsToLoremFlickrUrl(info.keywords);
        const url = Math.random() > 0.3 ? first : second;
        setImageUrl(url);
    };
    const uploadFile = async (file) => {
        if (!file)
            return;
        try {
            const path = `${user?.id || 'guest'}/${Date.now()}-${file.name}`;
            const { error: upErr } = await supabase.storage.from('images').upload(path, file);
            if (upErr) {
                setError(upErr.message);
                return;
            }
            const { data } = supabase.storage.from('images').getPublicUrl(path);
            if (data?.publicUrl)
                setImageUrl(data.publicUrl);
        }
        catch (e) {
            setError(e.message || '上传失败');
        }
    };
    const onSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!user)
            return;
        const { error } = await supabase.from('dishes').insert({
            user_id: user.id,
            name,
            calories,
            weight,
            category_id: categoryId || null,
            image_url: imageUrl || null,
        });
        if (error) {
            setError(error.message);
        }
        else {
            await refreshDishes();
            navigate('/');
        }
    };
    return (_jsxs("div", { className: "pb-16 px-4 mx-auto max-w-md", children: [_jsx("div", { className: "pt-4 text-2xl font-bold text-brand-red", children: "\u53D1\u5E03\u7F8E\u98DF" }), _jsxs("form", { className: "mt-4 space-y-4 card p-4", onSubmit: onSubmit, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-sm text-gray-500", children: "\u586B\u5199\u4FE1\u606F\u540E\u70B9\u51FB\u53D1\u5E03" }), _jsx("button", { type: "submit", className: "btn bg-brand-red text-white", children: "\u53D1\u5E03" })] }), _jsx("input", { value: name, onChange: (e) => setName(e.target.value), placeholder: "\u7ED9\u4F60\u7684\u7F8E\u98DF\u53D6\u4E2A\u540D\u5B57\u5427", className: "w-full rounded-xl px-4 py-4 bg-gray-100 focus:outline-none text-lg", required: true }), _jsx("div", { className: "rounded-xl border-2 border-dashed border-gray-300 bg-white p-6 text-center", children: imageUrl ? (_jsx("img", { src: imageUrl, alt: "\u9884\u89C8", className: "w-full h-48 object-cover rounded-xl" })) : (_jsx("div", { className: "text-sm text-gray-500", children: "\u70B9\u51FB\u4E0B\u65B9\u6309\u94AE\u4E0A\u4F20\u56FE\u7247\u6216\u751F\u6210\u968F\u673A\u7F8E\u98DF\u56FE" })) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Heart, { size: 20, className: "text-brand-red" }), _jsx("div", { className: "text-xs text-gray-500", children: "\u559C\u7231\u5EA6" }), _jsx(Slider, { value: weight, onChange: setWeight, min: 0, max: 100 }), _jsx("span", { className: "text-xs text-gray-600 w-10 text-right", children: weight })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { type: "button", onClick: () => setPickerOpen(true), className: "btn bg-gray-100 text-gray-700", children: "\u9009\u62E9\u5206\u7C7B" }), _jsx("div", { className: "text-xs text-gray-500", children: categories.find((c) => c.id === categoryId)?.name || '未选择' })] }), _jsxs("div", { className: "rounded-xl border-2 border-dashed border-gray-300 bg-white p-4", children: [_jsx("div", { className: "text-sm text-gray-500 mb-2", children: "\u56FE\u7247 URL" }), _jsx("input", { value: imageUrl, onChange: (e) => setImageUrl(e.target.value), placeholder: "https://...", className: "w-full rounded-xl px-4 py-4 bg-gray-100 focus:outline-none" }), _jsxs("div", { className: "mt-3 flex gap-3", children: [_jsx("input", { ref: fileRef, type: "file", accept: "image/*", className: "hidden", onChange: (e) => e.target.files && uploadFile(e.target.files[0]) }), _jsx("button", { type: "button", onClick: () => fileRef.current?.click(), className: "btn bg-gray-100 text-gray-700", children: "\u4E0A\u4F20\u56FE\u7247" }), _jsxs("button", { type: "button", onClick: autoComplete, className: "btn bg-gray-100 text-gray-700", children: [_jsx(Wand2, { className: "mr-1", size: 18 }), " AI \u81EA\u52A8\u8865\u5168"] })] })] }), error ? _jsx("div", { className: "text-xs text-red-500", children: error }) : null, _jsx("button", { type: "submit", className: "btn w-full bg-brand-red text-white", children: "\u53D1\u5E03" })] }), _jsx(Modal, { open: pickerOpen, onClose: () => setPickerOpen(false), children: _jsx(CategoryPicker, { categories: categories, value: categoryId, onChange: (id) => { setCategoryId(id); setPickerOpen(false); } }) })] }));
}
