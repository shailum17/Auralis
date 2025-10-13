import React from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
    {
        variants: {
            variant: {
                default: 'bg-secondary-100 text-secondary-800 hover:bg-secondary-200',
                primary: 'bg-primary-100 text-primary-800 hover:bg-primary-200',
                secondary: 'bg-secondary-100 text-secondary-800 hover:bg-secondary-200',
                success: 'bg-success-100 text-success-800 hover:bg-success-200',
                warning: 'bg-warning-100 text-warning-800 hover:bg-warning-200',
                error: 'bg-error-100 text-error-800 hover:bg-error-200',
                info: 'bg-info-100 text-info-800 hover:bg-info-200',
                outline: 'border border-secondary-300 text-secondary-700 hover:bg-secondary-50',
                ghost: 'text-secondary-700 hover:bg-secondary-100',
            },
            size: {
                xs: 'px-2 py-0.5 text-xs rounded-md',
                sm: 'px-2.5 py-0.5 text-xs rounded-md',
                md: 'px-3 py-1 text-sm rounded-md',
                lg: 'px-3.5 py-1.5 text-sm rounded-lg',
            },
            interactive: {
                true: 'cursor-pointer hover:scale-105 active:scale-95',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'sm',
        },
    }
);

interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    removable?: boolean;
    onRemove?: () => void;
    animated?: boolean;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({
        className,
        variant,
        size,
        interactive,
        icon,
        iconPosition = 'left',
        removable = false,
        onRemove,
        animated = true,
        children,
        onClick,
        ...props
    }, ref) => {
        const iconSizes = {
            xs: 'w-3 h-3',
            sm: 'w-3 h-3',
            md: 'w-4 h-4',
            lg: 'w-4 h-4',
        };

        const handleRemove = (e: React.MouseEvent) => {
            e.stopPropagation();
            onRemove?.();
        };

        const badgeContent = (
            <>
                {icon && iconPosition === 'left' && (
                    <span className={cn(iconSizes[size || 'sm'], children && 'mr-1')}>
                        {icon}
                    </span>
                )}

                {children && <span>{children}</span>}

                {icon && iconPosition === 'right' && (
                    <span className={cn(iconSizes[size || 'sm'], children && 'ml-1')}>
                        {icon}
                    </span>
                )}

                {removable && (
                    <button
                        type="button"
                        onClick={handleRemove}
                        className={cn(
                            'ml-1 rounded-full hover:bg-black/10 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-current transition-colors duration-150',
                            iconSizes[size || 'sm']
                        )}
                        aria-label="Remove badge"
                    >
                        <svg
                            className="w-full h-full"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                )}
            </>
        );

        if (animated) {
            return (
                <motion.div
                    ref={ref}
                    className={cn(
                        badgeVariants({ variant, size, interactive: interactive || !!onClick }),
                        className
                    )}
                    onClick={onClick}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={interactive || onClick ? { scale: 1.05 } : undefined}
                    whileTap={interactive || onClick ? { scale: 0.95 } : undefined}
                    transition={{ duration: 0.2 }}
                    {...(props as any)}
                >
                    {badgeContent}
                </motion.div>
            );
        }

        return (
            <div
                ref={ref}
                className={cn(
                    badgeVariants({ variant, size, interactive: interactive || !!onClick }),
                    className
                )}
                onClick={onClick}
                {...props}
            >
                {badgeContent}
            </div>
        );
    }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
export type { BadgeProps };