export type Role = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  role: Role
  content: string
  createdAt: number
  pending?: boolean
}

export interface BackendMessage {
  role: Role
  content: string
  timestamp: string
}

export interface ChatRequestPayload {
  messages: Array<Pick<ChatMessage, 'role' | 'content'>>
  session_id?: string | null
  context?: Record<string, unknown>
  stream?: boolean
}

export interface ChatResponseEnvelope {
  session_id: string
  reply: BackendMessage
  history: BackendMessage[]
}

export interface ChatResponsePayload {
  sessionId: string
  reply: BackendMessage
  history: BackendMessage[]
}
