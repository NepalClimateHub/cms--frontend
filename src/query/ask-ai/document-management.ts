import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { getAccessToken } from '@/stores/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
const ADMIN_PATH = '/api/v1/ai-assistant/admin'

export type DocumentStatus =
  | 'UPLOADED'
  | 'QUEUED'
  | 'INDEXING'
  | 'READY'
  | 'FAILED'
  | 'DELETE_QUEUED'
  | 'DELETING'
  | 'DELETE_CLEANUP_FAILED'
  | 'DELETED'

export interface IndexJob {
  id: string
  document_id?: string
  operation: 'ADD' | 'REINDEX' | 'DELETE' | 'FULL_REBUILD' | 'IMPORT'
  status: 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED'
  stage: string
  attempt: number
  error?: string
  created_at: string
  started_at?: string
  completed_at?: string
}

export interface AiDocument {
  id: string
  title: string
  original_filename?: string
  file_size?: number
  status: DocumentStatus
  active_version: number
  chunk_count: number
  index_error?: string
  indexed_at?: string
  created_at: string
  index_jobs: IndexJob[]
}

export interface AiDocumentChunk {
  id: string
  chunkIndex: number
  pageStart?: number | null
  pageEnd?: number | null
  text: string
  meta?: Record<string, unknown>
}

interface DocumentChunksResponse {
  document: {
    id: string
    title: string
    version: number
  }
  chunks: AiDocumentChunk[]
  total: number
  page: number
  limit: number
}

interface DocumentListResponse {
  documents: AiDocument[]
  total: number
  page: number
  limit: number
}

interface DocumentSummary {
  documents: Array<{ status: DocumentStatus; _count: number }>
  totalChunks: number
  lastSuccessfulJob?: IndexJob
}

export interface AiAssistantSettings {
  visualResponsesEnabled: boolean
  climateDataEnabled: boolean
  climateMapsEnabled: boolean
  graphRagEnabled: boolean
  climateRolloutStage: 'DISABLED' | 'ADMIN' | 'INTERNAL' | 'LIMITED' | 'ALL'
  updatedAt: string
  updatedBy?: string | null
}

export interface ClimateDataStatus {
  enabled: boolean
  mapsEnabled: boolean
  graphRagEnabled: boolean
  rolloutStage: 'DISABLED' | 'ADMIN' | 'INTERNAL' | 'LIMITED' | 'ALL'
  stale: boolean
  latestSuccessfulSync?: string | null
  stationCount: number
  observationCount: number
  manifestCount: number
  operational?: {
    queries24h: number
    failures24h: number
    cacheHits24h: number
    mapFallbacks24h: number
    p95QueryLatencyMs?: number | null
    routes: Record<string, number>
    queryCacheEntries: number
  }
  latestRun?: {
    id: string
    mode: 'BACKFILL' | 'INCREMENTAL'
    status: 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED'
    stage: string
    rows_processed: number
    failed_batches: number
    error?: string | null
  } | null
  countries: Array<{ code: string; name: string; stations: number }>
}

interface ApiErrorPayload {
  error?: {
    message?: string | string[]
    details?: { message?: string | string[] } | string | string[]
  }
  message?: string | string[]
  detail?: string | string[]
}

function asMessage(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value
  if (Array.isArray(value)) {
    const messages = value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
    if (messages.length) return messages.join(', ')
  }
  return undefined
}

function errorPayloadMessage(payload: ApiErrorPayload | null | undefined): string | undefined {
  const details = typeof payload?.error?.details === 'object' && !Array.isArray(payload.error.details)
    ? payload.error.details
    : undefined

  return (
    asMessage(payload?.error?.message) ||
    asMessage(details?.message) ||
    asMessage(payload?.error?.details) ||
    asMessage(payload?.message) ||
    asMessage(payload?.detail)
  )
}

