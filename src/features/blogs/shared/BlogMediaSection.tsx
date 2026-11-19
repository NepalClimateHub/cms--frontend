import type { FC } from 'react'
import ImageUpload from '@/ui/image-upload'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/shadcn/card'
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/shadcn/form'
import type { BlogSectionProps } from './BlogSectionProps'
import { BlogSwitchField } from './BlogSwitchField'

type Props = BlogSectionProps & {
  canEditFeatured: boolean
  draftHint: string
  onBannerBusyChange: (busy: boolean) => void
}

export const BlogMediaSection: FC<Props> = ({
  form,
  canEditFeatured,
  draftHint,
  onBannerBusyChange,
}) => {
  const handleBanner = (id: string | null, url: string | null) => {
    form.setValue('bannerImageId', id ?? '', { shouldDirty: true })
    form.setValue('bannerImageUrl', url ?? '', { shouldDirty: true })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Media & Settings</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        <FormField
          control={form.control}
          name='bannerImageId'
          render={() => (
            <FormItem>
              <FormLabel>Banner Image</FormLabel>
              <FormDescription>
                Upload, replace, or remove the banner image for your blog
              </FormDescription>
              <ImageUpload
                label='Upload banner image'
                handleImage={handleBanner}
                initialImageId={form.getValues('bannerImageId')}
                initialImageUrl={form.getValues('bannerImageUrl')}
                inputId='banner-image-upload'
                onBusyChange={onBannerBusyChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <div
          className={`grid grid-cols-1 gap-6 ${canEditFeatured ? 'md:grid-cols-2' : ''}`}
        >
          <BlogSwitchField
            form={form}
            name='isDraft'
            label='Draft Status'
            description={draftHint}
          />
          {canEditFeatured && (
            <>
              <BlogSwitchField
                form={form}
                name='isFeatured'
                label='Featured Blog'
                description='Mark this blog as featured'
              />
              <BlogSwitchField
                form={form}
                name='isTopRead'
                label='Top Read'
                description='Mark this blog as a top read'
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
