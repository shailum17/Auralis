import { HTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const cardVariants = cva(
  'rounded-xl border bg-white text-secondary-950 transition-all duration-300 shadow-lg',
  {
    variants: {
      variant: {
        default: 'border-secondary-200 bg-white hover:shadow-xl',
        elevated: 'border-secondary-200 bg-white shadow-xl hover:shadow-2xl',
        outlined: 'border-2 border-secondary-300 bg-white shadow-md hover:border-secondary-400 hover:shadow-lg',
        ghost: 'border-transparent bg-white shadow-md hover:bg-secondary-50 hover:shadow-lg',
        gradient: 'border-secondary-200 bg-gradient-to-br from-white to-secondary-50 shadow-lg hover:shadow-xl',
        wellness: 'border-primary-200 bg-gradient-to-br from-white via-primary-50/30 to-white shadow-lg hover:shadow-xl',
        dashboard: 'border-secondary-200 bg-white backdrop-blur-sm shadow-lg hover:shadow-xl',
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      interactive: {
        true: 'cursor-pointer hover:scale-[1.02] active:scale-[0.98] hover:-translate-y-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asMotion?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, interactive, asMotion = false, ...props }, ref) => {
    const cardClasses = cn(cardVariants({ variant, size, interactive }), className)
    
    if (asMotion) {
      return (
        <motion.div
          ref={ref}
          className={cardClasses}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={interactive ? { scale: 1.02 } : undefined}
          whileTap={interactive ? { scale: 0.98 } : undefined}
          {...(props as any)}
        />
      )
    }
    
    return (
      <div
        ref={ref}
        className={cardClasses}
        {...props}
      />
    )
  }
)
Card.displayName = 'Card'

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-2xl font-semibold leading-none tracking-tight text-secondary-900', className)}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-secondary-600 leading-relaxed', className)}
      {...props}
    />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants }
export type { CardProps }