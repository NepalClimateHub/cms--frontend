import { FC } from 'react'
import { useForm } from 'react-hook-form'
import { UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAddNews, useNewsAPI } from '@/query/news/use-news'
import { useGetTags } from '@/query/tags/use-tags'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import ImageUpload from '@/components/image-upload'
import { MultiSelect } from '@/components/multi-select'
import { AddNewsSchema } from '../../../schemas/news/news'
import { News } from '../../../schemas/news/news'

type Props = {
  form: UseFormReturn<News>
  handleImageUpload: (assetId: string | null, assetURL: string | null) => void
  handleFormSubmit: (values: News) => Promise<void>
  isEdit: boolean
  isLoading: boolean
  tagsOptions: {
    value: string
    label: string
  }[]
}

const NewsForm: FC<Props> = ({
  form,
  handleImageUpload,
  handleFormSubmit,
  isEdit,
  isLoading,
  tagsOptions,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(AddNewsSchema),
  })

  setValue('contributedBy', useAuthStore.getState().user?.fullName)

  const { mutate: addNewsMutation, isPending: isNewsPending } =
    useNewsAPI().addNews
  const handleAddNews = async (data: any) => {
    addNewsMutation({
      body: {
        ...data,
        publishedDate: new Date(data.publishedDate),
      },
    })
  }

  const modeOptions = [
    { value: 'National', label: 'National' },
    { value: 'International', label: 'International' },
    { value: 'Regional', label: 'Regional' },
  ]

  return (
    <div className='mx-auto w-full p-6'>
      <form onSubmit={handleSubmit(handleAddNews)} className='w-full space-y-8'>
        <Card className='w-full'>
          <CardHeader className='pb-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-2'>
                {isNewsPending && (
                  <Loader2 className='h-4 w-4 animate-spin text-blue-600' />
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className='space-y-8'>
            {/* Basic Information */}
            <div className='space-y-6'>
              <h3 className='text-lg font-semibold text-gray-700'>
                Basic Information
              </h3>
              <div className='grid gap-6 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='title' className='text-sm font-medium'>
                    Title <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    type='text'
                    id='title'
                    className='w-full rounded-lg border border-gray-200 bg-white/50 px-4 py-3 focus:border-blue-500 focus:ring-blue-500'
                    placeholder='Enter article title'
                    {...register('title', { required: true })}
                  />
                  {errors.title && (
                    <p className='text-sm text-red-500'>
                      {errors.title?.message?.toString()}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='source' className='text-sm font-medium'>
                    Source <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    type='text'
                    id='source'
                    className='w-full rounded-lg border border-gray-200 bg-white/50 px-4 py-3 focus:border-blue-500 focus:ring-blue-500'
                    placeholder='Kantipur, Ratopati, etc.'
                    {...register('source', { required: true })}
                  />
                  {errors.source && (
                    <p className='text-sm text-red-500'>
                      {errors.source?.message?.toString()}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='mode' className='text-sm font-medium'>
                    Mode <span className='text-red-500'>*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => setValue('mode', value)}
                    defaultValue={modeOptions[0].value}
                  >
                    <SelectTrigger className='w-full rounded-lg border border-gray-200 bg-white/50 px-4 py-3 focus:border-blue-500 focus:ring-blue-500'>
                      <SelectValue placeholder='Select mode' />
                    </SelectTrigger>
                    <SelectContent>
                      {modeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.mode && (
                    <p className='text-sm text-red-500'>
                      {errors.mode?.message?.toString()}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='newsLink' className='text-sm font-medium'>
                    News Link <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    type='url'
                    id='newsLink'
                    className='w-full rounded-lg border border-gray-200 bg-white/50 px-4 py-3 focus:border-blue-500 focus:ring-blue-500'
                    placeholder='https://example.com/news-article'
                    {...register('newsLink', { required: true })}
                  />
                  {errors.newsLink && (
                    <p className='text-sm text-red-500'>
                      {errors.newsLink?.message?.toString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Publication Details */}
            <div className='space-y-6'>
              <h3 className='text-lg font-semibold text-gray-700'>
                Publication Details
              </h3>
              <div className='grid gap-6 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label
                    htmlFor='publishedDate'
                    className='text-sm font-medium'
                  >
                    Published Date <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    type='date'
                    id='publishedDate'
                    className='w-full rounded-lg border border-gray-200 bg-white/50 px-4 py-3 focus:border-blue-500 focus:ring-blue-500'
                    {...register('publishedDate', {
                      required: true,
                      valueAsDate: true,
                      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                        setValue(
                          'publishedYear',
                          new Date(e.target.value).getFullYear()
                        )
                      },
                    })}
                  />
                  {errors.publishedDate && (
                    <p className='text-sm text-red-500'>
                      {errors.publishedDate?.message?.toString()}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label
                    htmlFor='publishedYear'
                    className='text-sm font-medium'
                  >
                    Published Year <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    type='number'
                    disabled={true}
                    id='publishedYear'
                    className='w-full rounded-lg border border-gray-200 bg-white/50 px-4 py-3 focus:border-blue-500 focus:ring-blue-500'
                    {...register('publishedYear', {
                      required: true,
                    })}
                  />
                  {errors.publishedYear && (
                    <p className='text-sm text-red-500'>
                      {errors.publishedYear?.message?.toString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Media & Tags */}
            <div className='space-y-6'>
              <h3 className='text-lg font-semibold text-gray-700'>
                Media & Tags
              </h3>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label className='text-sm font-medium'>Banner Image</Label>
                  <ImageUpload
                    label='Upload banner image'
                    handleImage={handleImageUpload}
                    className='rounded-lg border border-gray-200 p-4'
                  />
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-medium'>News Tags</Label>
                  <MultiSelect
                    options={tagsOptions ?? []}
                    onValueChange={(v: string[]) => setValue('tagIds', v)}
                    placeholder='Select tags'
                    className='w-full rounded-lg border border-gray-200 bg-white/50 px-4 py-3 focus:border-blue-500 focus:ring-blue-500'
                    disabled={isLoading}
                  />
                  {isLoading && (
                    <p className='text-sm text-gray-500'>Loading tags...</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>

          <div className='border-t pt-4'>
            <Button
              type='submit'
              className='w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700'
              disabled={isNewsPending}
            >
              {isNewsPending
                ? 'Adding...'
                : isEdit
                  ? 'Update News'
                  : 'Add News'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}

export default NewsForm
