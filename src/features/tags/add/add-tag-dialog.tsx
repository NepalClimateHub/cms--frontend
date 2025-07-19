'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAddTags } from '@/query/tags/use-tags'
import {
  tagFormSchema,
  TagFormValues,
  TagsInitializer,
} from '@/schemas/tags/tags'
import { Button } from '@/ui/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/shadcn/dialog'
import { TagForm } from '../shared/TagAddEditForm'

interface Props {
  open: boolean
  onClose: VoidFunction
}

export function AddTagDialog({ open, onClose }: Props) {
  const addTagMutation = useAddTags()

  const form = useForm<TagFormValues>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      tag: '',
      tagType: 'isUserTag',
    },
  })

  const onSubmit = async (values: TagsInitializer) => {
    await addTagMutation.mutate({
      body: {
        ...values,
      },
    })
    form.reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-left'>
          <DialogTitle>{'Add New Tag'}</DialogTitle>
          <DialogDescription>
            {'Create new tag here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div>
          <TagForm form={form} onSubmit={onSubmit} />
        </div>
        <DialogFooter>
          <Button
            loading={addTagMutation.isPending}
            type='submit'
            form='tag-form'
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
