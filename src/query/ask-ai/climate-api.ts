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
    role: string;
    content: string;
    createdAt: string;
  }>;
}

export interface HealthResponse {
  status: string;
  pipeline_initialized: boolean;
  vector_store_loaded: boolean;
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
    throw new Error(`API error: ${response.statusText}`);
  }

  const json = await response.json();
  // CMS Backend wraps responses in { data: ..., meta: {} }
  return json.data !== undefined ? json.data : json;
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
      const messages = await cmsFetch<any[]>(`/ai-assistant/sessions/${sessionId}/messages`);
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

