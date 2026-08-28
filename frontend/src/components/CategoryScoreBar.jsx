const LABELS = {
  technical_skills: 'Technical Skills',
  experience: 'Experience',
  ai_llm: 'AI / LLM',
  preferred_requirements: 'Preferred Requirements',
}

export default function CategoryScoreBar({ id, value }) {
  const color = value >= 85 ? 'bg-emerald-500' : value >= 70 ? 'bg-blue-500' : value >= 50 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-medium text-gray-700">{LABELS[id] || id}</span>
        <span className="font-semibold text-gray-900">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
