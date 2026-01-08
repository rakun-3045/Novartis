import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Users, AlertTriangle, FileWarning, Clock, Activity } from 'lucide-react'
import { fetchStudyDetails } from '../services/api'

export default function StudyDetail() {
  const { studyId } = useParams()
  const [study, setStudy] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStudyDetails(studyId)
      .then(setStudy)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [studyId])

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
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Study Not Found
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-4">{error}</p>
        <Link to="/studies" className="btn-primary">
          Back to Studies
        </Link>
      </div>
    )
  }

  // Parse document content for display
  const parseDocument = (doc) => {
    if (!doc) return {}
    const sections = {}
    const lines = doc.split('\n')
    let currentSection = 'overview'
    
    for (const line of lines) {
      if (line.startsWith('## ')) {
        currentSection = line.replace('## ', '').toLowerCase()
        sections[currentSection] = []
      } else if (line.trim() && !line.startsWith('#')) {
        if (!sections[currentSection]) sections[currentSection] = []
        sections[currentSection].push(line)
      }
    }
    return sections
  }

  const sections = parseDocument(study?.document)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/studies"
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{study?.study}</h1>
          <p className="text-slate-500 dark:text-slate-400">Study Details & Metrics</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Total Subjects</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {study?.total_subjects || 0}
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Total Issues</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {study?.total_issues || 0}
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Type</span>
          </div>
          <p className="text-lg font-semibold text-slate-900 dark:text-white capitalize">
            {study?.type?.replace('_', ' ') || 'Study Summary'}
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <FileWarning className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Document ID</span>
          </div>
          <p className="text-sm font-mono text-slate-600 dark:text-slate-300 truncate">
            {study?.id || 'N/A'}
          </p>
        </div>
      </div>

      {/* Full Document */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Study Report
        </h2>
        <div className="prose dark:prose-invert max-w-none">
          <div className="markdown-content whitespace-pre-wrap text-slate-700 dark:text-slate-300">
            {study?.document || 'No document available'}
          </div>
        </div>
      </div>
    </div>
  )
}
