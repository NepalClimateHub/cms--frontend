import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  opportunityControllerDeleteOpportunityMutation,
  opportunityControllerGetOpportunitiesOptions,
} from '@/api/@tanstack/react-query.gen'
import { useFilters } from '@/hooks/use-filters'
import { usePagination } from '@/hooks/use-pagination'
import { toast } from '@/hooks/use-toast'
import { opportunitiesFilterOptions } from '@/features/oppourtunities/list/opportunities-filter-options'

export const useDeleteOpportunity = () => {
  const queryClient = useQueryClient()

  const paginationOptions = usePagination()
  const filterOptions = useFilters(opportunitiesFilterOptions)

  return useMutation({
    ...opportunityControllerDeleteOpportunityMutation(),
    onSuccess: () => {
      toast({
        variant: 'success',
        title: 'Opportunity removed successfully.',
      })

      queryClient.invalidateQueries(
        opportunityControllerGetOpportunitiesOptions({
          // @ts-expect-error - TODO: check type
          query: {
            ...paginationOptions,
            ...filterOptions,
          },
        })
      )
    },
  })
}
