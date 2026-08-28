const STYLES = {
  'Strong Match': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Good Match': 'bg-blue-50 text-blue-700 border border-blue-200',
  Consider: 'bg-amber-50 text-amber-700 border border-amber-200',
  'Weak Match': 'bg-red-50 text-red-700 border border-red-200',
}

export default function MatchBadge({ level, className = '' }) {
  const style = STYLES[level] || 'bg-gray-100 text-gray-600 border border-gray-200'
  return <span className={`badge ${style} ${className}`}>{level}</span>
}
