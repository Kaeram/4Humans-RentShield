import { motion } from 'framer-motion'
import { Brain, AlertTriangle, CheckCircle, Scale, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AiVerdict } from '@/types'

interface AiVerdictPanelProps {
    verdict: AiVerdict
    compact?: boolean
}

export function AiVerdictPanel({ verdict, compact = false }: AiVerdictPanelProps) {
    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 70) return 'text-success-600'
        if (confidence >= 40) return 'text-warning-600'
        return 'text-neutral-500'
    }

    const getBarColor = (type: 'tenant' | 'landlord' | 'neutral') => {
        if (type === 'tenant') return 'bg-primary-500'
        if (type === 'landlord') return 'bg-accent-500'
        return 'bg-neutral-400'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                'rounded-xl border bg-gradient-to-br from-neutral-50 to-white',
                compact ? 'p-4' : 'p-6'
            )}
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-100">
                    <Brain className="h-5 w-5 text-accent-600" />
                </div>
                <div>
                    <h3 className={cn('font-semibold text-neutral-900', compact ? 'text-sm' : 'text-base')}>
                        AI Verdict Summary
                    </h3>
                    <p className="text-xs text-neutral-500">
                        Generated {new Date(verdict.generatedAt).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* Confidence Bars */}
            <div className="space-y-3 mb-4">
                {/* Tenant Confidence */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-neutral-600">Tenant Confidence</span>
                        <span className={cn('text-sm font-semibold', getConfidenceColor(verdict.tenantConfidence))}>
                            {verdict.tenantConfidence}%
                        </span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${verdict.tenantConfidence}%` }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className={cn('h-full rounded-full', getBarColor('tenant'))}
                        />
                    </div>
                </div>

                {/* Landlord Confidence */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-neutral-600">Landlord Confidence</span>
                        <span className={cn('text-sm font-semibold', getConfidenceColor(verdict.landlordConfidence))}>
                            {verdict.landlordConfidence}%
                        </span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${verdict.landlordConfidence}%` }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className={cn('h-full rounded-full', getBarColor('landlord'))}
                        />
                    </div>
                </div>

                {/* Neutral Confidence */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-neutral-600">Neutral/Uncertain</span>
                        <span className="text-sm font-semibold text-neutral-500">
                            {verdict.neutralConfidence}%
                        </span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${verdict.neutralConfidence}%` }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className={cn('h-full rounded-full', getBarColor('neutral'))}
                        />
                    </div>
                </div>
            </div>

            {/* Recommended Action */}
            <div className={cn(
                'rounded-lg bg-primary-50 border border-primary-100 p-3 mb-4',
                compact && 'p-2'
            )}>
                <div className="flex items-start gap-2">
                    <Scale className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-xs font-medium text-primary-600 uppercase tracking-wide mb-1">
                            Recommended Action
                        </p>
                        <p className={cn('text-primary-800', compact ? 'text-xs' : 'text-sm')}>
                            {verdict.recommendedAction}
                        </p>
                    </div>
                </div>
            </div>

            {/* Reasoning (only in non-compact mode) */}
            {!compact && (
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-neutral-500" />
                        <span className="text-sm font-medium text-neutral-700">AI Reasoning</span>
                    </div>
                    <p className="text-sm text-neutral-600 leading-relaxed">
                        {verdict.reasoning}
                    </p>
                </div>
            )}

            {/* Red Flags */}
            {verdict.redFlags.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-danger-500" />
                        <span className={cn('font-medium text-danger-700', compact ? 'text-xs' : 'text-sm')}>
                            Red Flags ({verdict.redFlags.length})
                        </span>
                    </div>
                    <ul className="space-y-1.5">
                        {verdict.redFlags.map((flag, idx) => (
                            <li
                                key={idx}
                                className={cn(
                                    'flex items-start gap-2 rounded-lg bg-danger-50 border border-danger-100 p-2',
                                    compact && 'p-1.5'
                                )}
                            >
                                <span className="text-danger-400 mt-0.5">•</span>
                                <span className={cn('text-danger-700', compact ? 'text-xs' : 'text-sm')}>
                                    {flag}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* No red flags indicator */}
            {verdict.redFlags.length === 0 && (
                <div className="flex items-center gap-2 text-success-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className={cn(compact ? 'text-xs' : 'text-sm')}>No red flags identified</span>
                </div>
            )}
        </motion.div>
    )
}
