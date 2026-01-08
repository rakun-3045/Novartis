import { useState, useRef, useEffect } from 'react'
import { X, Send, Loader2, Bot, User, Sparkles, History, Trash2, CheckCircle, AlertCircle } from 'lucide-react'
import { streamChatMessage } from '../services/api'

const STORAGE_KEY = 'clinical-trial-chatbot-history'

// Helper to get saved conversations from localStorage
function loadChatHistory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

// Helper to save conversations to localStorage
function saveChatHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 50))) // Keep last 50 messages
  } catch {
    // Storage might be full or disabled
  }
}

export default function ChatBot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your Clinical Trial AI Assistant. I can help you analyze trial data, identify issues, and provide insights. What would you like to know?",
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Load chat history on mount
  useEffect(() => {
    const history = loadChatHistory()
    setChatHistory(history)
    if (history.length > 0) {
      // Optionally restore last conversation
      const lastSession = history[0]
      if (lastSession?.messages?.length > 1) {
        setMessages(lastSession.messages)
      }
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Save to history when messages change
  useEffect(() => {
    if (messages.length > 1 && !isLoading) {
      const timer = setTimeout(() => {
        saveCurrentSession()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [messages, isLoading])

  const saveCurrentSession = () => {
    if (messages.length <= 1) return

    const title = messages.find(m => m.role === 'user')?.content?.slice(0, 40) || 'Chat Session'
    const now = new Date().toISOString()

    setChatHistory(prev => {
      // Check if this is an update to most recent session (within last 5 min)
      const recent = prev[0]
      let updated
      if (recent && new Date(recent.timestamp) > new Date(Date.now() - 5 * 60 * 1000)) {
        // Update existing session
        updated = [
          { ...recent, messages, timestamp: now },
          ...prev.slice(1)
        ]
      } else {
        // Create new session
        updated = [
          { id: Date.now().toString(), title: title + (title.length >= 40 ? '...' : ''), messages, timestamp: now },
          ...prev
        ].slice(0, 10) // Keep only last 10 sessions
      }
      saveChatHistory(updated)
      return updated
    })
  }

  const loadSession = (session) => {
    setMessages(session.messages)
    setShowHistory(false)
  }

  const clearHistory = () => {
    setChatHistory([])
    saveChatHistory([])
    setMessages([
      {
        role: 'assistant',
        content: "Hello! I'm your Clinical Trial AI Assistant. I can help you analyze trial data, identify issues, and provide insights. What would you like to know?",
      }
    ])
  }

  const startNewChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Hello! I'm your Clinical Trial AI Assistant. I can help you analyze trial data, identify issues, and provide insights. What would you like to know?",
      }
    ])
    setShowHistory(false)
  }

  // Email Agent Functions
  const checkEmailIntent = (message) => {
    const emailKeywords = [
      'send to email', 'send to my email', 'email me', 'email this', 
      'send via email', 'mail me', 'send to mail', 'email response',
      'send copy to email', 'forward to email', 'mail this'
    ]
    return emailKeywords.some(keyword => message.toLowerCase().includes(keyword))
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    
    // Capture current messages for chat history before updating state
    const currentMessages = [...messages, { role: 'user', content: userMessage }]
    
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)
    setStreamingContent('')

    try {
      // Pass chat history (last 10 messages) for memory feature
      await streamChatMessage(userMessage, null, 12, (text, done, sources) => {
        setStreamingContent(text)
        if (done) {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: text, sources }
          ])
          setStreamingContent('')
          setIsLoading(false)
        }
      }, currentMessages)  // Pass chat history for memory
    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error." }])
      setStreamingContent('')
      setIsLoading(false)
    }
  }

  const suggestedQuestions = [
    "What are the critical issues across all studies?",
    "Which study has the worst data quality?",
    "Show me the safety discrepancies summary",
  ]

  if (!isOpen) return null

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    if (diff < 60 * 60 * 1000) return 'Just now'
    if (diff < 24 * 60 * 60 * 1000) return 'Today'
    return date.toLocaleDateString()
  }

  return (
    <div className="fixed bottom-6 right-6 w-[450px] h-[600px] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-neutral-800 flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-medical-teal p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Clinical AI Assistant</h3>
            <p className="text-xs text-white/80">Powered by Gemma 27B + RAG</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Chat History"
          >
            <History className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="absolute top-16 left-0 right-0 bottom-0 bg-white dark:bg-neutral-900 z-10 flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between">
            <h4 className="font-semibold text-slate-900 dark:text-white">Chat History</h4>
            <div className="flex gap-2">
              <button
                onClick={startNewChat}
                className="text-xs px-3 py-1 bg-primary-500 text-white rounded-full hover:bg-primary-600"
              >
                New Chat
              </button>
              {chatHistory.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-xs px-3 py-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {chatHistory.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No chat history yet</p>
            ) : (
              chatHistory.map((session) => (
                <button
                  key={session.id}
                  onClick={() => loadSession(session)}
                  className="w-full text-left p-3 bg-slate-50 dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  <p className="text-sm font-medium text-slate-700 dark:text-neutral-200 truncate">
                    {session.title}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-neutral-500 mt-1">
                    {formatTime(session.timestamp)} • {session.messages.filter(m => m.role === 'user').length} messages
                  </p>
                </button>
              ))
            )}
          </div>
          <button
            onClick={() => setShowHistory(false)}
            className="m-4 px-4 py-2 bg-slate-100 dark:bg-neutral-800 rounded-lg text-slate-600 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700"
          >
            Back to Chat
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user'
                  ? 'bg-primary-100 dark:bg-primary-900'
                  : 'bg-medical-teal/10 dark:bg-medical-teal/20'
              }`}
            >
              {msg.role === 'user' ? (
                <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              ) : (
                <Sparkles className="w-4 h-4 text-medical-teal" />
              )}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-md'
                  : 'bg-slate-100 dark:bg-neutral-800 text-slate-900 dark:text-white rounded-bl-md'
              }`}
            >
              <div className="markdown-content text-sm whitespace-pre-wrap">
                {msg.content}
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-neutral-700">
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mb-1">Sources:</p>
                  <div className="flex flex-wrap gap-1">
                    {msg.sources.map((src, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 bg-slate-200 dark:bg-neutral-700 rounded-full"
                      >
                        {src.study}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Streaming message */}
        {streamingContent && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-medical-teal/10 dark:bg-medical-teal/20">
              <Sparkles className="w-4 h-4 text-medical-teal" />
            </div>
            <div className="max-w-[80%] rounded-2xl rounded-bl-md px-4 py-3 bg-slate-100 dark:bg-neutral-800 text-slate-900 dark:text-white">
              <div className="markdown-content text-sm whitespace-pre-wrap streaming-cursor">
                {streamingContent}
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && !isLoading && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => setInput(q)}
              className="text-xs px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Email Input Panel - Agentic Feature */}
      {showEmailInput && (
        <div className="px-4 py-3 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border-t border-slate-200 dark:border-neutral-700">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-neutral-200">Send to your email:</span>
          </div>
          <div className="flex gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendEmail()}
              placeholder="your@email.com"
              className="flex-1 px-3 py-2 text-sm bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary-500"
              disabled={emailSending}
              autoFocus
            />
            <button
              onClick={handleSendEmail}
              disabled={!emailInput.trim() || emailSending}
              className="px-3 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-sm rounded-lg flex items-center gap-1"
            >
              {emailSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
            <button
              onClick={() => { setShowEmailInput(false); setEmailInput(''); setEmailStatus(null); }}
              className="px-2 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-neutral-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {emailStatus && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${emailStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {emailStatus.type === 'success' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              {emailStatus.message}
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 dark:border-neutral-800">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about clinical trial data..."
            className="input flex-1"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
