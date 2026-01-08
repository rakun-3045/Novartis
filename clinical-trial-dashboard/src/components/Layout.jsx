import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import {
  LayoutDashboard,
  FlaskConical,
  Building2,
  Users,
  BarChart3,
  MessageSquare,
  Sun,
  Moon,
  Menu,
  X,
  Activity,
  Bot,
  Home
} from 'lucide-react'
import ChatBot from './ChatBot'

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/studies', icon: FlaskConical, label: 'Studies' },
  { path: '/sites', icon: Building2, label: 'Sites' },
  { path: '/subjects', icon: Users, label: 'Subjects' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/chat', icon: MessageSquare, label: 'AI Assistant' },
]

export default function Layout({ children }) {
  const { isDark, toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chatbotOpen, setChatbotOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white dark:bg-neutral-900 border-r border-slate-200 dark:border-neutral-800 transition-all duration-300 flex flex-col fixed h-full z-40`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-medical-teal rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-slate-900 dark:text-white">ClinicalAI</h1>
                <p className="text-xs text-slate-500 dark:text-neutral-500">Trial Monitor</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-500 dark:text-neutral-400"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''} ${!sidebarOpen ? 'justify-center' : ''}`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Theme Toggle */}
        <div className="p-4 border-t border-slate-200 dark:border-neutral-800">
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors ${
              !sidebarOpen ? 'justify-center' : ''
            }`}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
            {sidebarOpen && (
              <span className="text-slate-700 dark:text-neutral-300">
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}
      >
        {/* Header */}
        <header className="h-16 bg-white dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between px-6 sticky top-0 z-30">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {navItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-neutral-500">
              Clinical Trial Monitoring Dashboard
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setChatbotOpen(!chatbotOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-medical-teal text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Bot className="w-5 h-5" />
              <span>AI Chat</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </main>

      {/* Floating Chatbot */}
      <ChatBot isOpen={chatbotOpen} onClose={() => setChatbotOpen(false)} />
    </div>
  )
}
