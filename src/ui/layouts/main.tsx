import React from 'react'
import { cn } from '@/ui/shadcn/lib/utils'

interface MainProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
  isHome?: boolean
}

export const Main = ({ fixed, className, isHome, ...props }: MainProps) => {
  return (
    <main
      className={cn(
        'peer-[.header-fixed]/header',
        isHome ? 'px-4 py-6' : 'px-4 py-6 pb-12 md:px-8',
        fixed && 'fixed-main flex flex-grow flex-col overflow-hidden',
        className
      )}
      {...props}
    />
  )
}

Main.displayName = 'Main'
