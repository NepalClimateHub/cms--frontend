import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAccessToken } from '@/stores/authStore';

const RAG_API_URL = import.meta.env.VITE_RAG_API_URL || 'http://localhost:8000';

// ============ Types ============

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

export interface ChatResponse {
  response: string;
  conversation_id?: string;
  sources?: Array<{
    source?: string;
    page?: number;
    score?: number;
  }>;
  user_id?: string;
  metadata?: Record<string, unknown>;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatHistoryResponse {
  user_id: string;
  conversations: ChatSession[];
}

export interface ChatSessionMessagesResponse {
  session_id: string;
  messages: Array<{
    role: string;
    content: string;
    created_at: string;
  }>;
}

export interface HealthResponse {
  status: string;
  pipeline_initialized: boolean;
  vector_store_loaded: boolean;
}

// ============ API Client ============

const ragFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAccessToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${RAG_API_URL}${endpoint}`, {
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
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
};

// ============ React Query Hooks ============

export const useClimateChat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: ChatRequest) =>
      ragFetch<ChatResponse>('/chat', {
        method: 'POST',
        body: JSON.stringify(request),
      }),
    onSuccess: () => {
      // Invalidate chat history so list updates with new session/timestamp
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
    }
  });
};

export const useClimateQuery = () => {
  return useMutation({
    mutationFn: (query: string) =>
      ragFetch<ChatResponse>('/query', {
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

export const useChatHistory = () => {
  const token = getAccessToken();

  return useQuery({
    queryKey: ['chat-history'],
    queryFn: () => ragFetch<ChatHistoryResponse>('/chat/history'),
    enabled: !!token,
  });
};

export const useChatSession = (sessionId?: string) => {
  const token = getAccessToken();

  return useQuery({
    queryKey: ['chat-session', sessionId],
    queryFn: () =>
      ragFetch<ChatSessionMessagesResponse>(`/chat/history/${sessionId}`),
    enabled: !!token && !!sessionId,
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      ragFetch<{ message: string }>(`/chat/history/${sessionId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
    },
  });
};