function normalizeDocumentError(error: unknown, fallback: string): Error {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    return new Error(errorPayloadMessage(error.response?.data) || error.message || fallback)
  }
  if (error instanceof Error) return error
  return new Error(fallback)
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken()
  const response = await fetch(`${API_URL}${ADMIN_PATH}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null) as ApiErrorPayload | null
    throw new Error(errorPayloadMessage(body) || `Request failed (${response.status})`)
  }
  const body = await response.json()
  return body.data ?? body
}

export function useAiDocuments(search: string, status: string) {
  return useQuery({
    queryKey: ['ai-documents', search, status],
    queryFn: () => {
      const params = new URLSearchParams({ page: '1', limit: '100' })
      if (search.trim()) params.set('search', search.trim())
      if (status) params.set('status', status)
      return request<DocumentListResponse>(`/documents?${params}`)
    },
    refetchInterval: (query) => {
      const documents = query.state.data?.documents || []
      return documents.some((document) =>
        ['QUEUED', 'INDEXING', 'DELETE_QUEUED', 'DELETING'].includes(document.status)
      )
        ? 5000
        : false
    },
  })
}

export function useAiDocumentChunks(
  documentId: string | undefined,
  page: number,
  search: string,
  enabled: boolean
) {
  return useQuery({
    queryKey: ['ai-document-chunks', documentId, page, search],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: '25',
      })
      if (search.trim()) params.set('search', search.trim())
      return request<DocumentChunksResponse>(
        `/documents/${documentId}/chunks?${params}`
      )
    },
    enabled: enabled && Boolean(documentId),
  })
}

export function useAiDocumentSummary() {
  return useQuery({
    queryKey: ['ai-document-summary'],
    queryFn: () => request<DocumentSummary>('/summary'),
    refetchInterval: 15000,
  })
}

export function useAiAssistantSettings(enabled: boolean) {
  return useQuery({
    queryKey: ['ai-assistant-settings'],
    queryFn: () => request<AiAssistantSettings>('/settings'),
    enabled,
  })
}

export function useUpdateAiAssistantSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (changes: Partial<Pick<AiAssistantSettings,
      'visualResponsesEnabled' | 'climateDataEnabled' | 'climateMapsEnabled' | 'graphRagEnabled'
      | 'climateRolloutStage'
    >>) =>
      request<AiAssistantSettings>('/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      }),
    onSuccess: (settings) => {
      queryClient.setQueryData(['ai-assistant-settings'], settings)
    },
  })
}

export function useClimateDataStatus() {
  return useQuery({
    queryKey: ['climate-data-status'],
    queryFn: () => request<ClimateDataStatus>('/climate-data/status'),
    refetchInterval: (query) =>
      ['QUEUED', 'RUNNING'].includes(query.state.data?.latestRun?.status || '') ? 5000 : 30000,
  })
}

export function useSyncClimateData() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (mode: 'BACKFILL' | 'INCREMENTAL') =>
      request('/climate-data/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['climate-data-status'] }),
  })
}

function useDocumentMutation<T>(mutationFn: (value: T) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onError: () => undefined,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-documents'] })
      queryClient.invalidateQueries({ queryKey: ['ai-document-summary'] })
    },
  })
}

export function useUploadAiDocument() {
  return useDocumentMutation<{
    file: File
    title?: string
    onProgress?: (percent: number) => void
  }>(async ({ file, title, onProgress }) => {
    const form = new FormData()
    form.append('file', file)
    if (title?.trim()) form.append('title', title.trim())
    try {
      const response = await axios.post(`${API_URL}${ADMIN_PATH}/documents`, form, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
        onUploadProgress: ({ loaded, total }) => {
          if (total) onProgress?.(Math.min(100, Math.round((loaded / total) * 100)))
        },
      })
      return response.data?.data ?? response.data
    } catch (error) {
      throw normalizeDocumentError(error, 'Upload failed')
    }
  })
}

export function useReindexAiDocument() {
  return useDocumentMutation<string>((documentId) =>
    request(`/documents/${documentId}/reindex`, { method: 'POST' })
  )
}

export function useRetryAiDocument() {
  return useDocumentMutation<string>((documentId) =>
    request(`/documents/${documentId}/retry`, { method: 'POST' })
  )
}

export function useDeleteAiDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (documentId: string) => request(`/documents/${documentId}`, { method: 'DELETE' }),
    onMutate: async (documentId) => {
      await queryClient.cancelQueries({ queryKey: ['ai-documents'] })
      queryClient.setQueriesData<DocumentListResponse>(
        { queryKey: ['ai-documents'] },
        (old) => old ? { ...old, documents: old.documents.filter((d) => d.id !== documentId) } : old,
      )
    },
    onError: () => undefined,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-documents'] })
      queryClient.invalidateQueries({ queryKey: ['ai-document-summary'] })
    },
  })
}

export function useRebuildAiIndex() {
  return useDocumentMutation<void>(() => request('/index/rebuild', { method: 'POST' }))
}

export async function openAiDocument(documentId: string) {
  const token = getAccessToken()
  const response = await fetch(`${API_URL}${ADMIN_PATH}/documents/${documentId}/file`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error('Unable to open PDF')
  const url = URL.createObjectURL(await response.blob())
  window.open(url, '_blank', 'noopener,noreferrer')
  window.setTimeout(() => URL.revokeObjectURL(url), 60000)
}
