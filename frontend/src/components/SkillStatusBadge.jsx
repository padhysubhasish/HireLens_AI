const STYLES = {
  strong: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  good: 'bg-blue-50 text-blue-700 border border-blue-200',
  partial: 'bg-amber-50 text-amber-700 border border-amber-200',
  missing: 'bg-gray-100 text-gray-500 border border-gray-200',
}

const LABELS = { strong: 'Strong', good: 'Good', partial: 'Partial', missing: 'Missing' }

export default function SkillStatusBadge({ status }) {
  return <span className={`badge ${STYLES[status] || STYLES.missing}`}>{LABELS[status] || status}</span>
}
