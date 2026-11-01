import * as React from 'react'
import { Input } from '@/ui/shadcn/input'
import { Label } from '@/ui/shadcn/label'
import {
  IMAGE_TEXT_LIMITS,
  isAltValid,
} from '../../extensions/image/image-attrs'

export interface ImageMeta {
  alt: string
  caption: string
  credit: string
}

interface ImageMetaFieldsProps {
  idPrefix: string
  value: ImageMeta
  onChange: (value: ImageMeta) => void
}

export const ImageMetaFields: React.FC<ImageMetaFieldsProps> = ({
  idPrefix,
  value,
  onChange,
}) => {
  const [altTouched, setAltTouched] = React.useState(false)
  const altInvalid = altTouched && !isAltValid(value.alt)
  const set =
    (key: keyof ImageMeta) => (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...value, [key]: e.target.value })

  return (
    <div className='space-y-3'>
      <div className='space-y-1'>
        <Label htmlFor={`${idPrefix}-alt`}>Alt text (required)</Label>
        <Input
          id={`${idPrefix}-alt`}
          required
          aria-required='true'
          aria-invalid={altInvalid}
          maxLength={IMAGE_TEXT_LIMITS.alt}
          placeholder='Describe the image for screen readers'
          value={value.alt}
          onBlur={() => setAltTouched(true)}
          onChange={set('alt')}
        />
        {altInvalid && (
          <p className='text-sm text-destructive'>Alt text is required.</p>
        )}
      </div>
      <div className='space-y-1'>
        <Label htmlFor={`${idPrefix}-caption`}>Caption (optional)</Label>
        <Input
          id={`${idPrefix}-caption`}
          maxLength={IMAGE_TEXT_LIMITS.caption}
          value={value.caption}
          onChange={set('caption')}
        />
      </div>
      <div className='space-y-1'>
        <Label htmlFor={`${idPrefix}-credit`}>Credit / source (optional)</Label>
        <Input
          id={`${idPrefix}-credit`}
          maxLength={IMAGE_TEXT_LIMITS.credit}
          value={value.credit}
          onChange={set('credit')}
        />
      </div>
    </div>
  )
}
