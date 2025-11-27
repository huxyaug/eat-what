import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'
import { Heart, Wand2 } from 'lucide-react'
import Slider from '../components/Slider'
import { suggestDishInfo, imageUrlForDishName, keywordsToLoremFlickrUrl } from '../lib/ai'
import Modal from '../components/Modal'
import CategoryPicker from '../components/CategoryPicker'

export default function Add() {
  const { user, categories, refreshCategories, refreshDishes } = useApp()
  const [name, setName] = useState('')
  const [calories, setCalories] = useState<number>(0)
  const [weight, setWeight] = useState<number>(50)
  const [categoryId, setCategoryId] = useState<string>('')
  const [imageUrl, setImageUrl] = useState('')
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    refreshCategories()
  }, [])

  const randomImage = () => {
    const url = `https://loremflickr.com/400/300/food,dish?random=${Math.random()}`
    setImageUrl(url)
  }

  const autoComplete = async () => {
    const info = await suggestDishInfo(name)
    setCalories(info.calories)
    const first = imageUrlForDishName(name)
    const second = keywordsToLoremFlickrUrl(info.keywords)
    const url = Math.random() > 0.3 ? first : second
    setImageUrl(url)
  }

  const uploadFile = async (file: File) => {
    if (!file) return
    try {
      const path = `${user?.id || 'guest'}/${Date.now()}-${file.name}`
      const { error: upErr } = await supabase.storage.from('images').upload(path, file)
      if (upErr) { setError(upErr.message); return }
      const { data } = supabase.storage.from('images').getPublicUrl(path)
      if (data?.publicUrl) setImageUrl(data.publicUrl)
    } catch (e: any) {
      setError(e.message || '上传失败')
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!user) return
    const { error } = await supabase.from('dishes').insert({
      user_id: user.id,
      name,
      calories,
      weight,
      category_id: categoryId || null,
      image_url: imageUrl || null,
    })
    if (error) {
      setError(error.message)
    } else {
      await refreshDishes()
      navigate('/')
    }
  }

  return (
    <div className="pb-16 px-4 mx-auto max-w-md">
      <div className="pt-4 text-2xl font-bold text-brand-red">发布美食</div>
      <form className="mt-4 space-y-4 card p-4" onSubmit={onSubmit}>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">填写信息后点击发布</div>
          <button type="submit" className="btn bg-brand-red text-white">发布</button>
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="给你的美食取个名字吧"
          className="w-full rounded-xl px-4 py-4 bg-gray-100 focus:outline-none text-lg"
          required
        />
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-6 text-center">
          {imageUrl ? (
            <img src={imageUrl} alt="预览" className="w-full h-48 object-cover rounded-xl" />
          ) : (
            <div className="text-sm text-gray-500">点击下方按钮上传图片或生成随机美食图</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Heart size={20} className="text-brand-red" />
          <div className="text-xs text-gray-500">喜爱度</div>
          <Slider value={weight} onChange={setWeight} min={0} max={100} />
          <span className="text-xs text-gray-600 w-10 text-right">{weight}</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setPickerOpen(true)} className="btn bg-gray-100 text-gray-700">选择分类</button>
          <div className="text-xs text-gray-500">{categories.find((c) => c.id === categoryId)?.name || '未选择'}</div>
        </div>
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-4">
          <div className="text-sm text-gray-500 mb-2">图片 URL</div>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-xl px-4 py-4 bg-gray-100 focus:outline-none"
          />
          <div className="mt-3 flex gap-3">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && uploadFile(e.target.files[0])} />
            <button type="button" onClick={() => fileRef.current?.click()} className="btn bg-gray-100 text-gray-700">上传图片</button>
            <button type="button" onClick={autoComplete} className="btn bg-gray-100 text-gray-700"><Wand2 className="mr-1" size={18} /> AI 自动补全</button>
          </div>
        </div>
        {error ? <div className="text-xs text-red-500">{error}</div> : null}
        <button type="submit" className="btn w-full bg-brand-red text-white">发布</button>
      </form>
      <Modal open={pickerOpen} onClose={() => setPickerOpen(false)}>
        <CategoryPicker categories={categories} value={categoryId} onChange={(id) => { setCategoryId(id); setPickerOpen(false) }} />
      </Modal>
    </div>
  )
}
