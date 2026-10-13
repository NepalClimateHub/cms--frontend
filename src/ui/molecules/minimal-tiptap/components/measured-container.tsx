import * as React from 'react'
import { useContainerSize } from '../hooks/use-container-size'

interface MeasuredContainerProps<T extends React.ElementType> {
  as: T
  name: string
  children?: React.ReactNode
}

export const MeasuredContainer = React.forwardRef(
  <T extends React.ElementType>(
    {
      as: Component,
      name,
      children,
      style = {},
      ...props
    }: MeasuredContainerProps<T> & React.ComponentProps<T>,
    ref: React.Ref<HTMLElement>
  ) => {
    const innerRef = React.useRef<HTMLElement>(null)
    const rect = useContainerSize(innerRef.current)

    // FormControl composes this ref with react-hook-form's ref. Recreating the
    // imperative handle on every render makes React detach and reattach that
    // composed ref repeatedly, which can cause a nested-update loop in React 19.
    // The DOM ref is attached before this layout effect runs, so the handle only
    // needs to be established once for the lifetime of this container.
    React.useImperativeHandle(ref, () => innerRef.current as HTMLElement, [])

    const customStyle = {
      [`--${name}-width`]: `${rect.width}px`,
      [`--${name}-height`]: `${rect.height}px`,
    }

    return (
      <Component {...props} ref={innerRef} style={{ ...customStyle, ...style }}>
        {children}
      </Component>
    )
  }
)

MeasuredContainer.displayName = 'MeasuredContainer'
