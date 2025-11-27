export default function MacrosBar({ protein, fat, carbs }: { protein: number; fat: number; carbs: number }) {
  const total = protein + fat + carbs
  const p = total ? Math.round((protein / total) * 100) : 0
  const f = total ? Math.round((fat / total) * 100) : 0
  const c = 100 - p - f
  return (
    <div className="w-full">
      <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
        <div className="h-3 bg-blue-500" style={{ width: `${c}%` }} />
        <div className="h-3 bg-yellow-400" style={{ width: `${f}%` }} />
        <div className="h-3 bg-pink-500" style={{ width: `${p}%` }} />
      </div>
      <div className="mt-2 grid grid-cols-3 text-xs text-gray-600">
        <div>蛋白质 {protein}g</div>
        <div>脂肪 {fat}g</div>
        <div>碳水 {carbs}g</div>
      </div>
    </div>
  )
}

