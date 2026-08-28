import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  FileText,
  ScanSearch,
  TrendingUp,
  Award,
  ArrowRight,
  Sparkles,
  Users,
  Gauge,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts'
import { dashboardService, screeningService } from '../services/endpoints'
import { useAuth } from '../context/AuthContext'
import MatchBadge from '../components/MatchBadge'
import EmptyState from '../components/EmptyState'
import Skeleton from '../components/Skeleton'

const SCORE_BUCKETS = [
  { label: '0–49', min: 0, max: 49, color: '#dc2626' },
  { label: '50–69', min: 50, max: 69, color: '#d97706' },
  { label: '70–84', min: 70, max: 84, color: '#2563eb' },
  { label: '85–100', min: 85, max: 100, color: '#059669' },
]

const QUALITY_GROUPS = [
  { label: 'Strong', levels: ['Strong Match'], color: '#059669' },
  { label: 'Good', levels: ['Good Match'], color: '#2563eb' },
  { label: 'Weak', levels: ['Consider', 'Weak Match'], color: '#d97706' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [screenings, setScreenings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([dashboardService.stats(), screeningService.list().catch(() => [])])
      .then(([statsRes, listRes]) => {
        setStats(statsRes)
        setScreenings(listRes)
      })
      .finally(() => setLoading(false))
  }, [])

  const hasScreenings = (stats?.total_screenings ?? 0) > 0

  const scoreBucketData = useMemo(
    () =>
      SCORE_BUCKETS.map((b) => ({
        label: b.label,
        count: screenings.filter((s) => s.match_score >= b.min && s.match_score <= b.max).length,
        color: b.color,
      })),
    [screenings]
  )

  const qualityData = useMemo(
    () =>
      QUALITY_GROUPS.map((g) => ({
        name: g.label,
        value: screenings.filter((s) => g.levels.includes(s.match_level)).length,
        color: g.color,
      })),
    [screenings]
  )

  const topCandidate = useMemo(() => {
    if (!screenings.length) return null
    return [...screenings].sort((a, b) => b.match_score - a.match_score)[0]
  }, [screenings])

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-navy-gradient p-6 sm:p-8 mb-8 text-white">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 85% 15%, #608bfa 0%, transparent 45%), radial-gradient(circle at 10% 90%, #3b66f5 0%, transparent 40%)',
          }}
        />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}</h1>
            <p className="text-sm text-white/60 mt-1.5 max-w-lg leading-relaxed">
              Screen candidates faster, discover stronger matches, and make better hiring decisions with AI.
            </p>
          </div>
          <Link
            to="/new-screening"
            className="btn-primary flex items-center justify-center gap-2 shrink-0 whitespace-nowrap"
          >
            <Plus size={18} />
            New Screening
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FileText} label="Total Resumes" value={stats?.total_resumes} loading={loading} />
        <StatCard icon={ScanSearch} label="Total Screenings" value={stats?.total_screenings} loading={loading} />
        <StatCard
          icon={TrendingUp}
          label="Average Match"
          value={stats ? `${Math.round(stats.average_match_score)}%` : undefined}
          loading={loading}
        />
        <StatCard icon={Award} label="Strong Matches" value={stats?.strong_matches} loading={loading} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-brand-600" />
            <h2 className="font-semibold text-gray-900 text-sm">Match Score Snapshot</h2>
          </div>
          {loading ? (
            <Skeleton className="h-56 w-full" />
          ) : hasScreenings ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={scoreBucketData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#f0f1f5" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: 12, border: '1px solid #eef1f6', fontSize: 12 }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {scoreBucketData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={BarChart3} title="No score data yet" description="Run a screening to see the score distribution." />
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon size={16} className="text-brand-600" />
            <h2 className="font-semibold text-gray-900 text-sm">Match Quality</h2>
          </div>
          {loading ? (
            <Skeleton className="h-56 w-full" />
          ) : hasScreenings ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={qualityData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {qualityData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #eef1f6', fontSize: 12 }} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={PieChartIcon} title="No quality data yet" description="Run a screening to see match quality." />
          )}
        </div>
      </div>

      {/* AI Hiring Insights */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-brand-600" />
          <h2 className="font-semibold text-gray-900 text-sm">AI Hiring Insights</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <InsightCard
            icon={Sparkles}
            title="AI Hiring Insight"
            loading={loading}
            body={
              topCandidate ? (
                <>
                  <p className="font-semibold text-gray-900">{topCandidate.candidate_name || 'Unknown candidate'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Your strongest recent match at <span className="font-semibold text-emerald-600">{topCandidate.match_score}%</span>
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-400">Run a screening to surface your top candidate.</p>
              )
            }
          />
          <InsightCard
            icon={Users}
            title="Candidate Pipeline"
            loading={loading}
            body={
              <>
                <p className="font-semibold text-gray-900">{stats?.total_screenings ?? 0} screenings</p>
                <p className="text-xs text-gray-500 mt-0.5">across {stats?.total_resumes ?? 0} uploaded resumes</p>
              </>
            }
          />
          <InsightCard
            icon={Gauge}
            title="Average Performance"
            loading={loading}
            body={
              <>
                <p className="font-semibold text-gray-900">{stats ? Math.round(stats.average_match_score) : 0}% average match</p>
                <p className="text-xs text-gray-500 mt-0.5">{stats?.strong_matches ?? 0} strong matches so far</p>
              </>
            }
          />
        </div>
      </div>

      {/* Recent screenings */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Screenings</h2>
          <Link to="/history" className="text-sm text-brand-600 font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : stats?.recent_screenings?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium">Candidate</th>
                  <th className="px-5 py-3 font-medium">Match</th>
                  <th className="px-5 py-3 font-medium">Recommendation</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_screenings.map((s) => (
                  <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-xs font-semibold shrink-0">
                          {(s.candidate_name || 'U')[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 whitespace-nowrap">{s.candidate_name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-700 font-medium">{s.match_score}%</td>
                    <td className="px-5 py-3.5">
                      <MatchBadge level={s.match_level} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link to={`/screenings/${s.id}`} className="text-brand-600 text-sm font-medium hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={ScanSearch}
            title="No screenings yet"
            description="Run your first AI-powered resume screening to see your hiring analytics."
            action={
              <Link to="/new-screening" className="btn-primary inline-flex items-center gap-2">
                <Plus size={16} /> New Screening
              </Link>
            }
          />
        )}
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, loading }) {
  return (
    <div className="card card-hover p-4 sm:p-5">
      <div className="h-9 w-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
        <Icon size={18} />
      </div>
      {loading ? (
        <Skeleton className="h-7 w-14 mb-1" />
      ) : (
        <p className="text-2xl font-bold text-gray-900">{value ?? 0}</p>
      )}
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}

function InsightCard({ icon: Icon, title, body, loading }) {
  return (
    <div className="card card-hover p-5">
      <div className="h-9 w-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
        <Icon size={17} />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">{title}</p>
      {loading ? <Skeleton className="h-9 w-full" /> : body}
    </div>
  )
}
