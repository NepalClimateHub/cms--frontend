import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAddNews } from '@/query/news/use-news'
import { useGetTags } from '@/query/tags/use-tags'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  })) as {
    value: string
    label: string
  }[] | undefined;

  const { mutate: addNewsMutation, isPending: isNewsPending } = useAddNews()
  const handleAddNews = async (data: any) => {
    addNewsMutation({
      body: {
        ...data,
        publishedDate: new Date(data.publishedDate),
      },
    })
  }

  return (
    <div className='mx-auto w-full p-6'>
      <form onSubmit={handleSubmit(handleAddNews)} className='w-full space-y-8'>
        <Card className='w-full'>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-6 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='title' className='text-sm font-medium'>
                Title
              </Label>
              <Input
                type='text'
                id='title'
                className='w-full'
                placeholder='Enter article title'
                {...register('title', { required: true })}
              />
              {errors.title && (
                <p className='text-sm text-destructive'>
                  {errors.title?.message?.toString()}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='source' className='text-sm font-medium'>
                Source
              </Label>
              <Input
                type='text'
                id='source'
                placeholder='Kantipur, Ratopati, etc.'
                {...register('source', { required: true })}
              />
              {errors.source && (
                <p className='text-sm text-destructive'>
                  {errors.source?.message?.toString()}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='mode' className='text-sm font-medium'>
                Mode
              </Label>
              <Input
                type='text'
                id='mode'
                placeholder='Online, Offline, etc.'
                {...register('mode', { required: true })}
              />
              {errors.mode && (
                <p className='text-sm text-destructive'>
                  {errors.mode?.message?.toString()}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='newsLink' className='text-sm font-medium'>
                News Link
              </Label>
              <Input
                type='url'
                id='newsLink'
                placeholder='https://example.com/news-article'
                {...register('newsLink', { required: true })}
              />
              {errors.newsLink && (
                <p className='text-sm text-destructive'>
                  {errors.newsLink?.message?.toString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publication Details</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-6 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='publishedDate' className='text-sm font-medium'>
                Published Date
              </Label>
              <Input
                type='date'
                id='publishedDate'
                {...register('publishedDate', {
                  required: true,
                  valueAsDate: true,
                })}
              />
              {errors.publishedDate && (
                <p className='text-sm text-destructive'>
                  {errors.publishedDate?.message?.toString()}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='publishedYear' className='text-sm font-medium'>
                Published Year
              </Label>
              <Input
                type='date'
                id='publishedYear'
                {...register('publishedYear', {
                  required: true,
                  valueAsDate: true,
                })}
              />
              {errors.publishedYear && (
                <p className='text-sm text-destructive'>
                  {errors.publishedYear?.message?.toString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Media & Tags</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='space-y-2'>
              <Label className='text-sm font-medium'>Banner Image</Label>
              <ImageUpload
                label='Upload banner image'
                handleImage={handleImageUpload}
              />
            </div>

            <div className='space-y-2'>
              <Label className='text-sm font-medium'>News Tags</Label>
              <MultiSelect
                options={tagsOptions ?? []}
                onValueChange={(v: string[]) => setValue('tagIds', v)}
                placeholder='Select tags'
                className='w-full'
                disabled={isLoadingTags}
              />
            </div>
          </CardContent>
        </Card>

        <div className='flex justify-end'>
          <Button
            type='submit'
            className='min-w-[120px]'
            disabled={isNewsPending}
          >
            {isNewsPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Adding...
              </>
            ) : (
              'Submit Article'
            )}
          </Button>
        </div>
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
