import { defineStore } from 'pinia'
import { postChat, streamChat } from '@/services/apiClient'
import type { BackendMessage, ChatMessage, ChatRequestPayload } from '@/utils/types'

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return Math.random().toString(36).slice(2)
}

const createMessage = (role: ChatMessage['role'], content: string, extra?: Partial<ChatMessage>): ChatMessage => ({
  id: generateId(),
  role,
  content,
  createdAt: Date.now(),
  ...extra
})

const fromBackendMessage = (message: BackendMessage): ChatMessage => {
  const createdAt = new Date(message.timestamp).getTime()
  return createMessage(message.role, message.content, {
    createdAt: Number.isNaN(createdAt) ? Date.now() : createdAt
  })
}

const normalizeError = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'Algo salió mal. Intenta nuevamente.'
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [] as ChatMessage[],
    sessionId: null as string | null,
    isLoading: false,
    isStreaming: false,
    error: null as string | null,
    abortStreaming: null as null | (() => void)
  }),
  getters: {
    canAbortStreaming: (state) => Boolean(state.isStreaming && state.abortStreaming)
  },
  actions: {
    appendMessage(message: ChatMessage) {
      this.messages = [...this.messages, message]
    },
    updateMessage(id: string, patch: Partial<ChatMessage>) {
      this.messages = this.messages.map((message: ChatMessage) =>
        message.id === id ? { ...message, ...patch } : message
      )
    },
    removeMessage(id: string) {
      this.messages = this.messages.filter((message: ChatMessage) => message.id !== id)
    },
    reset() {
      this.messages = []
      this.sessionId = null
      this.error = null
      this.isLoading = false
      this.isStreaming = false
      this.abortStreaming = null
    },
    async sendMessage(content: string, options: { stream?: boolean } = {}) {
      const trimmed = content.trim()
      if (!trimmed) return

      const userMessage = createMessage('user', trimmed)
      this.appendMessage(userMessage)
      this.error = null
      this.isLoading = true

      const payloadMessages: Array<Pick<ChatMessage, 'role' | 'content'>> = [
        { role: userMessage.role, content: userMessage.content }
      ]

      const payload: ChatRequestPayload = {
        session_id: this.sessionId,
        messages: payloadMessages
      }

      try {
        if (options.stream) {
          console.warn('Streaming no está disponible en la API actual, continuando sin streaming')
        }

        const result = await postChat(payload)
        this.sessionId = result.sessionId
        this.messages = result.history.map(fromBackendMessage)
      } catch (error) {
        this.error = normalizeError(error)
      } finally {
        this.isLoading = false
      }
    },
    async handleStreamingRequest(payloadMessages: Array<Pick<ChatMessage, 'role' | 'content'>>) {
      const assistantMessage = createMessage('assistant', '', { pending: true })
      this.appendMessage(assistantMessage)
      this.isStreaming = true
      try {
        const abort = await streamChat(
          { session_id: this.sessionId, messages: payloadMessages, stream: true },
          (chunk: string) => {
            const current = this.messages.find((message: ChatMessage) => message.id === assistantMessage.id)
            const nextContent = (current?.content ?? '') + chunk
            this.updateMessage(assistantMessage.id, { content: nextContent })
          },
          () => {
            this.updateMessage(assistantMessage.id, { pending: false })
            this.isStreaming = false
            this.isLoading = false
            this.abortStreaming = null
          },
          (error: unknown) => {
            this.updateMessage(assistantMessage.id, { pending: false })
            this.isStreaming = false
            this.isLoading = false
            this.abortStreaming = null
            this.error = normalizeError(error)
          }
        )

        this.abortStreaming = abort
      } catch (error) {
        this.removeMessage(assistantMessage.id)
        this.isStreaming = false
        this.error = normalizeError(error)
      } finally {
        this.isLoading = false
      }
    },
    abortStream() {
      if (this.abortStreaming) {
        this.abortStreaming()
        this.abortStreaming = null
        this.isStreaming = false
        this.isLoading = false
      }
    }
  }
})
