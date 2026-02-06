import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-gray-900 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                default: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25',
                destructive: 'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-500/25',
                outline: 'border border-gray-600 bg-transparent text-gray-200 hover:bg-gray-800 hover:border-gray-500',
                secondary: 'bg-gray-700 text-gray-100 hover:bg-gray-600',
                ghost: 'text-gray-300 hover:bg-gray-800 hover:text-white',
                link: 'text-cyan-400 underline-offset-4 hover:underline',
                success: 'bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-500/25',
                warning: 'bg-amber-600 text-white hover:bg-amber-500 shadow-lg shadow-amber-500/25',
            },
            size: {
                default: 'h-10 px-4 py-2',
                sm: 'h-9 rounded-md px-3',
                lg: 'h-11 rounded-lg px-8 text-base',
                xl: 'h-12 rounded-lg px-10 text-lg',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

const Button = React.forwardRef(
    ({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={loading || props.disabled}
                {...props}
            >
                {loading ? (
                    <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Loading...
                    </>
                ) : (
                    children
                )}
            </Comp>
        );
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
