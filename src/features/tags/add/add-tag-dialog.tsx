'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { tagFormSchema, TagFormValues, TagsInitializer } from '@/schemas/tags/tags'
import { TagForm } from '../shared/TagAddEditForm'
import { useAddTag } from '@/query/tags/use-tags'

interface Props {
  open: boolean
  onClose: VoidFunction
}

export function AddTagDialog({ open, onClose }: Props) {
  const addTagMutation = useAddTag()

  const form = useForm<TagFormValues>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      tag: '',
      tagType: 'isUserTag'
    }
  })

  const onSubmit = async (values: TagsInitializer) => {
    await addTagMutation.mutateAsync(values);
    form.reset()
    onClose()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-left'>
          <DialogTitle>{'Add New Tag'}</DialogTitle>
          <DialogDescription>
            {'Create new tag here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div>
          <TagForm
            form={form}
            onSubmit={onSubmit}
          />
        </div>
        <DialogFooter>
          <Button loading={addTagMutation.isPending} type='submit' form='tag-form'>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
