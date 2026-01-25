import * as React from 'react'
import { useContainerSize } from '../hooks/use-container-size'

interface MeasuredContainerProps<T extends React.ElementType> {
  as: T
  name: string
  children?: React.ReactNode
}

export const MeasuredContainer = React.forwardRef(
  <T extends React.ElementType>(
    { as: Component, name, children, style = {}, ...props }: MeasuredContainerProps<T> & React.ComponentProps<T>,
    ref: React.Ref<HTMLElement>
  ) => {
    const [container, setContainer] = React.useState<HTMLElement | null>(null)
    const rect = useContainerSize(container)

    React.useImperativeHandle(ref, () => container as HTMLElement)

    const customStyle = {
      [`--${name}-width`]: `${rect.width}px`,
      [`--${name}-height`]: `${rect.height}px`
    }

    return (
      <Component {...props} ref={setContainer} style={{ ...customStyle, ...style }}>
        {children}
      </Component>
    )
  }
)

MeasuredContainer.displayName = 'MeasuredContainer'
