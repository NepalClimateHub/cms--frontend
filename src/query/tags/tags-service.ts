import { Meta } from '@/schemas/shared'
import Tags, { TagsInitializer, TagsType } from '@/schemas/tags/tags'
import { buildQueryParams } from '@/utils/query-params'
import apiClient from '../apiClient'
import { tags } from '../shared/routes'

export const addTag = async (
  payload: TagsInitializer
): Promise<{
  data: {}
  meta: Meta
}> => {
  const response = await apiClient.post(tags.add.path, payload)
  return response?.data
}

export const getTags = async (
  query: { [k: string]: string | number | string[] | number[] } = {}
): Promise<{
  data: Tags[]
  meta: Meta
}> => {
  const queryParams = buildQueryParams(query)
  const response = await apiClient.get(tags.getall.path, {
    params: queryParams,
  })
  return response?.data
}

export const getTagsByType = async (
  type: TagsType
): Promise<{
  data: Tags[]
  meta: Meta
}> => {
  const response = await apiClient.get(`${tags.getall.path}/${type}`)
  return response?.data
}
