import { forwardRef, HTMLAttributes, useEffect, useRef } from 'react'
import { useFocusTrap } from '@/lib/accessibility'
import { cn } from '@/lib/utils'

interface FocusTrapProps extends HTMLAttributes<HTMLDivElement> {
  active?: boolean
  restoreFocus?: boolean
  children: React.ReactNode
}

const FocusTrap = forwardRef<HTMLDivElement, FocusTrapProps>(
  ({ active = true, restoreFocus = true, children, className, ...props }, ref) => {
    const containerRef = useFocusTrap(active)
    const previousFocusRef = useRef<HTMLElement | null>(null)

    useEffect(() => {
      if (active && restoreFocus) {
        // Store the currently focused element
        previousFocusRef.current = document.activeElement as HTMLElement
      }

      return () => {
        // Restore focus when component unmounts or becomes inactive
        if (!active && restoreFocus && previousFocusRef.current) {
          previousFocusRef.current.focus()
        }
      }
    }, [active, restoreFocus])

    return (
      <div
        ref={ref as React.RefObject<HTMLDivElement> || containerRef}
        className={cn(className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

FocusTrap.displayName = 'FocusTrap'

export { FocusTrap }
export type { FocusTrapProps }