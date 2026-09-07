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
  aiAssistantControllerUpdateSession,
} from '@/api/sdk.gen';
import type { ChatRequestDto as ApiChatRequestDto } from '@/api/types.gen';
export { buildRecentConversationHistory } from './conversation-history';
export {
  parseVisualDecision,
  parseVisualMetadata,
  parseVisualSpec,
  visualDecisionCategorySchema,
  visualDecisionReasonSchema,
  visualDecisionSchema,
  visualDecisionStatusSchema,
  visualSpecSchema,
} from './visual-contracts';
export type { VisualDecision, VisualSpec } from './visual-contracts';

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

export interface ChatSource {
  sourceType?: 'document' | 'dataset' | 'graph'
  source?: string;
  title?: string;
  url?: string;
  documentId?: string;
  chunkId?: string;
  page?: number;
  score?: number;
  datasetId?: string;
  coverageStart?: string;
  coverageEnd?: string;
  synchronizedAt?: string | null;
}

export interface ChatResponse {
  response: string;
  conversation_id?: string;
  sources?: ChatSource[];
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
    sources?: ChatSource[];
    metadata?: Record<string, unknown>;
    createdAt: string;
  }>;
}

export interface HealthResponse {
  status: string;
  pipeline_initialized: boolean;
  vector_store_loaded: boolean;
}

export async function reportClimateClientMetric(event: 'map_fallback') {
  const token = getAccessToken()
  const baseUrl = (env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')
  if (!token) return
  await fetch(`${baseUrl}/api/v1/ai-assistant/climate-data/metrics`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ event }),
    keepalive: true,
  }).catch(() => undefined)
}

function apiErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }
  return fallback;
}

function envelopeData(value: unknown): unknown {
  if (value && typeof value === 'object' && 'data' in value) {
    return value.data;
  }
  return undefined;
}

function unwrapApiData<T>(value: unknown): T {
  return (envelopeData(value) ?? value) as T;
}

// ============ React Query Hooks (Refactored to SDK) ============

export const useClimateChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: ChatRequest) => {
      const response = await aiAssistantControllerChat({
        body: request as ApiChatRequestDto,
      });
      if (response.error) {
        throw new Error(apiErrorMessage(response.error, 'Failed to communicate with AI'));
      }
      return unwrapApiData<ChatResponse>(response.data);
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
        body: { query, top_k: 5 },
      });
      if (response.error) {
        throw new Error(apiErrorMessage(response.error, 'Failed to query AI'));
      }
      return unwrapApiData<ChatResponse>(response.data);
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
    select: (sessions) => ({
      user_id: '',
      conversations: (envelopeData(sessions) || []) as ChatSession[],
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
    select: (messages) => ({
      session_id: sessionId,
      messages: (envelopeData(messages) || []) as ChatSessionMessagesResponse['messages'],
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
        throw new Error(apiErrorMessage(response.error, 'Failed to delete session'));
      }
      return unwrapApiData<{ message: string }>(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiAssistantControllerGetSessions'] });
    },
  });
};

export const useRenameSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, title }: { sessionId: string; title: string }) => {
      const response = await aiAssistantControllerUpdateSession({
        path: { sessionId },
        body: { title },
      });
      if (response.error) {
        throw new Error(apiErrorMessage(response.error, 'Failed to rename session'));
      }
      return envelopeData(response.data) ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiAssistantControllerGetSessions'] });
    },
  });
};
