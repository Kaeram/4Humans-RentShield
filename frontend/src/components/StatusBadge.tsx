import { cn } from '@/lib/utils'
import { IssueStatus } from '@/types'

interface StatusBadgeProps {
    status: IssueStatus | string
    size?: 'sm' | 'md' | 'lg'
    showDot?: boolean
}

const statusConfig: Record<string, { label: string; className: string; dotColor: string }> = {
    pending: {
        label: 'Pending',
        className: 'bg-warning-50 text-warning-700 border-warning-200',
        dotColor: 'bg-warning-500',
    },
    'in-review': {
        label: 'In Review',
        className: 'bg-primary-50 text-primary-700 border-primary-200',
        dotColor: 'bg-primary-500',
    },
    'under-investigation': {
        label: 'Under Investigation',
        className: 'bg-accent-50 text-accent-700 border-accent-200',
        dotColor: 'bg-accent-500',
    },
    resolved: {
        label: 'Resolved',
        className: 'bg-success-50 text-success-700 border-success-200',
        dotColor: 'bg-success-500',
    },
    dismissed: {
        label: 'Dismissed',
        className: 'bg-neutral-50 text-neutral-600 border-neutral-200',
        dotColor: 'bg-neutral-400',
    },
    escalated: {
        label: 'Escalated',
        className: 'bg-danger-50 text-danger-700 border-danger-200',
        dotColor: 'bg-danger-500',
    },
    voting: {
        label: 'Voting',
        className: 'bg-accent-50 text-accent-700 border-accent-200',
        dotColor: 'bg-accent-500 animate-pulse',
    },
}

const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
}

export function StatusBadge({ status, size = 'md', showDot = true }: StatusBadgeProps) {
    const config = statusConfig[status.toLowerCase()] || statusConfig.pending

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border font-medium',
                config.className,
                sizeClasses[size]
            )}
        >
            {showDot && (
                <span className={cn('h-1.5 w-1.5 rounded-full', config.dotColor)} />
            )}
            {config.label}
        </span>
    )
}
