import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAddNews } from '@/query/news/use-news'
import { useGetTags } from '@/query/tags/use-tags'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ImageUpload from '@/components/image-upload'
import { MultiSelect } from '@/components/multi-select'
import { AddNewsSchema } from '../../../schemas/news/news'

const NewsForm = () => {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(AddNewsSchema),
  })

  setValue('contributedBy', useAuthStore.getState().user?.fullName)
  const handleImageUpload = (
    assetId: string | null,
    assetURL: string | null
  ) => {
    setValue('bannerImageId', assetId)
    setValue('bannerImageUrl', assetURL)
  }

  const { data, isLoading: isLoadingTags } = useGetTags({
    query: {
      isNewsTag: true,
    },
  })
  const tagsOptions = data?.data?.map((tag) => ({
    value: tag.id,
    label: tag.tag,
  }))

  console.log('form errors', errors)
  const { mutate: addNewsMutation, isPending: isNewsPending } = useAddNews()
  const handleAddNews = async (data: any) => {
    console.log('Form data:', data)
    // Add your form submission logic here
    addNewsMutation({
      body: {
        ...data,
        publishedDate: new Date(data.publishedDate),
      },
    })
  }
  return (
    <div>
      <form
        onSubmit={handleSubmit(handleAddNews)}
        className='flex flex-col gap-4'
      >
        <div>
          <Label htmlFor='title'>Title</Label>
          <Input
            type='text'
            id='title'
            {...register('title', { required: true })}
          />
          {errors.title && (
            <p className='text-sm text-red-500'>
              {errors.title?.message?.toString()}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor='source'>Source</Label>
          <Input
            type='text'
            id='source'
            placeholder='Kantipur, Ratopati, etc.'
            {...register('source', { required: true })}
          />
          {errors.source && (
            <p className='text-sm text-red-500'>
              {errors.source?.message?.toString()}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor='mode'>Mode</Label>
          <Input
            type='text'
            id='mode'
            placeholder='Online, Offline, etc.'
            {...register('mode', { required: true })}
          />
          {errors.mode && (
            <p className='text-sm text-red-500'>
              {errors.mode?.message?.toString()}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor='publishedDate'>Published Date</Label>
          <Input
            type='date'
            id='publishedDate'
            {...register('publishedDate', {
              required: true,
              valueAsDate: true,
            })}
          />
          {errors.publishedDate && (
            <p className='text-sm text-red-500'>
              {errors.publishedDate?.message?.toString()}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor='publishedYear'>Published Year</Label>
          <Input
            type='date'
            id='publishedYear'
            {...register('publishedYear', {
              required: true,
              valueAsDate: true,
            })}
          />
          {errors.publishedYear && (
            <p className='text-sm text-red-500'>
              {errors.publishedYear?.message?.toString()}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor='newsLink'>News Link</Label>
          <Input
            type='url'
            id='newsLink'
            placeholder='https://example.com/news-article'
            {...register('newsLink', { required: true })}
          />
          {errors.newsLink && (
            <p className='text-sm text-red-500'>
              {errors.newsLink?.message?.toString()}
            </p>
          )}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>News Banner</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              label={'Banner image'}
              handleImage={handleImageUpload}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>News Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <MultiSelect
              options={tagsOptions || []}
              onValueChange={(v) => {
                console.log('selected tags', v)
                setValue('tagIds', v)
              }}
              placeholder={'Select tags'}
              className='w-full'
              disabled={isLoadingTags}
            />
          </CardContent>
        </Card>

        <Button type='submit'>
          {isNewsPending ? 'Adding News ..' : 'Submit'}
        </Button>
      </form>
    </div>
  )
}

export default NewsForm

// @ApiPropertyOptional({
//   description: "Tags IDs",
//   type: [String],
//   required: false,
// })
// @IsOptional()
// tagIds?: string[];

// @ApiProperty({
//   description: "Contributed by",
//   example: "admin",
// })
// @IsString()
// contributedBy: string;
