import { useMutation, useQuery } from '@tanstack/react-query'

// Mock blog types - these should be replaced with actual API types when available
export interface BlogResponseDto {
  id: string
  title: string
  content: string
  excerpt?: string
  author: string
  category: string
  readingTime?: string
  publishedDate?: string
  isDraft: boolean
  isFeatured: boolean
  bannerImageUrl?: string
  bannerImageId?: string
  tags?: Array<string>
  createdAt: string
  updatedAt: string
}

export interface CreateBlogDto {
  title: string
  content: string
  excerpt?: string
  author: string
  category: string
  readingTime?: string
  publishedDate?: string
  isDraft?: boolean
  isFeatured?: boolean
  bannerImageUrl?: string
  bannerImageId?: string
  tagIds?: Array<string>
}

export interface UpdateBlogDto extends CreateBlogDto {
  isDraft?: boolean
}

export interface BlogArrayApiResponse {
  data: Array<BlogResponseDto>
  meta: {
    count?: number
    additionalInfo?: unknown
  }
}

export interface BlogApiResponse {
  data: BlogResponseDto
  meta: {
    count?: number
    additionalInfo?: unknown
  }
}

// Mock API functions - these should be replaced with actual API calls
const mockBlogs: BlogResponseDto[] = [
  {
    id: '1',
    title: 'Climate Change in Nepal',
    content:
      '<p>This is a sample blog content about climate change in Nepal...</p>',
    excerpt: 'An overview of climate change impacts in Nepal',
    author: 'John Doe',
    category: 'Climate Science',
    readingTime: '5 min read',
    publishedDate: '2024-01-15',
    isDraft: false,
    isFeatured: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Sustainable Development Goals',
    content: '<p>Understanding the SDGs and their implementation...</p>',
    excerpt: 'A comprehensive guide to SDGs',
    author: 'Jane Smith',
    category: 'Development',
    readingTime: '8 min read',
    publishedDate: '2024-01-10',
    isDraft: true,
    isFeatured: false,
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-10T09:00:00Z',
  },
]

export const useGetBlogs = (pagination?: any, filters?: any) => {
  return useQuery({
    queryKey: ['blogs', pagination, filters],
    queryFn: async () => {
      // Mock API call - replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 500))

      let filteredBlogs = [...mockBlogs]

      if (filters?.title) {
        filteredBlogs = filteredBlogs.filter((blog) =>
          blog.title.toLowerCase().includes(filters.title.toLowerCase())
        )
      }

      return {
        data: filteredBlogs,
        meta: {
          count: filteredBlogs.length,
        },
      } as BlogArrayApiResponse
    },
  })
}

export const useGetBlogById = (id: string) => {
  return useQuery({
    queryKey: ['blog', id],
    queryFn: async () => {
      // Mock API call - replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 300))

      const blog = mockBlogs.find((b) => b.id === id)
      if (!blog) {
        throw new Error('Blog not found')
      }

      return {
        data: blog,
        meta: {},
      } as BlogApiResponse
    },
    enabled: !!id,
  })
}

export const useBlogAPI = () => {
  //   const apiClient = useApiClient()

  const addBlog = useMutation({
    mutationFn: async (data: { body: CreateBlogDto }) => {
      //   await new Promise((resolve) => setTimeout(resolve, 1000))

      const newBlog: BlogResponseDto = {
        id: Date.now().toString(),
        ...data.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      mockBlogs.push(newBlog)

      return {
        data: newBlog,
        meta: {},
      } as BlogApiResponse
    },
  })

  const updateBlog = useMutation({
    mutationFn: async (data: { path: { id: string }; body: UpdateBlogDto }) => {
      // Mock API call - replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const index = mockBlogs.findIndex((b) => b.id === data.path.id)
      if (index === -1) {
        throw new Error('Blog not found')
      }

      mockBlogs[index] = {
        ...mockBlogs[index],
        ...data.body,
        updatedAt: new Date().toISOString(),
      }

      return {
        data: mockBlogs[index],
        meta: {},
      } as BlogApiResponse
    },
  })

  const deleteBlog = useMutation({
    mutationFn: async (data: { path: { id: string } }) => {
      // Mock API call - replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const index = mockBlogs.findIndex((b) => b.id === data.path.id)
      if (index === -1) {
        throw new Error('Blog not found')
      }

      const deletedBlog = mockBlogs.splice(index, 1)[0]

      return {
        data: deletedBlog,
        meta: {},
      } as BlogApiResponse
    },
  })

  return {
    addBlog,
    updateBlog,
    deleteBlog,
  }
}

export const useDeleteBlog = () => {
  //   const apiClient = useApiClient()

  return useMutation({
    mutationFn: async (data: { path: { id: string } }) => {
      // Mock API call - replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const index = mockBlogs.findIndex((b) => b.id === data.path.id)
      if (index === -1) {
        throw new Error('Blog not found')
      }

      const deletedBlog = mockBlogs.splice(index, 1)[0]

      return {
        data: deletedBlog,
        meta: {},
      } as BlogApiResponse
    },
  })
}
