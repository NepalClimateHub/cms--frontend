
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/api/client.gen';
import { toast } from 'sonner';

export enum CategoryType {
  BLOG = 'BLOG',
  NEWS = 'NEWS',
  EVENTS = 'EVENTS',
  OPPORTUNITY = 'OPPORTUNITY',
  PROJECT = 'PROJECT',
  RESOURCE = 'RESOURCE',
  ORGANIZATION = 'ORGANIZATION'
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  type: CategoryType;
  createdAt: string;
  updatedAt: string;
}

export interface CategorySearchParams {
  offset?: number;
  limit?: number;
  name?: string;
  type?: CategoryType;
  [key: string]: unknown;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  type: CategoryType;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export const useGetCategories = (params: CategorySearchParams) => {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: async () => {
      const { data } = await client.get({
        url: '/api/v1/categories',
        query: params,
      });
      return data as any;
    },
  });
};

export const useGetCategory = (id: string) => {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: async () => {
      const { data } = await client.get({
        url: `/api/v1/categories/${id}`,
      });
      return (data as any).data;
    },
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category: CreateCategoryDto) => {
      const { data } = await client.post({
        url: '/api/v1/categories',
        body: category,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create category');
    },
  });
};

export const useUpdateCategory = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category: UpdateCategoryDto) => {
      const { data } = await client.patch({
        url: `/api/v1/categories/${id}`,
        body: category,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update category');
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await client.delete({
        url: `/api/v1/categories/${id}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete category');
    },
  });
};
