import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Trash2, Eye, ScanSearch } from 'lucide-react'
import { screeningService } from '../services/endpoints'
import { extractErrorMessage } from '../services/api'
import { useToast } from '../context/ToastContext'
import MatchBadge from '../components/MatchBadge'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import Skeleton from '../components/Skeleton'

const PAGE_SIZE = 8

export default function History() {
  const { showToast } = useToast()
  const [screenings, setScreenings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)
  const [pendingDelete, setPendingDelete] = useState(null)

  useEffect(() => {
    load()
  }, [])

  function load() {
    setLoading(true)
    screeningService
      .list()
      .then(setScreenings)
      .finally(() => setLoading(false))
  }

  const filtered = useMemo(() => {
    let result = screenings.filter((s) => {
      const matchesSearch =
        !search ||
        s.candidate_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.target_role?.toLowerCase().includes(search.toLowerCase())
      const matchesLevel = levelFilter === 'all' || s.match_level === levelFilter
      return matchesSearch && matchesLevel
    })
    result = [...result].sort((a, b) => {
      const diff = new Date(a.created_at) - new Date(b.created_at)
      return sortDir === 'desc' ? -diff : diff
    })
    return result
  }, [screenings, search, levelFilter, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  async function handleDelete() {
    if (!pendingDelete) return
    try {
      await screeningService.remove(pendingDelete.id)
      setScreenings((prev) => prev.filter((s) => s.id !== pendingDelete.id))
      showToast('Screening deleted')
    } catch (err) {
      showToast(extractErrorMessage(err, 'Could not delete screening'), 'error')
    } finally {
      setPendingDelete(null)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Screening History</h1>
      <p className="text-sm text-gray-500 mb-6">Search, filter, and revisit past resume screenings.</p>

      <div className="card p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Search by candidate or role..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <select
          className="input sm:w-56"
          value={levelFilter}
          onChange={(e) => {
            setLevelFilter(e.target.value)
            setPage(1)
          }}
        >
          <option value="all">All match levels</option>
          <option value="Strong Match">Strong Match</option>
          <option value="Good Match">Good Match</option>
          <option value="Consider">Consider</option>
          <option value="Weak Match">Weak Match</option>
        </select>
        <select
          className="input sm:w-44"
          value={sortDir}
          onChange={(e) => setSortDir(e.target.value)}
        >
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ScanSearch}
            title="No screenings found"
            description="Try adjusting your search or filters, or run a new screening."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 text-xs uppercase tracking-wide">
                    <th className="px-5 py-3 font-medium">Candidate</th>
                    <th className="px-5 py-3 font-medium">Role</th>
                    <th className="px-5 py-3 font-medium">Score</th>
                    <th className="px-5 py-3 font-medium">Match Level</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((s) => (
                    <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-xs font-semibold shrink-0">
                            {(s.candidate_name || 'U')[0].toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{s.candidate_name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 max-w-[220px] truncate">{s.target_role || '—'}</td>
                      <td className="px-5 py-3.5 text-gray-700">{s.match_score}%</td>
                      <td className="px-5 py-3.5">
                        <MatchBadge level={s.match_level} />
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                        {new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-3">
                          <Link to={`/screenings/${s.id}`} className="text-gray-400 hover:text-brand-600" title="View">
                            <Eye size={17} />
                          </Link>
                          <button
                            onClick={() => setPendingDelete(s)}
                            className="text-gray-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="btn-secondary px-3 py-1.5 text-sm"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="btn-secondary px-3 py-1.5 text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this screening?"
        description={`This will permanently remove the screening for ${pendingDelete?.candidate_name || 'this candidate'}.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
