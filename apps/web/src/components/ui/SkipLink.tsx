import { forwardRef, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SkipLinkProps extends HTMLAttributes<HTMLAnchorElement> {
  href: string
  children: React.ReactNode
}

const SkipLink = forwardRef<HTMLAnchorElement, SkipLinkProps>(
  ({ href, children, className, ...props }, ref) => {
    return (
      <a
        ref={ref}
        href={href}
        className={cn(
          // Hidden by default
          'sr-only',
          // Visible when focused
          'focus:not-sr-only',
          // Positioning and styling when visible
          'focus:absolute focus:top-4 focus:left-4 focus:z-50',
          'focus:px-4 focus:py-2',
          'focus:bg-primary-600 focus:text-white',
          'focus:rounded-md focus:shadow-lg',
          'focus:font-medium focus:text-sm',
          // Smooth transitions
          'transition-all duration-200 ease-in-out',
          // High contrast mode support
          'forced-colors:focus:border forced-colors:focus:border-solid',
          className
        )}
        {...props}
      >
        {children}
      </a>
    )
  }
)

SkipLink.displayName = 'SkipLink'

export { SkipLink }
export type { SkipLinkProps }