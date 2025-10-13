import React from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const skeletonVariants = cva(
  'animate-pulse bg-secondary-200 rounded',
  {
    variants: {
      variant: {
        default: 'bg-secondary-200',
        light: 'bg-secondary-100',
        dark: 'bg-secondary-300',
        shimmer: 'bg-gradient-to-r from-secondary-200 via-secondary-100 to-secondary-200 bg-[length:200%_100%] animate-shimmer',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  animated?: boolean;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({
    className,
    variant,
    width,
    height,
    circle = false,
    animated = true,
    style,
    ...props
  }, ref) => {
    const skeletonStyle = {
      width,
      height,
      ...style,
    };

    if (animated && variant === 'shimmer') {
      return (
        <motion.div
          ref={ref}
          className={cn(
            skeletonVariants({ variant }),
            circle && 'rounded-full',
            className
          )}
          style={skeletonStyle}
          animate={{
            backgroundPosition: ['200% 0', '-200% 0'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
          {...(props as any)}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          skeletonVariants({ variant }),
          circle && 'rounded-full',
          !animated && 'animate-none',
          className
        )}
        style={skeletonStyle}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Predefined skeleton components for common use cases
const SkeletonText = React.forwardRef<HTMLDivElement, {
  lines?: number;
  className?: string;
  variant?: VariantProps<typeof skeletonVariants>['variant'];
}>(({ lines = 3, className, variant, ...props }, ref) => (
  <div ref={ref} className={cn('space-y-2', className)} {...props}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        variant={variant}
        height="1rem"
        width={index === lines - 1 ? '75%' : '100%'}
      />
    ))}
  </div>
));

SkeletonText.displayName = 'SkeletonText';

const SkeletonCard = React.forwardRef<HTMLDivElement, {
  className?: string;
  variant?: VariantProps<typeof skeletonVariants>['variant'];
}>(({ className, variant, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 space-y-4', className)} {...props}>
    <div className="flex items-center space-x-4">
      <Skeleton variant={variant} circle width={40} height={40} />
      <div className="space-y-2 flex-1">
        <Skeleton variant={variant} height="1rem" width="60%" />
        <Skeleton variant={variant} height="0.75rem" width="40%" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton variant={variant} height="1rem" />
      <Skeleton variant={variant} height="1rem" />
      <Skeleton variant={variant} height="1rem" width="80%" />
    </div>
  </div>
));

SkeletonCard.displayName = 'SkeletonCard';

const SkeletonTable = React.forwardRef<HTMLDivElement, {
  rows?: number;
  columns?: number;
  className?: string;
  variant?: VariantProps<typeof skeletonVariants>['variant'];
}>(({ rows = 5, columns = 4, className, variant, ...props }, ref) => (
  <div ref={ref} className={cn('space-y-3', className)} {...props}>
    {/* Header */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton
          key={`header-${index}`}
          variant={variant}
          height="1.5rem"
          width="100%"
        />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton
            key={`cell-${rowIndex}-${colIndex}`}
            variant={variant}
            height="1rem"
            width="100%"
          />
        ))}
      </div>
    ))}
  </div>
));

SkeletonTable.displayName = 'SkeletonTable';

const SkeletonChart = React.forwardRef<HTMLDivElement, {
  type?: 'bar' | 'line' | 'pie';
  className?: string;
  variant?: VariantProps<typeof skeletonVariants>['variant'];
}>(({ type = 'bar', className, variant, ...props }, ref) => {
  if (type === 'pie') {
    return (
      <div ref={ref} className={cn('flex items-center justify-center p-8', className)} {...props}>
        <Skeleton variant={variant} circle width={200} height={200} />
      </div>
    );
  }

  if (type === 'line') {
    return (
      <div ref={ref} className={cn('p-6 space-y-4', className)} {...props}>
        <div className="flex items-end space-x-2 h-32">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton
              key={index}
              variant={variant}
              width="100%"
              height={`${Math.random() * 80 + 20}%`}
              className="rounded-t"
            />
          ))}
        </div>
        <div className="flex space-x-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton
              key={index}
              variant={variant}
              width="100%"
              height="0.75rem"
            />
          ))}
        </div>
      </div>
    );
  }

  // Bar chart
  return (
    <div ref={ref} className={cn('p-6 space-y-4', className)} {...props}>
      <div className="flex items-end space-x-2 h-32">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton
            key={index}
            variant={variant}
            width="100%"
            height={`${Math.random() * 60 + 40}%`}
            className="rounded-t"
          />
        ))}
      </div>
      <div className="flex space-x-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton
            key={index}
            variant={variant}
            width="100%"
            height="0.75rem"
          />
        ))}
      </div>
    </div>
  );
});

SkeletonChart.displayName = 'SkeletonChart';

export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonTable,
  SkeletonChart,
  skeletonVariants,
};
export type { SkeletonProps };