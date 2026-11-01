import { Monitor, Smartphone } from 'lucide-react'
import { DialogDescription, DialogTitle } from '@/ui/shadcn/dialog'
import { ToggleGroup, ToggleGroupItem } from '@/ui/shadcn/toggle-group'
import type { PreviewView } from './BlogPreviewFrame'

type Props = {
  view: PreviewView
  onViewChange: (view: PreviewView) => void
}

export function BlogPreviewToolbar({ view, onViewChange }: Props) {
  return (
    <div className='flex items-center justify-between gap-3 border-b px-4 py-3 pr-12'>
      <div className='min-w-0'>
        <DialogTitle className='text-base'>Blog preview</DialogTitle>
        <DialogDescription className='text-xs'>
          Rendered by the public site using your current, unsaved changes.
        </DialogDescription>
      </div>
      <ToggleGroup
        type='single'
        variant='outline'
        size='sm'
        value={view}
        onValueChange={(next) => next && onViewChange(next as PreviewView)}
        aria-label='Preview device'
      >
        <ToggleGroupItem
          value='desktop'
          aria-label='Desktop preview, 1280 pixels wide'
        >
          <Monitor />
        </ToggleGroupItem>
        <ToggleGroupItem
          value='mobile'
          aria-label='Mobile preview, 390 pixels wide'
        >
          <Smartphone />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
