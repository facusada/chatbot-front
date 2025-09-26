import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import type {
  ChatRequestPayload,
  ChatResponseEnvelope,
  ChatResponsePayload
} from '@/utils/types'

const RETRY_LIMIT = 1
const RETRY_STATUS = [408, 429, 500, 502, 503, 504]

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json'
  }
})

type RetriableConfig = AxiosRequestConfig & {
  __retryCount?: number
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const { config, response } = error
    const requestConfig = config as RetriableConfig | undefined

    if (response?.status === 401) {
      window.dispatchEvent(new CustomEvent('api:unauthorized'))
    }

    const status = response?.status
    const shouldRetry =
      (!response && error.code === 'ECONNABORTED') || (status ? RETRY_STATUS.includes(status) : false)

    if (shouldRetry && requestConfig) {
      requestConfig.__retryCount = (requestConfig.__retryCount ?? 0) + 1
      const attempt = requestConfig.__retryCount
      if (attempt <= RETRY_LIMIT) {
        await new Promise((resolve) => setTimeout(resolve, 300 * attempt))
        return apiClient(requestConfig)
      }
    }

    return Promise.reject(error)
  }
)

export const postChat = async (payload: ChatRequestPayload): Promise<ChatResponsePayload> => {
  const { data } = await apiClient.post<ChatResponseEnvelope>('/chat', payload)
  return {
    sessionId: data.session_id,
    reply: data.reply,
    history: data.history
  }
}

export const streamChat = async (
  payload: ChatRequestPayload,
  onChunk: (chunk: string) => void,
  onComplete?: () => void,
  onError?: (error: unknown) => void
) => {
  const controller = new AbortController()

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ...payload, stream: true }),
    signal: controller.signal
  })

  if (!response.ok) {
    throw new Error(`Streaming request failed with status ${response.status}`)
  }

  if (!response.body) {
    throw new Error('Readable stream is not available for this response')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  const pump = async (): Promise<void> => {
    try {
      const { value, done } = await reader.read()
      if (done) {
        onComplete?.()
        return
      }

      const chunk = decoder.decode(value, { stream: true })
      onChunk(chunk)
      await pump()
    } catch (err) {
      onError?.(err)
    }
  }

  pump().catch((err) => onError?.(err))

  return () => controller.abort()
}

export default apiClient
