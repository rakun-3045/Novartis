import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Activity,
  FileWarning,
  Clock,
  ArrowRight
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import { fetchDashboard } from '../services/api'

const RISK_COLORS = {
  Low: '#22c55e',
  Medium: '#f59e0b',
  High: '#f97316',
  Critical: '#ef4444'
}

function KPICard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Failed to Load Dashboard
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-4">{error}</p>
        <p className="text-sm text-slate-400">
          Make sure the FastAPI backend is running on port 8000
        </p>
      </div>
    )
  }

  const { global_kpis, risk_distribution, studies } = data

  const riskData = Object.entries(risk_distribution).map(([name, value]) => ({
    name,
    value
  }))

  const topStudies = [...(studies || [])].sort((a, b) => b.total_issues - a.total_issues).slice(0, 8)

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Subjects"
          value={global_kpis.total_subjects?.toLocaleString()}
          icon={Users}
          color="bg-primary-500"
          subtitle={`${data.metadata?.total_studies || 0} studies`}
        />
        <KPICard
          title="Total Issues"
          value={global_kpis.total_issues?.toLocaleString()}
          icon={AlertTriangle}
          color="bg-amber-500"
          subtitle={`${global_kpis.avg_issues_per_subject?.toFixed(2)} avg per subject`}
        />
        <KPICard
          title="Critical/High Risk"
          value={(global_kpis.critical_risk_count + global_kpis.high_risk_count)?.toLocaleString()}
          icon={AlertCircle}
          color="bg-red-500"
          subtitle="Requires immediate attention"
        />
        <KPICard
          title="Safety Discrepancies"
          value={global_kpis.safety_discrepancies?.toLocaleString()}
          icon={FileWarning}
          color="bg-orange-500"
          subtitle="Pending review"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Pie Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Risk Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => value.toLocaleString()}
                  contentStyle={{
                    backgroundColor: 'rgb(30 41 59)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {Object.entries(RISK_COLORS).map(([name, color]) => (
              <div key={name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-sm text-slate-600 dark:text-slate-400">{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Studies by Issues */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Studies by Total Issues
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topStudies} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis
                  dataKey="study_id"
                  type="category"
                  width={80}
                  stroke="#9ca3af"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(30 41 59)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Bar dataKey="total_issues" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Pending Items"
          value={global_kpis.pending_items_count?.toLocaleString()}
          icon={Clock}
          color="bg-purple-500"
          subtitle={`${global_kpis.pending_items_pct?.toFixed(1)}% of subjects`}
        />
        <KPICard
          title="Missing Pages"
          value={global_kpis.missing_pages_total?.toLocaleString()}
          icon={FileWarning}
          color="bg-rose-500"
          subtitle="CRF pages incomplete"
        />
        <KPICard
          title="Outstanding Visits"
          value={global_kpis.outstanding_visits?.toLocaleString()}
          icon={Activity}
          color="bg-cyan-500"
          subtitle="Visits overdue"
        />
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/studies"
            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">View All Studies</p>
                <p className="text-sm text-slate-500">{data.metadata?.total_studies} studies</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </Link>

          <Link
            to="/sites"
            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-medical-teal/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-medical-teal" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Site Performance</p>
                <p className="text-sm text-slate-500">View site metrics</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </Link>

          <Link
            to="/chat"
            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">AI Analysis</p>
                <p className="text-sm text-slate-500">Get AI insights</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </Link>
        </div>
      </div>
    </div>
  )
}
