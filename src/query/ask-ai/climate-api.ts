import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAccessToken } from '@/stores/authStore';

// All API calls go through CMS Backend (API Gateway)
const CMS_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const RAG_API_URL = import.meta.env.VITE_RAG_API_URL || 'http://localhost:8000';


export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  query: string;
  conversation_history?: ChatMessage[];
  conversation_id?: string;
  top_k?: number;
}

export interface ChatSource {
  source?: string;
  documentId?: string;
  chunkId?: string;
  title?: string;
  url?: string;
  page?: number;
  score?: number;
}

export interface ChatResponse {
  response: string;
  conversation_id?: string;
  sources?: ChatSource[];
  user_id?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string; // ISO timestamp from backend
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatHistoryResponse {
  user_id: string;
  conversations: ChatSession[];
}

export interface ChatSessionMessagesResponse {
  session_id: string;
  messages: Array<{
    id?: string;
    role: string;
    content: string;
    sources?: ChatSource[];
    createdAt?: string;
    created_at?: string;
  }>;
}

export interface HealthResponse {
  status: string;
  pipeline_initialized: boolean;
  vector_store_loaded: boolean;
}

export interface UsageResponse {
  used: number;
  limit: number;
  remaining: number;
}

// ============ API Client (CMS Backend) ============

const cmsFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAccessToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${CMS_API_URL}/api/v1${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Session expired. Please login again.');
    }
    throw new Error(await errorPayloadMessage(response));
  }

  const json = await response.json();
  // CMS Backend wraps responses in { data: ..., meta: {} }
  return json.data !== undefined ? json.data : json;
};

const errorPayloadMessage = async (response: Response) => {
  const fallback = response.statusText || `Request failed (${response.status})`;

  try {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await response.json();
      return (
        body?.error?.message ||
        body?.error?.details?.message ||
        body?.message ||
        body?.detail ||
        fallback
      );
    }

    const text = await response.text();
    return text || fallback;
  } catch {
    return fallback;
  }
};

// ============ React Query Hooks ============

export const useClimateChat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: ChatRequest) =>
      cmsFetch<ChatResponse>('/ai-assistant/chat', {
        method: 'POST',
        body: JSON.stringify(request),
      }),
    onSuccess: () => {
      // Invalidate chat history so list updates with new session/timestamp
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
      // Invalidate prompt usage so counter updates
      queryClient.invalidateQueries({ queryKey: ['prompt-usage'] });
    }
  });
};

export const useClimateQuery = () => {
  return useMutation({
    mutationFn: (query: string) =>
      cmsFetch<ChatResponse>('/ai-assistant/chat', {
        method: 'POST',
        body: JSON.stringify({ query, top_k: 5 }),
      }),
  });
};

export const useClimateHealth = () => {
  return useQuery({
    queryKey: ['climate-health'],
    queryFn: () => fetch(`${RAG_API_URL}/health`).then((res) => res.json()) as Promise<HealthResponse>,
    refetchInterval: 30000,
    staleTime: 10000,
  });
};

export const usePromptUsage = () => {
  const token = getAccessToken();

  return useQuery({
    queryKey: ['prompt-usage'],
    queryFn: () => cmsFetch<UsageResponse>('/ai-assistant/usage'),
    enabled: !!token,
    refetchInterval: 60000,
    staleTime: 15000,
  });
};

export const useChatHistory = () => {
  const token = getAccessToken();

  return useQuery({
    queryKey: ['chat-history'],
    queryFn: async () => {
      const sessions = await cmsFetch<ChatSession[]>('/ai-assistant/sessions');
      return {
        user_id: '',
        conversations: sessions,
      } as ChatHistoryResponse;
    },
    enabled: !!token,
  });
};

export const useChatSession = (sessionId?: string) => {
  const token = getAccessToken();

  return useQuery({
    queryKey: ['chat-session', sessionId],
    queryFn: async () => {
      const messages = await cmsFetch<ChatSessionMessagesResponse['messages']>(
        `/ai-assistant/sessions/${sessionId}/messages`
      )
      return {
        session_id: sessionId,
        messages,
      } as ChatSessionMessagesResponse;
    },
    enabled: !!token && !!sessionId,
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      cmsFetch<{ message: string }>(`/ai-assistant/sessions/${sessionId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
    },
  });
};

export const useRenameSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, title }: { sessionId: string; title: string }) =>
      cmsFetch<{ id: string; title: string }>(`/ai-assistant/sessions/${sessionId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
    },
  });
};
