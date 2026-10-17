import type * as React from 'react'

interface ImageFigcaptionProps {
  caption: string | null
  credit: string | null
  altMissing: boolean
}

export const ImageFigcaption: React.FC<ImageFigcaptionProps> = ({
  caption,
  credit,
  altMissing,
}) => (
  <>
    {altMissing && (
      <p className='mt-1 text-center text-xs text-destructive'>
        Alt text required
      </p>
    )}
    {(caption || credit) && (
      <figcaption className='mt-2 text-sm italic text-muted-foreground'>
        {caption}
        {credit && <cite className='block text-xs not-italic'>{credit}</cite>}
      </figcaption>
    )}
  </>
)
