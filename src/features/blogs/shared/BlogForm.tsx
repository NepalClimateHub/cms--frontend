import { useNavigate } from '@tanstack/react-router'
import { type FC, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { BlogFormValues } from '@/schemas/blog'
import { Form } from '@/ui/shadcn/form'
import { BlogAutosaveBanners } from './autosave/BlogAutosaveBanners'
import type { BlogAutosaveConfig } from './autosave/use-blog-autosave'
import { BlogBasicSection } from './BlogBasicSection'
import { BlogContentSection } from './BlogContentSection'
import { BlogDetailsSection } from './BlogDetailsSection'
import { BlogFormFooter } from './BlogFormFooter'
import { BlogMediaSection } from './BlogMediaSection'
import { BlogPreviewModal } from './BlogPreviewModal'
import { BlogStatusBanner } from './BlogStatusBanner'
import { BlogTagsSection } from './BlogTagsSection'
import type { BlogState } from './blog-status'
import { useBlogFormState } from './use-blog-form-state'
import { useBlogRole } from './use-blog-role'

type Props = {
  form: UseFormReturn<BlogFormValues>
  handleFormSubmit: (values: BlogFormValues) => Promise<void>
  isEdit: boolean
  isSaving: boolean
  isTagsLoading?: boolean
  tagsOptions: { value: string; label: string }[]
  blogState?: BlogState
  submitError?: string | null
  autosaveConfig: BlogAutosaveConfig
}

const selectedTagNames = (
  ids: string[] | undefined,
  options: Props['tagsOptions']
) =>
  (ids ?? []).flatMap((id) => {
    const label = options.find((option) => option.value === id)?.label
    return label ? [label] : []
  })

const BlogForm: FC<Props> = (props) => {
  const { form, isEdit, isSaving, isTagsLoading = false, tagsOptions } = props
  const { blogState } = props
  const navigate = useNavigate()
  const { isStaff } = useBlogRole()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const {
    autosave,
    outcome,
    status,
    gate,
    editorProps,
    onSubmit,
    isUploadingBanner,
    setIsUploadingBanner,
  } = useBlogFormState(props)

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className='space-y-8' aria-busy={isSaving}>
        {isEdit && blogState && <BlogStatusBanner blogState={blogState} />}
        <BlogAutosaveBanners
          recovery={autosave.recovery}
          conflict={autosave.conflict}
        />
        <BlogBasicSection form={form} showAuthor={isStaff} />
        <BlogDetailsSection form={form} />
        <BlogContentSection form={form} editorProps={editorProps} />
        <BlogTagsSection
          form={form}
          options={tagsOptions}
          disabled={isSaving || isTagsLoading}
        />
        <BlogMediaSection
          key={autosave.formKey}
          form={form}
          canEditFeatured={isStaff}
          draftHint={outcome.hint}
          onBannerBusyChange={setIsUploadingBanner}
        />
        <BlogFormFooter
          status={status}
          gate={gate}
          submitLabel={outcome.label}
          isSaving={isSaving}
          isSubmitDisabled={isSaving || isTagsLoading || isUploadingBanner}
          onCancel={() => navigate({ to: '/blog/list' })}
          onPreview={() => setIsPreviewOpen(true)}
          onRetryAutosave={autosave.retry}
        />
        <BlogPreviewModal
          open={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          values={form.watch()}
          extras={{ tags: selectedTagNames(form.watch('tagIds'), tagsOptions) }}
        />
      </form>
    </Form>
  )
}

export default BlogForm
