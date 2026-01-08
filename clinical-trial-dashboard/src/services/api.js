// Use environment variable for backend URL, fallback to relative path for same-origin
const API_BASE = import.meta.env.VITE_API_URL || '/api'

export async function fetchDashboard() {
  const res = await fetch(`${API_BASE}/dashboard`)
  if (!res.ok) throw new Error('Failed to fetch dashboard data')
  return res.json()
}

export async function fetchStudies() {
  const res = await fetch(`${API_BASE}/studies`)
  if (!res.ok) throw new Error('Failed to fetch studies')
  return res.json()
}

export async function fetchStudyDetails(studyId) {
  const res = await fetch(`${API_BASE}/studies/${encodeURIComponent(studyId)}`)
  if (!res.ok) throw new Error('Failed to fetch study details')
  return res.json()
}

export async function fetchSites() {
  const res = await fetch(`${API_BASE}/sites`)
  if (!res.ok) throw new Error('Failed to fetch sites')
  return res.json()
}

export async function fetchMLResults() {
  const res = await fetch(`${API_BASE}/ml-results`)
  if (!res.ok) throw new Error('Failed to fetch ML results')
  return res.json()
}

export async function sendChatMessage(question, studyFilter = null, k = 12) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, study_filter: studyFilter, k })
  })
  if (!res.ok) throw new Error('Failed to get response')
  return res.json()
}

// Helper for robust SSE parsing
async function handleStreamResponse(res, onChunk, onComplete) {
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let fullText = ''
  let sources = []
  
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // Keep the last potentially incomplete line
      
      for (const line of lines) {
        if (line.trim() === '') continue
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            
            if (data.error) {
              throw new Error(data.error)
            }
            
            if (data.chunk) {
              fullText += data.chunk
              if (onChunk) onChunk(fullText, false)
            }
            
            if (data.done) {
              sources = data.sources || []
              if (onChunk) onChunk(fullText, true, sources)
              if (onComplete) onComplete(fullText, sources)
            }
          } catch (e) {
            console.error('Error parsing SSE data:', e)
          }
        }
      }
    }
  } catch (error) {
    console.error('Stream reading error:', error)
    throw error
  }
  
  return { answer: fullText, sources }
}

// Simple streaming function for Chat page - returns accumulated text
// Now supports chat_history for conversation memory (last 10 messages)
export async function streamChat(question, onChunk, onComplete, chatHistory = null) {
  // Format chat history for the API (last 10 messages)
  const formattedHistory = chatHistory 
    ? chatHistory.slice(-10).map(msg => ({ role: msg.role, content: msg.content }))
    : null
  
  const res = await fetch(`${API_BASE}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      question, 
      study_filter: null, 
      k: 12,
      chat_history: formattedHistory
    })
  })
  
  if (!res.ok) throw new Error('Failed to get response')
  
  // Adapter for the Chat page which expects (accumulatedText)
  return handleStreamResponse(res, (text, done, sources) => {
    if (!done) {
      onChunk(text)
    }
  }, onComplete)
}

export async function streamChatMessage(question, studyFilter = null, k = 12, onChunk, chatHistory = null) {
  // Format chat history for the API (last 10 messages)
  const formattedHistory = chatHistory 
    ? chatHistory.slice(-10).map(msg => ({ role: msg.role, content: msg.content }))
    : null
  
  const res = await fetch(`${API_BASE}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      question, 
      study_filter: studyFilter, 
      k,
      chat_history: formattedHistory
    })
  })
  
  if (!res.ok) throw new Error('Failed to get response')
  
  return handleStreamResponse(res, onChunk)
}

// ============================================================================
// Email Agent API Functions
// ============================================================================

/**
 * Detect if user message contains intent to send email
 */
export async function detectEmailIntent(message) {
  const res = await fetch(`${API_BASE}/email/detect-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  })
  if (!res.ok) throw new Error('Failed to detect email intent')
  return res.json()
}

/**
 * Send chat response to user's email
 */
export async function sendEmailResponse(email, question, response, sources = []) {
  const res = await fetch(`${API_BASE}/email/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, question, response, sources })
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.detail || 'Failed to send email')
  }
  return res.json()
}

/**
 * Validate email format
 */
export async function validateEmail(email) {
  const res = await fetch(`${API_BASE}/email/validate?email=${encodeURIComponent(email)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
  if (!res.ok) throw new Error('Failed to validate email')
  return res.json()
}
