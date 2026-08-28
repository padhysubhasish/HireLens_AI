export default function CircularScore({ score, size = 150, strokeWidth = 12 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const tier =
    score >= 85
      ? { from: '#10b981', to: '#059669', label: 'text-emerald-600' }
      : score >= 70
      ? { from: '#608bfa', to: '#2547e9', label: 'text-brand-600' }
      : score >= 50
      ? { from: '#fbbf24', to: '#d97706', label: 'text-amber-600' }
      : { from: '#f87171', to: '#dc2626', label: 'text-red-600' }

  const gradientId = 'score-gradient'

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={tier.from} />
            <stop offset="100%" stopColor={tier.to} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#eef1f6" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-3xl font-extrabold ${tier.label}`}>{score}%</span>
        <span className="text-[11px] text-gray-400 font-medium mt-0.5">Match Score</span>
      </div>
    </div>
  )
}
