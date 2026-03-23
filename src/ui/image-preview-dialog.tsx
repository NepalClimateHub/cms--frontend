import { FC } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/shadcn/dialog'

interface ImagePreviewDialogProps {
  src: string
  alt: string
  trigger: React.ReactNode
}

export const ImagePreviewDialog: FC<ImagePreviewDialogProps> = ({
  src,
  alt,
  trigger,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='max-w-3xl border-none bg-transparent p-0 shadow-none [&>button]:right-2 [&>button]:top-2 [&>button]:flex [&>button]:h-8 [&>button]:w-8 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:bg-white [&>button]:p-0 [&>button]:text-black [&>button]:opacity-100 [&>button]:shadow-lg [&>button]:hover:bg-gray-100 [&>button_svg]:h-4 [&>button_svg]:w-4'>
        <DialogHeader className='sr-only'>
          <DialogTitle>{alt}</DialogTitle>
        </DialogHeader>
        <div className='relative flex items-center justify-center overflow-hidden rounded-lg outline-none'>
          <img
            src={src}
            alt={alt}
            className='h-auto max-h-[85vh] w-full object-contain'
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
