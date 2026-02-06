import React from 'react';
import { cn } from '../../lib/utils';

const Spinner = React.forwardRef(({ className, size = 'md', ...props }, ref) => {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    };

    return (
        <div
            ref={ref}
            className={cn(
                'border-cyan-500 border-t-transparent rounded-full animate-spin',
                sizeClasses[size],
                className
            )}
            {...props}
        />
    );
});

Spinner.displayName = 'Spinner';

export { Spinner };
