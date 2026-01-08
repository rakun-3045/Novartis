import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, History, Clock, MessageSquare, FileText, Loader2, CheckCircle, X, AlertCircle, Mail } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { streamChat } from '../services/api'

const STORAGE_KEY = 'clinical-trial-chat-history'

const suggestedQuestions = [
  "What are the overall data quality trends?",
  "Which sites have the highest deviation rates?",
  "Summarize Study 1's CRA reports",
  "Which studies need immediate attention?",
]

// Markdown components for beautiful rendering
const MarkdownComponents = {
  h2: ({ children }) => (
    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-4 mb-2 pb-1 border-b border-slate-200 dark:border-slate-600">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mt-3 mb-1.5">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-sm leading-relaxed mb-2 last:mb-0">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-none space-y-1.5 my-2 ml-1">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-1.5 my-2 ml-1">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-sm flex items-start gap-2">
      <span className="text-primary-500 mt-1.5">•</span>
      <span className="flex-1">{children}</span>
    </li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-slate-900 dark:text-white">
      {children}
    </strong>
  ),
  code: ({ children }) => (
    <code className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-xs font-mono">
      {children}
    </code>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-3 border-primary-500 pl-3 my-2 italic text-slate-600 dark:text-slate-400">
      {children}
    </blockquote>
  ),
}

// Streaming text component with typewriter effect
function StreamingMessage({ content, isStreaming }) {
  return (
    <div className="prose-chat">
      <ReactMarkdown components={MarkdownComponents}>
        {content}
      </ReactMarkdown>
      {isStreaming && (
        <span className="inline-flex items-center gap-1 ml-1">
          <span className="w-1 h-4 bg-primary-500 rounded-full animate-pulse" />
          <span className="w-1 h-4 bg-primary-400 rounded-full animate-pulse delay-75" />
          <span className="w-1 h-4 bg-primary-300 rounded-full animate-pulse delay-150" />
        </span>
      )}
    </div>
  )
}

// Helper to get saved conversations from localStorage
function loadConversations() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

