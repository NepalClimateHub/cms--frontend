import { Columns2, Maximize2, RectangleHorizontal, Square } from 'lucide-react'
import type * as React from 'react'
import type { ImageLayout } from '../../extensions/image/image-attrs'
import { ToolbarButton } from '../toolbar-button'

const OPTIONS: Array<{
  value: ImageLayout
  label: string
  icon: React.ReactNode
}> = [
  { value: 'inline', label: 'Inline', icon: <Square className='size-4' /> },
  {
    value: 'wide',
    label: 'Wide',
    icon: <RectangleHorizontal className='size-4' />,
  },
  {
    value: 'full',
    label: 'Full width',
    icon: <Maximize2 className='size-4' />,
  },
  { value: 'two-up', label: 'Two-up', icon: <Columns2 className='size-4' /> },
]

interface ImageLayoutToggleProps {
  value: ImageLayout
  canSet: (layout: ImageLayout) => boolean
  onChange: (layout: ImageLayout) => void
}

export const ImageLayoutToggle: React.FC<ImageLayoutToggleProps> = ({
  value,
  canSet,
  onChange,
}) => (
  <fieldset aria-label='Image layout' className='flex items-center'>
    {OPTIONS.map(({ value: option, label, icon }) => (
      <ToolbarButton
        key={option}
        type='button'
        aria-label={label}
        pressed={value === option}
        tooltip={
          option === 'two-up' && !canSet(option)
            ? 'Two-up needs an adjacent image'
            : label
        }
        isActive={value === option}
        disabled={value !== option && !canSet(option)}
        onClick={() => onChange(option)}
      >
        {icon}
      </ToolbarButton>
    ))}
  </fieldset>
)
