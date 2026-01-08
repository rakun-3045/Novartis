import { useEffect, useState } from 'react'
import { Building2, Users, AlertTriangle, Search, Filter } from 'lucide-react'
import { fetchSites } from '../services/api'

export default function Sites() {
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [studyFilter, setStudyFilter] = useState('')

  useEffect(() => {
    fetchSites()
      .then((data) => setSites(data.sites || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const studies = [...new Set(sites.map((s) => s.study))].sort()

  const filteredSites = sites
    .filter((site) => {
      const matchesSearch = 
        site.site?.toLowerCase().includes(search.toLowerCase()) ||
        site.study?.toLowerCase().includes(search.toLowerCase())
      const matchesStudy = !studyFilter || site.study === studyFilter
      return matchesSearch && matchesStudy
    })
    .sort((a, b) => b.total_issues - a.total_issues)

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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Site Performance</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {sites.length} clinical sites across all studies
          </p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search sites..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 w-64"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={studyFilter}
              onChange={(e) => setStudyFilter(e.target.value)}
              className="input pl-10 w-48"
            >
              <option value="">All Studies</option>
              {studies.map((study) => (
                <option key={study} value={study}>{study}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sites Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">
                  Site
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400">
                  Study
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                  Subjects
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                  Total Issues
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                  Avg Issues/Subject
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredSites.slice(0, 100).map((site, idx) => {
                const avgIssues = site.total_subjects > 0 
                  ? (site.total_issues / site.total_subjects).toFixed(2) 
                  : 0
                const status = avgIssues > 5 ? 'critical' : avgIssues > 2 ? 'warning' : 'good'
                
                return (
                  <tr 
                    key={`${site.study}-${site.site}-${idx}`}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {site.site}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {site.study}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-900 dark:text-white">
                          {site.total_subjects}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-medium text-slate-900 dark:text-white">
                        {site.total_issues}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-medium text-slate-900 dark:text-white">
                        {avgIssues}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        status === 'critical' 
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : status === 'warning'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {status === 'critical' ? 'Needs Attention' : status === 'warning' ? 'Monitor' : 'Good'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filteredSites.length > 100 && (
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 text-center text-sm text-slate-500">
            Showing 100 of {filteredSites.length} sites. Use search to filter.
          </div>
        )}
      </div>
    </div>
  )
}
