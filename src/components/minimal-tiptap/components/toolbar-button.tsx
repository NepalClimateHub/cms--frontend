import * as React from 'react'
import type { TooltipContentProps } from '@radix-ui/react-tooltip'
import { cn } from '@/ui/shadcn/lib/utils'
import { Toggle } from '@/ui/shadcn/toggle'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/shadcn/tooltip'

interface ToolbarButtonProps
  extends React.ComponentPropsWithoutRef<typeof Toggle> {
  isActive?: boolean
  tooltip?: string
  tooltipOptions?: TooltipContentProps
}

export const ToolbarButton = React.forwardRef<
  HTMLButtonElement,
  ToolbarButtonProps
>(
  (
    { isActive, children, tooltip, className, tooltipOptions, ...props },
    ref
  ) => {
    const toggleButton = (
      <Toggle
        size='sm'
        ref={ref}
        className={cn('size-8 p-0', { 'bg-accent': isActive }, className)}
        {...props}
      >
        {children}
      </Toggle>
    )

    if (!tooltip) {
      return toggleButton
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{toggleButton}</TooltipTrigger>
        <TooltipContent {...tooltipOptions}>
          <div className='flex flex-col items-center text-center'>
            {tooltip}
          </div>
        </TooltipContent>
      </Tooltip>
    )
  }
)

ToolbarButton.displayName = 'ToolbarButton'

export default ToolbarButton
