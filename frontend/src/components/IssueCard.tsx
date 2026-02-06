import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Clock, AlertTriangle, ChevronRight } from 'lucide-react'
import { cn, getTimeAgo, truncateText } from '@/lib/utils'
import { Issue } from '@/types'
import { StatusBadge } from './StatusBadge'

interface IssueCardProps {
    issue: Issue
    variant?: 'default' | 'compact'
    linkPrefix?: string
    showSeverity?: boolean
}

const categoryIcons: Record<string, string> = {
    maintenance: '🔧',
    safety: '⚠️',
    pest: '🐛',
    noise: '🔊',
    'lease-violation': '📋',
    utilities: '💡',
    'security-deposit': '💰',
    other: '📝',
}

const severityColors = [
    'bg-success-100 text-success-700',
    'bg-success-100 text-success-700',
    'bg-success-100 text-success-700',
    'bg-warning-100 text-warning-700',
    'bg-warning-100 text-warning-700',
    'bg-warning-100 text-warning-700',
    'bg-warning-100 text-warning-700',
    'bg-danger-100 text-danger-700',
    'bg-danger-100 text-danger-700',
    'bg-danger-100 text-danger-700',
]

export function IssueCard({ issue, variant = 'default', linkPrefix = '/tenant/issue', showSeverity = true }: IssueCardProps) {
    const isCompact = variant === 'compact'

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
        >
            <Link
                to={`${linkPrefix}/${issue.id}`}
                className={cn(
                    'block rounded-xl border border-transparent transition-all duration-200',
                    isCompact ? 'p-0' : 'p-6 bg-neutral-900/50 backdrop-blur-md border-neutral-800 hover:border-lime-500/30'
                )}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        {/* Category & Status Row */}
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg" role="img" aria-label={issue.category}>
                                {categoryIcons[issue.category] || '📝'}
                            </span>
                            <StatusBadge status={issue.status} size={isCompact ? 'sm' : 'md'} />
                            {showSeverity && (
                                <span
                                    className={cn(
                                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                                        severityColors[issue.severity - 1]
                                    )}
                                >
                                    <AlertTriangle className="h-3 w-3" />
                                    {issue.severity}/10
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h3 className={cn(
                            'font-semibold text-white group-hover:text-lime-400 transition-colors',
                            isCompact ? 'text-sm' : 'text-base'
                        )}>
                            {issue.title}
                        </h3>

                        {/* Description (only in default variant) */}
                        {!isCompact && (
                            <p className="mt-1 text-sm text-neutral-400">
                                {truncateText(issue.description, 120)}
                            </p>
                        )}

                        {/* Meta */}
                        <div className={cn(
                            'flex items-center gap-4 text-neutral-500',
                            isCompact ? 'mt-2 text-xs' : 'mt-3 text-sm'
                        )}>
                            <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {truncateText(issue.propertyAddress.split(',')[0], 25)}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {getTimeAgo(issue.createdAt)}
                            </span>
                        </div>

                        {/* Images preview (only in default variant) */}
                        {!isCompact && issue.images.length > 0 && (
                            <div className="mt-3 flex gap-2">
                                {issue.images.slice(0, 3).map((img, idx) => (
                                    <div
                                        key={idx}
                                        className="h-12 w-12 rounded-lg bg-neutral-800 overflow-hidden border border-neutral-700"
                                    >
                                        <img
                                            src={img}
                                            alt={`Evidence ${idx + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                ))}
                                {issue.images.length > 3 && (
                                    <div className="h-12 w-12 rounded-lg bg-neutral-800 flex items-center justify-center text-xs font-medium text-neutral-400 border border-neutral-700">
                                        +{issue.images.length - 3}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Arrow */}
                    <ChevronRight className={cn(
                        'flex-shrink-0 text-neutral-600 group-hover:text-lime-400 transition-colors',
                        isCompact ? 'h-4 w-4' : 'h-5 w-5'
                    )} />
                </div>
            </Link>
        </motion.div>
    )
}