// Helper to save conversations to localStorage
function saveConversations(conversations) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
  } catch {
    // Storage might be full or disabled
  }
}

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your Clinical Trial AI Assistant powered by advanced RAG technology. I have access to comprehensive data from all your clinical studies, including subject records, site performance metrics, CRA reports, and data quality indicators.\n\nHow can I help you analyze your clinical trial data today?"
    }
  ])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [conversations, setConversations] = useState([])
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [showHistory, setShowHistory] = useState(true)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [emailStatus, setEmailStatus] = useState(null)
  const [pendingEmailData, setPendingEmailData] = useState(null)
  const [emailSending, setEmailSending] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Load saved conversations on mount
  useEffect(() => {
    const saved = loadConversations()
    setConversations(saved)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Save current conversation when messages change (debounced)
  useEffect(() => {
    if (messages.length > 1) {
      const timer = setTimeout(() => {
        saveCurrentConversation()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [messages])

  const saveCurrentConversation = () => {
    if (messages.length <= 1) return

    const title = messages.find(m => m.role === 'user')?.content?.slice(0, 50) || 'New Conversation'
    const now = new Date().toISOString()

    setConversations(prev => {
      let updated
      if (activeConversationId) {
        // Update existing conversation
        updated = prev.map(c => 
          c.id === activeConversationId 
            ? { ...c, messages, updatedAt: now, title: title + (title.length >= 50 ? '...' : '') }
            : c
        )
      } else {
        // Create new conversation
        const newId = Date.now().toString()
        setActiveConversationId(newId)
        updated = [
          { id: newId, title: title + (title.length >= 50 ? '...' : ''), messages, createdAt: now, updatedAt: now },
          ...prev
        ].slice(0, 20) // Keep only last 20 conversations
      }
      saveConversations(updated)
      return updated
    })
  }

  const loadConversation = (conv) => {
    setMessages(conv.messages)
    setActiveConversationId(conv.id)
  }

  const startNewConversation = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Hello! I'm your Clinical Trial AI Assistant powered by advanced RAG technology. I have access to comprehensive data from all your clinical studies, including subject records, site performance metrics, CRA reports, and data quality indicators.\n\nHow can I help you analyze your clinical trial data today?"
      }
    ])
    setActiveConversationId(null)
  }

  const deleteConversation = (id, e) => {
    e.stopPropagation()
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== id)
      saveConversations(updated)
      return updated
    })
    if (activeConversationId === id) {
      startNewConversation()
    }
  }

  const clearAllHistory = () => {
    setConversations([])
    saveConversations([])
    startNewConversation()
  }

  // Email Agent Functions
  const checkEmailIntent = (message) => {
    const emailKeywords = [
      'send to email', 'send to my email', 'email me', 'email this', 
      'send via email', 'send this to my mail', 'mail me', 'send to mail',
      'email the response', 'email response', 'send me a copy',
      'send copy to email', 'share via email', 'forward to email'
    ]
    return emailKeywords.some(keyword => message.toLowerCase().includes(keyword))
  }

  const handleSend = async (question = input) => {
    if (!question.trim() || isStreaming) return

    const hasEmailIntent = checkEmailIntent(question)

    const userMessage = { role: 'user', content: question.trim() }
    
    // Capture current messages BEFORE adding the new user message (for chat history)
    const currentMessages = [...messages, userMessage]
    
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsStreaming(true)

    // Append placeholder for assistant response
    setMessages((prev) => [...prev, { role: 'assistant', content: '', sources: [] }])
    
    let finalResponse = ''
    let finalSources = []
    let extractedEmail = null

    try {
      // Pass chat history (last 10 messages) for memory feature
      await streamChat(
        question.trim(),
        (accumulatedText) => {
          // Update the last message with accumulated text
          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = {
              role: 'assistant',
              content: accumulatedText,
              sources: []
            }
            return updated
          })
          finalResponse = accumulatedText
        },
        (finalText, sources) => {
          // Final update with sources
          finalResponse = finalText
          finalSources = sources || []
          
          let displayText = finalText
          
          // If user wants to email, add prompt
          if (hasEmailIntent) {
            displayText += '\n\n---\n📧 **Would you like me to send this response to your email?**'
          }

          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = {
              role: 'assistant',
              content: displayText,
              sources: sources || [],
              canEmail: hasEmailIntent
            }
            return updated
          })

          // Handle email intent
          if (hasEmailIntent) {
            setPendingEmailData({
              question: question.trim(),
              response: finalText,
              sources: sources || []
            })

            if (extractedEmail) {
              // Email was provided in the message - auto-fill and show modal
              setEmailInput(extractedEmail)
            }
            
            // Show email modal
            setTimeout(() => setShowEmailModal(true), 500)
          }
        },
        currentMessages  // Pass chat history for memory (last 10 will be used)
      )
    } catch (error) {
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: "I apologize, but I encountered an error processing your request. Please ensure the backend server is running and try again.\n\nError: " + error.message
        }
        return updated
      })
    } finally {
      setIsStreaming(false)
    }
  }

  // Function to trigger email for any message
  const handleEmailMessage = (message) => {
    const userQuestion = messages.slice().reverse().find(m => m.role === 'user')
    setPendingEmailData({
      question: userQuestion?.content || 'Clinical Trial Query',
      response: message.content,
      sources: message.sources || []
    })
    setShowEmailModal(true)
  }

  // Handle sending email (mock implementation - would connect to backend in production)
  const handleSendEmail = async () => {
    if (!emailInput.trim() || emailSending) return
    
    setEmailSending(true)
    setEmailStatus(null)
    
    try {
      // Simulate API call - in production, this would call a backend endpoint
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // For now, just show success (backend email integration would go here)
      setEmailStatus({
        type: 'success',
        message: `Email sent successfully to ${emailInput}!`
      })
      
      // Close modal after success
      setTimeout(() => {
        setShowEmailModal(false)
        setEmailInput('')
        setEmailStatus(null)
        setPendingEmailData(null)
      }, 2000)
    } catch (error) {
      setEmailStatus({
        type: 'error',
        message: 'Failed to send email. Please try again.'
      })
    } finally {
      setEmailSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Email Modal - Agentic Feature */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary-500 to-purple-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-white" />
                <h3 className="text-lg font-semibold text-white">Send to Email</h3>
              </div>
              <button
                onClick={() => {
                  setShowEmailModal(false)
                  setEmailInput('')
                  setEmailStatus(null)
                }}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6">
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Enter your email address to receive a copy of this response:
              </p>
              
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendEmail()}
                    placeholder="your.email@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-400 transition-all"
                    disabled={emailSending}
                    autoFocus
                  />
                </div>
                
                {/* Status Messages */}
                {emailStatus && (
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${
                    emailStatus.type === 'success' 
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}>
                    {emailStatus.type === 'success' 
                      ? <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      : <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    }
                    <span className="text-sm">{emailStatus.message}</span>
                  </div>
                )}

                {/* Preview of what will be sent */}
                {pendingEmailData && (
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">Preview:</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                      <strong>Question:</strong> {pendingEmailData.question}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      + Full AI response ({pendingEmailData.response?.length || 0} characters)
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 flex gap-3">
              <button
                onClick={() => {
                  setShowEmailModal(false)
                  setEmailInput('')
                  setEmailStatus(null)
                }}
                className="flex-1 px-4 py-2.5 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors"
                disabled={emailSending}
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={!emailInput.trim() || emailSending}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                {emailSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compact Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Clinical Assistant</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Powered by Gemma 27B + RAG</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={startNewConversation}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            New Chat
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
            title="Toggle History"
          >
            <History className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Chat Area - Cleaner Two Column Layout */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left: History Panel (Collapsible) */}
        {showHistory && (
          <div className="w-64 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">History</span>
              {conversations.length > 0 && (
                <button
                  onClick={clearAllHistory}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {conversations.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No history yet</p>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => loadConversation(conv)}
                    className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                      activeConversationId === conv.id
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <p className="truncate font-medium">{conv.title}</p>
                    <p className="text-xs opacity-60 mt-0.5">{formatDate(conv.updatedAt)}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Center: Main Chat */}
        <div className="flex-1 flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800/95 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {messages.length === 1 && (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">How can I help you today?</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-6">
                  I can analyze your clinical trial data, identify issues, and provide insights across all your studies.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(q)}
                      disabled={isStreaming}
                      className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm rounded-lg transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {messages.slice(messages.length === 1 ? 0 : 0).map((msg, idx) => {
              if (messages.length === 1 && idx === 0) return null
              const isLastAssistant = idx === messages.length - 1 && msg.role === 'assistant'
              
              return (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}
                >
                  <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-primary-500 to-primary-600'
                      : 'bg-gradient-to-br from-violet-500 to-purple-600'
                  }`}>
                    {msg.role === 'user' 
                      ? <User className="w-4 h-4 text-white" />
                      : <Bot className="w-4 h-4 text-white" />
                    }
                  </div>
                  <div className={`flex-1 max-w-[85%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                    {msg.role === 'user' ? (
                      <div className="inline-block px-4 py-2.5 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl rounded-tr-sm shadow-sm">
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-slate-700/80 rounded-2xl rounded-tl-sm shadow-sm border border-slate-100 dark:border-slate-600 overflow-hidden group">
                        <div className="px-4 py-3">
                          <StreamingMessage 
                            content={msg.content} 
                            isStreaming={isStreaming && isLastAssistant} 
                          />
                        </div>
                        {/* Actions & Sources Bar */}
                        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-600 flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-wrap flex-1">
                            {msg.sources && msg.sources.length > 0 && (
                              <>
                                <FileText className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-xs text-slate-500 dark:text-slate-400">Sources:</span>
                                {msg.sources.slice(0, 4).map((src, i) => (
                                  <span
                                    key={i}
                                    className="text-xs px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full"
                                  >
                                    {src.study}
                                  </span>
                                ))}
                                {msg.sources.length > 4 && (
                                  <span className="text-xs text-slate-400">+{msg.sources.length - 4}</span>
                                )}
                              </>
                            )}
                          </div>
                          {/* Email Button - Agentic Feature */}
                          {msg.content && !isStreaming && (
                            <button
                              onClick={() => handleEmailMessage(msg)}
                              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              title="Send this response to email"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>Email</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input - Enhanced */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <div className="flex gap-3 items-end max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your clinical trial data..."
                  rows={1}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-400 focus:bg-white dark:focus:bg-slate-700 resize-none text-sm transition-all shadow-sm"
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
              </div>
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isStreaming}
                className="h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl transition-all flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
              >
                {isStreaming ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-slate-400 text-center mt-2">Press Enter to send, Shift+Enter for new line</p>
          </div>
        </div>
      </div>
    </div>
  )
}
