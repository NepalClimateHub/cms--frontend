import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  opportunityControllerDeleteOpportunityMutation,
  opportunityControllerGetOpportunitiesOptions,
  opportunityControllerGetOneOpportunityOptions,
  opportunityControllerUpdateOpportunityMutation,
} from '@/api/@tanstack/react-query.gen'
import { useFilters } from '@/hooks/use-filters'
import { usePagination } from '@/hooks/use-pagination'
import { toast } from '@/hooks/use-toast'
import { opportunitiesFilterOptions } from '@/features/oppourtunities/list/opportunities-filter-options'
import { opportunityControllerAddOpportutnityMutation } from '../../api/@tanstack/react-query.gen'

export const useGetOpportunityById = (id: string) => {
  return useQuery({
    ...opportunityControllerGetOneOpportunityOptions({
      path: {
        id,
      },
    }),
  })
}

export function useOpportunityAPI() {
  const queryClient = useQueryClient()

  return {
    addOpportunity: useMutation({
      ...opportunityControllerAddOpportutnityMutation(),

      onSuccess: () => {
        toast({
          variant: 'default',
          title: 'Opportunity added successfully.',
        })
        queryClient.invalidateQueries(
          // @ts-expect-error - TODO: check type
          opportunityControllerGetOpportunitiesOptions()
        )
      },
    }),
    updateOpportunity: useMutation({
      ...opportunityControllerUpdateOpportunityMutation(),
      onSuccess: () => {
        toast({
          variant: 'default',
          title: 'Opportunity updated successfully.',
        })
        queryClient.invalidateQueries(
          // @ts-expect-error - TODO: check type
          opportunityControllerGetOpportunitiesOptions()
        )
      },
    }),
  }
}

export const useGetOpportunity = (pagination: any, filters: any) => {
  return useQuery({
    ...opportunityControllerGetOpportunitiesOptions({
      query: {
        ...pagination,
        ...filters,
      },
    }),
  })
}

export const useDeleteOpportunity = () => {
  const queryClient = useQueryClient()

  const paginationOptions = usePagination()
  const filterOptions = useFilters(opportunitiesFilterOptions)

  const { pagination } = paginationOptions
  const { filters } = filterOptions

  return useMutation({
    ...opportunityControllerDeleteOpportunityMutation(),

    onSuccess: () => {
      toast({
        variant: 'default',
        title: 'Opportunity removed successfully.',
      })

      queryClient.invalidateQueries(
        opportunityControllerGetOpportunitiesOptions({
          // @ts-expect-error - TODO: check type
          query: {
            ...pagination,
            ...filters,
          },
        })
      )
    },
  })
}
