import { useEffect, useState } from 'react'
import { Brain, TrendingUp, Target, Zap, BarChart3, BookOpen, Layers, CheckCircle, AlertTriangle, Info } from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell,
  LineChart, Line
} from 'recharts'
import { fetchMLResults } from '../services/api'

export default function Analytics() {
  const [mlData, setMlData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchMLResults()
      .then(setMlData)
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

  const modelsSummary = mlData?.models_summary || {}
  const featureImportance = mlData?.feature_importance || []
  const mlStrategy = mlData?.ml_strategy || {}
  
  // Classification models data
  const riskModels = modelsSummary.risk_classification || []
  const pendingModels = modelsSummary.pending_classification || []
  const issuesModels = modelsSummary.issues_regression || []
  const bestModels = modelsSummary.best_models || {}

  // Feature importance data
  const topFeatures = featureImportance
    .sort((a, b) => (b.Classification_Importance || 0) - (a.Classification_Importance || 0))
    .slice(0, 10)
    .map((f) => ({
      feature: f.Feature?.replace(/_/g, ' ').substring(0, 18) || 'Unknown',
      classification: parseFloat(((f.Classification_Importance || 0) * 100).toFixed(1)),
      regression: parseFloat(((f.Regression_Importance || 0) * 100).toFixed(1)),
    }))

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'models', label: 'Model Details', icon: Brain },
    { id: 'strategy', label: 'ML Strategy', icon: BookOpen },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">ML Analytics & Strategy</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Machine learning model performance, outcomes, and methodology
          </p>
        </div>
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">ML Tasks</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">3</div>
          <p className="text-xs text-slate-500 mt-1">Classification + Regression</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Best Risk Model</span>
          </div>
          <div className="text-xl font-bold text-green-600">{bestModels.risk || 'N/A'}</div>
          <p className="text-xs text-slate-500 mt-1">99.7% Accuracy</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Best Regression</span>
          </div>
          <div className="text-xl font-bold text-blue-600">{bestModels.issues || 'N/A'}</div>
          <p className="text-xs text-slate-500 mt-1">R² = 1.0</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Features Used</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">{featureImportance.length}</div>
          <p className="text-xs text-slate-500 mt-1">Input Variables</p>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Model Comparison Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-500" />
                Risk Classification Model Performance
              </h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={riskModels.map(m => ({ name: m.Model, accuracy: m.Accuracy, f1: m['F1 Score'], cv: m['CV Mean'] }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis domain={[98, 100]} tick={{ fill: '#64748b' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="accuracy" name="Accuracy %" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="f1" name="F1 Score %" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cv" name="CV Mean %" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Feature Importance (Classification vs Regression)
              </h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topFeatures} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fill: '#64748b' }} />
                  <YAxis type="category" dataKey="feature" width={120} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="classification" name="Classification" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="regression" name="Regression" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Issues Regression Models */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Issues Regression Model Comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Model</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-slate-500">R² Score</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-slate-500">MAE</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-slate-500">RMSE</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-slate-500">CV R² Mean</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-slate-500">CV Std</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {issuesModels.map((m, idx) => (
                    <tr key={idx} className={m.Model === bestModels.issues ? 'bg-green-50 dark:bg-green-900/20' : ''}>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                        {m.Model}
                        {m.Model === bestModels.issues && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </td>
                      <td className="px-4 py-3 text-center font-mono">{m['R² Score']?.toFixed(4)}</td>
                      <td className="px-4 py-3 text-center font-mono">{m.MAE?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center font-mono">{m.RMSE?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center font-mono">{m['CV R² Mean']?.toFixed(4)}</td>
                      <td className="px-4 py-3 text-center font-mono">{m['CV R² Std']?.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'models' && (
        <>
          {/* Classification Models */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Risk Classification Results</h2>
              <p className="text-sm text-slate-500 mb-4">Predicts subject risk level: Low, Medium, or High</p>
              <div className="space-y-4">
                {riskModels.map((m, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border ${m.Model === bestModels.risk ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-900 dark:text-white">{m.Model}</span>
                      {m.Model === bestModels.risk && <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">Best</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-slate-500">Accuracy:</span> <span className="font-mono">{m.Accuracy}%</span></div>
                      <div><span className="text-slate-500">F1 Score:</span> <span className="font-mono">{m['F1 Score']}%</span></div>
                      <div><span className="text-slate-500">CV Mean:</span> <span className="font-mono">{m['CV Mean']}%</span></div>
                      <div><span className="text-slate-500">CV Std:</span> <span className="font-mono">±{m['CV Std']}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Pending Items Classification</h2>
              <p className="text-sm text-slate-500 mb-4">Predicts if subject has pending coding items (0/1)</p>
              <div className="space-y-4">
                {pendingModels.map((m, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border ${m.Model === bestModels.pending ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-900 dark:text-white">{m.Model}</span>
                      {m.Model === bestModels.pending && <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">Best</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-slate-500">Accuracy:</span> <span className="font-mono">{m.Accuracy}%</span></div>
                      <div><span className="text-slate-500">F1 Score:</span> <span className="font-mono">{m['F1 Score']}%</span></div>
                      <div><span className="text-slate-500">CV Mean:</span> <span className="font-mono">{m['CV Mean']}%</span></div>
                      <div><span className="text-slate-500">CV Std:</span> <span className="font-mono">±{m['CV Std']}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature Importance Table */}
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Complete Feature Importance</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Rank</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Feature</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-slate-500">Classification %</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-slate-500">Regression %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {featureImportance.slice(0, 15).map((f, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="px-4 py-3 font-medium text-slate-500">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{f.Feature?.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-24 bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                            <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${(f.Classification_Importance || 0) * 100}%` }}></div>
                          </div>
                          <span className="font-mono text-sm">{((f.Classification_Importance || 0) * 100).toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-24 bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${Math.min((f.Regression_Importance || 0) * 100, 100)}%` }}></div>
                          </div>
                          <span className="font-mono text-sm">{((f.Regression_Importance || 0) * 100).toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'strategy' && (
        <>
          {/* ML Strategy Overview */}
          <div className="card p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{mlStrategy.title || 'Clinical Trial Risk Prediction ML Pipeline'}</h2>
                <p className="text-slate-600 dark:text-slate-300">{mlStrategy.description || 'A comprehensive machine learning approach to predict subject risk levels and identify data quality issues.'}</p>
              </div>
            </div>
          </div>

          {/* ML Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {(mlStrategy.tasks || []).map((task, idx) => (
              <div key={idx} className="card p-6">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                  idx === 0 ? 'bg-red-100 dark:bg-red-900/30' : idx === 1 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  {idx === 0 ? <AlertTriangle className="w-5 h-5 text-red-600" /> : idx === 1 ? <Target className="w-5 h-5 text-amber-600" /> : <TrendingUp className="w-5 h-5 text-blue-600" />}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{task.name}</h3>
                <span className="inline-block text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded mb-3">{task.type}</span>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{task.description}</p>
                <div className="text-xs text-slate-400">Target: <code className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">{task.target}</code></div>
              </div>
            ))}
          </div>

          {/* Models Used */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-500" />
              Models Implemented
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(mlStrategy.models_used || []).map((model, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <h4 className="font-medium text-slate-900 dark:text-white mb-1">{model.name}</h4>
                  <span className="text-xs text-primary-600 dark:text-primary-400">{model.type}</span>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{model.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Evaluation Metrics */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Evaluation Metrics Used
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {(mlStrategy.evaluation_metrics || []).map((metric, idx) => (
                <div key={idx} className="text-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 rounded-lg">
                  <div className="font-semibold text-slate-900 dark:text-white">{metric.metric}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{metric.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Features Used */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              Input Features
            </h3>
            <div className="flex flex-wrap gap-2">
              {(mlStrategy.features_used || []).map((feature, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                  {feature.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
