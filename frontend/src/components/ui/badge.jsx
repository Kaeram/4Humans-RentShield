import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2',
    {
        variants: {
            variant: {
                default: 'border-transparent bg-cyan-500/20 text-cyan-300',
                secondary: 'border-transparent bg-gray-600 text-gray-200',
                destructive: 'border-transparent bg-red-500/20 text-red-300',
                success: 'border-transparent bg-green-500/20 text-green-300',
                warning: 'border-transparent bg-amber-500/20 text-amber-300',
                outline: 'border-gray-600 text-gray-300',
                // Status-specific badges
                reported: 'border-transparent bg-blue-500/20 text-blue-300',
                awaiting: 'border-transparent bg-yellow-500/20 text-yellow-300',
                dao_review: 'border-transparent bg-purple-500/20 text-purple-300',
                dao_verdict: 'border-transparent bg-indigo-500/20 text-indigo-300',
                resolved: 'border-transparent bg-green-500/20 text-green-300',
                escalated: 'border-transparent bg-red-500/20 text-red-300',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

function Badge({ className, variant, ...props }) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
