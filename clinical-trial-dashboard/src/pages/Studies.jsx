import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FlaskConical, Users, AlertTriangle, ArrowRight, Search } from 'lucide-react'
import { fetchStudies } from '../services/api'

const RISK_COLORS = {
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
}

export default function Studies() {
  const [studies, setStudies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('total_issues')

  useEffect(() => {
    fetchStudies()
      .then((data) => setStudies(data.studies || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filteredStudies = studies
    .filter((study) =>
      study.study_id.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'total_issues') return b.total_issues - a.total_issues
      if (sortBy === 'total_subjects') return b.total_subjects - a.total_subjects
      if (sortBy === 'name') return a.study_id.localeCompare(b.study_id)
      return 0
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Studies Overview</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {studies.length} clinical trials being monitored
          </p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search studies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 w-64"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input w-40"
          >
            <option value="total_issues">Most Issues</option>
            <option value="total_subjects">Most Subjects</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Studies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudies.map((study) => (
          <Link
            key={study.study_id}
            to={`/studies/${encodeURIComponent(study.study_id)}`}
            className="card p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                  <FlaskConical className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {study.study_id}
                  </h3>
                  <p className="text-sm text-slate-500">Clinical Trial</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-primary-500 transition-colors" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-1">
                  <Users className="w-4 h-4" />
                  <span>Subjects</span>
                </div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {study.total_subjects}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Issues</span>
                </div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {study.total_issues}
                </p>
              </div>
            </div>

            {/* Risk Breakdown */}
            <div className="flex gap-2 flex-wrap">
              {Object.entries(study.risk_breakdown || {}).map(([level, count]) =>
                count > 0 ? (
                  <span
                    key={level}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${RISK_COLORS[level]}`}
                  >
                    {level}: {count}
                  </span>
                ) : null
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Avg Issues/Subject</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {study.avg_issues?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-slate-500 dark:text-slate-400">Pending Items</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {study.pending_pct?.toFixed(1)}%
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
