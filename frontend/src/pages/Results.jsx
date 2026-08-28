import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  ChevronLeft,
  Briefcase,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react'
import { screeningService } from '../services/endpoints'
import { extractErrorMessage } from '../services/api'
import MatchBadge from '../components/MatchBadge'
import SkillStatusBadge from '../components/SkillStatusBadge'
import CircularScore from '../components/CircularScore'
import CategoryScoreBar from '../components/CategoryScoreBar'
import Skeleton from '../components/Skeleton'

export default function Results() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [screening, setScreening] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    screeningService
      .get(id)
      .then(setScreening)
      .catch((err) => setError(extractErrorMessage(err, 'Could not load this screening.')))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-10 text-center">
        <AlertTriangle className="mx-auto text-amber-500 mb-3" size={28} />
        <p className="text-gray-700 font-medium">{error}</p>
        <button onClick={() => navigate('/history')} className="btn-secondary mt-5 inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Back to History
        </button>
      </div>
    )
  }

  const r = screening.ai_result
  const isDemo = (r.recommendation_reason || '').includes('DEMO_MODE')

  return (
    <div className="pb-10">
      <Link to="/history" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4">
        <ChevronLeft size={16} /> Back
      </Link>

      {isDemo && (
        <div className="mb-5 flex items-center gap-2 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5">
          <Sparkles size={14} />
          Demo Mode result — this analysis was generated deterministically without calling a live LLM.
        </div>
      )}

      {/* Header */}
      <div className="card p-6 sm:p-8 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-8 animate-slideUp">
        <CircularScore score={r.match_score ?? screening.match_score} />
        <div className="text-center sm:text-left flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-500 mb-1 flex items-center justify-center sm:justify-start gap-1.5">
            <ShieldCheck size={13} /> AI Candidate Analysis
          </p>
          <h1 className="text-2xl font-bold text-gray-900">{r.candidate_name}</h1>
          <p className="text-gray-500 mt-0.5">{r.target_role}</p>
          <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
            <MatchBadge level={r.match_level ?? screening.match_level} />
            <span className="text-xs text-gray-400">Confidence {Math.round((r.confidence ?? 0) * 100)}%</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Category scores */}
        <div className="card p-6 animate-slideUp" style={{ animationDelay: '40ms' }}>
          <h2 className="font-semibold text-gray-900 mb-4">Category Scores</h2>
          <div className="space-y-4">
            {Object.entries(r.category_scores).map(([key, value]) => (
              <CategoryScoreBar key={key} id={key} value={value} />
            ))}
          </div>
        </div>

        {/* Recommendation */}
        <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-6 flex flex-col animate-slideUp" style={{ animationDelay: '80ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-brand-gradient text-white flex items-center justify-center shrink-0">
              <Sparkles size={15} />
            </div>
            <h2 className="font-semibold text-gray-900">AI Recommendation</h2>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <p className="font-bold text-lg text-gray-900 mb-2">{r.recommendation}</p>
            <p className="text-sm text-gray-600 leading-relaxed">{r.recommendation_reason}</p>
          </div>
        </div>
      </div>

      {/* Strengths & Gaps */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-6 border-emerald-100 animate-slideUp" style={{ animationDelay: '120ms' }}>
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" /> Candidate Strengths
          </h2>
          <ul className="space-y-3">
            {r.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 bg-emerald-50/60 rounded-xl px-3 py-2.5">
                <CheckCircle2 size={17} className="text-emerald-500 mt-0.5 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6 animate-slideUp" style={{ animationDelay: '160ms' }}>
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TriangleAlert size={16} className="text-amber-500" /> Skill Gaps
          </h2>
          <ul className="space-y-3">
            {r.skill_gaps.map((g, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 bg-amber-50/60 rounded-xl px-3 py-2.5">
                <AlertTriangle size={17} className="text-amber-500 mt-0.5 shrink-0" />
                {g}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Skills table */}
      <div className="card p-6 mb-6 animate-slideUp" style={{ animationDelay: '200ms' }}>
        <h2 className="font-semibold text-gray-900 mb-4">Skill Match</h2>
        <div className="space-y-4">
          {r.skills.map((s, i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-sm mb-1.5 gap-3">
                <span className="font-medium text-gray-800 truncate">{s.name}</span>
                <SkillStatusBadge status={s.status} />
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${skillBarColor(s.status)}`}
                  style={{ width: `${skillBarWidth(s.status)}%` }}
                />
              </div>
              {s.evidence && <p className="text-xs text-gray-400 mt-1.5">{s.evidence}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6 animate-slideUp" style={{ animationDelay: '240ms' }}>
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Briefcase size={16} className="text-brand-600" /> Experience Summary
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">{r.experience_summary}</p>
      </div>
    </div>
  )
}

function skillBarWidth(status) {
  return { strong: 100, good: 80, partial: 55, missing: 15 }[status] ?? 15
}

function skillBarColor(status) {
  return (
    {
      strong: 'bg-emerald-500',
      good: 'bg-blue-500',
      partial: 'bg-amber-500',
      missing: 'bg-gray-300',
    }[status] ?? 'bg-gray-300'
  )
}
