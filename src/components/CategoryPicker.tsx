import type { Category } from '../types'
import { useMemo, useState } from 'react'

function buildTree(categories: Category[]) {
  const root: any = {}
  for (const c of categories) {
    const parts = String(c.name).split('/')
    let node = root
    for (let i = 0; i < parts.length; i++) {
      const key = parts[i]
      node.children = node.children || {}
      node.children[key] = node.children[key] || { name: key, children: {} }
      node = node.children[key]
      if (i === parts.length - 1) node.id = c.id
    }
  }
  return root.children || {}
}

export default function CategoryPicker({ categories, value, onChange }: { categories: Category[]; value?: string; onChange: (id: string) => void }) {
  const tree = useMemo(() => buildTree(categories), [categories])
  const [path, setPath] = useState<string[]>([])
  const level = path.length
  const getLevelKeys = (lvl: number) => {
    let node: any = { children: tree }
    for (let i = 0; i < lvl; i++) node = node.children[path[i]] || { children: {} }
    return Object.keys(node.children || {})
  }
  const currentNode = (() => {
    let node: any = { children: tree }
    for (const p of path) node = node.children[p] || { children: {} }
    return node
  })()
  const keys = getLevelKeys(level)
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {path.map((p, i) => (
          <span key={i} className="text-xs px-2 py-1 rounded-full bg-pink-50 text-pink-600">{p}</span>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {keys.map((k) => (
          <button key={k} onClick={() => setPath([...path, k])} className="btn bg-gray-100 text-gray-700">{k}</button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        {level > 0 ? (
          <button onClick={() => setPath(path.slice(0, -1))} className="btn bg-gray-100 text-gray-700">返回上一级</button>
        ) : null}
        {currentNode?.id ? (
          <button onClick={() => onChange(currentNode.id)} className="btn bg-brand-red text-white">选择此分类</button>
        ) : null}
      </div>
    </div>
  )
}

