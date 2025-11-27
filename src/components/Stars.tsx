import { Star } from 'lucide-react'

export default function Stars({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const full = Math.round(value)
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const active = i < full
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange?.(i + 1)}
            className="active:scale-95"
          >
            <Star size={16} className={active ? 'text-brand-red' : 'text-gray-300'} />
          </button>
        )
      })}
    </div>
  )
}

