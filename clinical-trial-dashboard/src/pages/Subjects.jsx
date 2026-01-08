import { useEffect, useState } from 'react'
import { User, Search, Filter, AlertCircle, CheckCircle, Clock, Activity, MapPin } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const API_BASE = '/api'

export default function Subjects() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [studyFilter, setStudyFilter] = useState('')
  const [riskFilter, setRiskFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewMode, setViewMode] = useState('cards')

  useEffect(() => {
    fetch(`${API_BASE}/subjects`)
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  const subjects = data?.subjects || []
  const studies = [...new Set(subjects.map((s) => s.Study))].sort()
  const statuses = [...new Set(subjects.map((s) => s.SubjectStatus).filter(Boolean))].sort()

  const filteredSubjects = subjects.filter((subj) => {
    const matchesSearch = 
      subj.Subject?.toLowerCase().includes(search.toLowerCase()) ||
      subj.Site?.toLowerCase().includes(search.toLowerCase())
    const matchesStudy = !studyFilter || subj.Study === studyFilter
    const matchesRisk = !riskFilter || subj.risk_category === riskFilter
    const matchesStatus = !statusFilter || subj.SubjectStatus === statusFilter
    return matchesSearch && matchesStudy && matchesRisk && matchesStatus
  })

  const statusColors = {
    'On Trial': '#10b981',
    'Screening': '#3b82f6',
    'Screen Failure': '#ef4444',
    'Completed': '#8b5cf6',
    'Discontinued': '#f59e0b',
  }

  const statusData = Object.entries(data?.status_distribution || {}).map(([name, value]) => ({
    name: name || 'Unknown',
    value,
    color: statusColors[name] || '#64748b'
  }))

  const riskData = [
    { name: 'Low', value: data?.risk_distribution?.Low || 0, color: '#10b981' },
    { name: 'Medium', value: data?.risk_distribution?.Medium || 0, color: '#f59e0b' },
    { name: 'High', value: data?.risk_distribution?.High || 0, color: '#ef4444' },
  ]

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'High':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle className="w-3 h-3" /> High Risk
          </span>
        )
      case 'Medium':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <Clock className="w-3 h-3" /> Medium
          </span>
        )
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="w-3 h-3" /> Low
          </span>
        )
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      'On Trial': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'Screening': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Screen Failure': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'Completed': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'Discontinued': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
        {status || 'Unknown'}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Subject Records</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Showing {filteredSubjects.length} of {data?.total_count?.toLocaleString()} total subjects
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'cards' ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
          >Cards</button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
          >Table</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Total Subjects</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{data?.total_count?.toLocaleString()}</div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">On Trial</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{data?.status_distribution?.['On Trial'] || 0}</div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">High Risk</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{data?.risk_distribution?.High || 0}</div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Medium Risk</span>
          </div>
          <div className="text-2xl font-bold text-amber-600">{data?.risk_distribution?.Medium || 0}</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Subject Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                {statusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Risk Level Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={riskData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fill: '#64748b' }} />
              <YAxis tick={{ fill: '#64748b' }} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>{riskData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Search by subject or site..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10 w-full" />
          </div>
          <select value={studyFilter} onChange={(e) => setStudyFilter(e.target.value)} className="input w-44">
            <option value="">All Studies</option>
            {studies.map((study) => (<option key={study} value={study}>{study}</option>))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-44">
            <option value="">All Statuses</option>
            {statuses.map((status) => (<option key={status} value={status}>{status}</option>))}
          </select>
          <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="input w-36">
            <option value="">All Risks</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Subjects Display */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.slice(0, 50).map((subj, idx) => (
            <div key={`${subj.Study}-${subj.Subject}-${idx}`} className="card p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">{subj.Subject}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{subj.Study}</p>
                  </div>
                </div>
                {getRiskBadge(subj.risk_category)}
              </div>
              <div className="mb-3">{getStatusBadge(subj.SubjectStatus)}</div>
              <div className="space-y-2 text-sm border-t border-slate-200 dark:border-slate-700 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> Site:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{subj.Site || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Country:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{subj.Country || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Latest Visit:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{subj.LatestVisit || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Total Issues:</span>
                  <span className={`font-medium ${subj.total_issues > 5 ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>{subj.total_issues || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">ML Predicted:</span>
                  <span className={`font-medium ${subj.predicted_risk === 'High' ? 'text-red-600' : subj.predicted_risk === 'Medium' ? 'text-amber-600' : 'text-green-600'}`}>
                    {subj.predicted_risk} ({((subj.risk_probability || 0) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Subject</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Study</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Site</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-slate-500 dark:text-slate-400">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-slate-500 dark:text-slate-400">Risk</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-slate-500 dark:text-slate-400">Issues</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-slate-500 dark:text-slate-400">Predicted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredSubjects.slice(0, 100).map((subj, idx) => (
                  <tr key={`${subj.Study}-${subj.Subject}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{subj.Subject}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{subj.Study}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{subj.Site || '-'}</td>
                    <td className="px-4 py-3 text-center">{getStatusBadge(subj.SubjectStatus)}</td>
                    <td className="px-4 py-3 text-center">{getRiskBadge(subj.risk_category)}</td>
                    <td className="px-4 py-3 text-center font-medium text-slate-900 dark:text-white">{subj.total_issues || 0}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-medium ${subj.predicted_risk === 'High' ? 'text-red-600' : subj.predicted_risk === 'Medium' ? 'text-amber-600' : 'text-green-600'}`}>{subj.predicted_risk}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredSubjects.length > (viewMode === 'cards' ? 50 : 100) && (
        <div className="text-center text-slate-500 dark:text-slate-400 py-4">
          Showing {viewMode === 'cards' ? 50 : 100} of {filteredSubjects.length} subjects. Use filters to narrow results.
        </div>
      )}

      {filteredSubjects.length === 0 && (
        <div className="text-center py-12">
          <User className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 dark:text-slate-400">No subjects match your filters</p>
        </div>
      )}
    </div>
  )
}
