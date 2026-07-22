import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAccessToken } from '@/stores/authStore';
import { env } from '@/config/env.config';
import {
  aiAssistantControllerGetSessionsOptions,
  aiAssistantControllerGetMessagesOptions,
} from '@/api/@tanstack/react-query.gen';
import {
  aiAssistantControllerDeleteSession,
  aiAssistantControllerChat,
} from '@/api/sdk.gen';

// Constants
const RAG_API_URL = env.VITE_RAG_API_URL;

// Type definitions (exported for backward compatibility)
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
  createdAt?: string;
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

// ============ React Query Hooks (Refactored to SDK) ============

export const useClimateChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: ChatRequest) => {
      const response = await aiAssistantControllerChat({
        body: request as any,
      });
      if (response.error) {
        throw new Error((response.error as any)?.message || 'Failed to communicate with AI');
      }
      return response.data as ChatResponse;
    },
    onSuccess: () => {
      // Invalidate chat history so list updates with new session/timestamp
      queryClient.invalidateQueries({ queryKey: ['aiAssistantControllerGetSessions'] });
    }
  });
};

export const useClimateQuery = () => {
  return useMutation({
    mutationFn: async (query: string) => {
      const response = await aiAssistantControllerChat({
        body: { query, top_k: 5 } as any,
      });
      if (response.error) {
        throw new Error((response.error as any)?.message || 'Failed to query AI');
      }
      return response.data as ChatResponse;
    },
  });
};

export const useClimateHealth = () => {
  return useQuery({
    queryKey: ['climate-health'],
    queryFn: () => fetch(`${RAG_API_URL}/health`).then((res) => res.json()) as Promise<HealthResponse>,
    refetchInterval: 30000,
    staleTime: 10000,
    meta: { ignoreGlobalError: true },
  });
};

export const useChatHistory = () => {
  const token = getAccessToken();

  return useQuery({
    ...aiAssistantControllerGetSessionsOptions(),
    enabled: !!token,
    select: (sessions: any) => ({
      user_id: '',
      conversations: (sessions?.data || []) as ChatSession[],
    }),
    meta: { ignoreGlobalError: true },
  });
};

export const useChatSession = (sessionId?: string) => {
  const token = getAccessToken();

  return useQuery({
    ...aiAssistantControllerGetMessagesOptions({
      path: {
        sessionId: sessionId || '',
      },
    }),
    enabled: !!token && !!sessionId,
    select: (messages: any) => ({
      session_id: sessionId,
      messages: (messages?.data || []) as ChatSessionMessagesResponse['messages'],
    }),
    meta: { ignoreGlobalError: true },
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await aiAssistantControllerDeleteSession({
        path: {
          sessionId,
        },
      });
      if (response.error) {
        throw new Error((response.error as any)?.message || 'Failed to delete session');
      }
      return response.data as { message: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiAssistantControllerGetSessions'] });
    },
  });
};
