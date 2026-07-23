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
import { z } from 'zod';

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
  source?: string;
  title?: string;
  url?: string;
  documentId?: string;
  chunkId?: string;
  page?: number;
  score?: number;
}

const visualBaseItemSchema = z.object({
  label: z.string().trim().min(1).max(60),
  sourceIndex: z.number().int().min(1).max(3),
}).strict();

const emissionsProjectionItemSchema = visualBaseItemSchema.extend({
  year: z.string().regex(/^\d{4}$/),
  value: z.number(),
  unit: z.string().trim().min(1).max(24).optional(),
}).strict();

const canonicalVisualSpecSchema = z.discriminatedUnion('type', [
  z.object({
    version: z.literal(1),
    type: z.literal('metric_strip'),
    title: z.string().trim().min(1).max(80).optional(),
    items: z.array(visualBaseItemSchema.extend({
      value: z.string().trim().min(1).max(32),
    }).strict()).min(2).max(5),
  }).strict(),
  z.object({
    version: z.literal(1),
    type: z.literal('policy_timeline'),
    title: z.string().trim().min(1).max(80).optional(),
    items: z.array(visualBaseItemSchema.extend({
      year: z.string().regex(/^\d{4}$/),
    }).strict()).min(2).max(5),
  }).strict(),
  z.object({
    version: z.literal(1),
    type: z.literal('sector_grid'),
    title: z.string().trim().min(1).max(80).optional(),
    items: z.array(visualBaseItemSchema).min(2).max(8),
  }).strict(),
  z.object({
    version: z.literal(1),
    type: z.literal('document_comparison'),
    title: z.string().trim().min(1).max(80).optional(),
    columns: z.array(z.object({
      label: z.string().trim().min(1).max(60),
      sourceIndex: z.number().int().min(1).max(3),
    }).strict()).length(2),
    rows: z.array(z.object({
      label: z.string().trim().min(1).max(60),
      values: z.array(z.string().trim().min(1).max(100)).length(2),
    }).strict()).min(2).max(5),
  }).strict(),
  z.object({
    version: z.literal(1),
    type: z.literal('process_stepper'),
    title: z.string().trim().min(1).max(80).optional(),
    items: z.array(z.object({
      step: z.number().int().min(1).max(6),
      label: z.string().trim().min(1).max(100),
      sourceIndex: z.number().int().min(1).max(3),
    }).strict()).min(2).max(6),
  }).strict(),
  z.object({
    version: z.literal(1),
    type: z.literal('emissions_projection'),
    title: z.string().trim().min(1).max(80).optional(),
    yAxisLabel: z.string().trim().min(1).max(60).optional(),
    items: z.array(emissionsProjectionItemSchema).min(2).max(8),
  }).strict(),
]).superRefine((visual, context) => {
  if (visual.type !== 'process_stepper') return

  const steps = visual.items.map((item) => item.step)
  if (new Set(steps).size !== steps.length) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Process steps must be unique',
      path: ['items'],
    })
  }
});

export const visualSpecSchema = z.preprocess((value) => {
  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    (value as Record<string, unknown>).type === 'sector_chips'
  ) {
    return { ...(value as Record<string, unknown>), type: 'sector_grid' }
  }
  return value
}, canonicalVisualSpecSchema);

export type VisualSpec = z.infer<typeof visualSpecSchema>;

export function parseVisualSpec(metadata?: Record<string, unknown>): VisualSpec | undefined {
  const parsed = visualSpecSchema.safeParse(metadata?.visual);
  return parsed.success ? parsed.data : undefined;
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
        body: request as unknown as ApiChatRequestDto,
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
