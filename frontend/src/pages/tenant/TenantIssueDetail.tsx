import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, MapPin, AlertTriangle, MessageSquare } from 'lucide-react'
import { Navbar, Footer, StatusBadge, EvidenceGallery, AiVerdictPanel } from '@/components'
import { api } from '@/services/api'
import { Issue, AiVerdict } from '@/types'
import { formatDateTime } from '@/lib/utils'

const categoryLabels: Record<string, string> = {
    maintenance: 'Maintenance',
    safety: 'Safety Hazard',
    pest: 'Pest Infestation',
    noise: 'Noise Issue',
    'lease-violation': 'Lease Violation',
    utilities: 'Utilities',
    'security-deposit': 'Security Deposit',
    other: 'Other',
}

export function TenantIssueDetail() {
    const { id } = useParams<{ id: string }>()
    const [issue, setIssue] = useState<Issue | null>(null)
    const [verdict, setVerdict] = useState<AiVerdict | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return
            try {
                const [issueData, verdictData] = await Promise.all([
                    api.issues.getById(id),
                    api.ai.getVerdict(id),
                ])
                setIssue(issueData)
                setVerdict(verdictData)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [id])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full" />
            </div>
        )
    }

    if (!issue) {
        return (
            <div className="min-h-screen bg-neutral-50">
                <Navbar />
                <main className="pt-24 pb-16">
                    <div className="mx-auto max-w-4xl px-4 text-center">
                        <h1 className="text-2xl font-bold text-neutral-900">Issue Not Found</h1>
                        <Link to="/tenant/dashboard" className="btn-primary mt-4 inline-flex">
                            Back to Dashboard
                        </Link>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* Back Link */}
                    <Link
                        to="/tenant/dashboard"
                        className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Issue Header */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                                {categoryLabels[issue.category]}
                                            </span>
                                            <StatusBadge status={issue.status} />
                                        </div>
                                        <h1 className="text-xl font-bold text-neutral-900">{issue.title}</h1>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-danger-50 text-danger-700">
                                        <AlertTriangle className="h-3 w-3" />
                                        {issue.severity}/10
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {issue.propertyAddress}
                                    </span>
                                </div>

                                <p className="text-neutral-700 leading-relaxed">{issue.description}</p>

                                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-neutral-100 text-xs text-neutral-500">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        Created {formatDateTime(issue.createdAt)}
                                    </span>
                                    <span>•</span>
                                    <span>Updated {formatDateTime(issue.updatedAt)}</span>
                                </div>
                            </motion.div>

                            {/* Evidence Gallery */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="card"
                            >
                                <h2 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                                    Evidence ({issue.images.length})
                                </h2>
                                <EvidenceGallery
                                    images={issue.images}
                                    analysis={verdict?.evidenceAnalysis}
                                />
                            </motion.div>

                            {/* Timeline */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="card"
                            >
                                <h2 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Activity Timeline
                                </h2>
                                <div className="space-y-4">
                                    {issue.timeline.map((event, idx) => (
                                        <div key={event.id} className="flex gap-4">
                                            <div className="relative">
                                                <div className={`h-3 w-3 rounded-full mt-1.5 ${event.type === 'resolved' ? 'bg-success-500' :
                                                        event.type === 'escalated' ? 'bg-danger-500' :
                                                            'bg-primary-500'
                                                    }`} />
                                                {idx < issue.timeline.length - 1 && (
                                                    <div className="absolute top-4 left-1.5 w-0.5 h-full -translate-x-1/2 bg-neutral-200" />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <p className="text-sm text-neutral-900">{event.message}</p>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                                                    <span className="capitalize">{event.actorRole}</span>
                                                    <span>•</span>
                                                    <span>{formatDateTime(event.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* AI Verdict */}
                            {verdict && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <AiVerdictPanel verdict={verdict} compact />
                                </motion.div>
                            )}

                            {/* Quick Actions */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="card"
                            >
                                <h3 className="font-semibold text-neutral-900 mb-4">Quick Actions</h3>
                                <div className="space-y-2">
                                    <button className="btn-secondary w-full text-sm">
                                        Add More Evidence
                                    </button>
                                    <button className="btn-secondary w-full text-sm">
                                        Request Escalation
                                    </button>
                                    <button className="btn-secondary w-full text-sm text-danger-600 border-danger-200 hover:bg-danger-50">
                                        Withdraw Issue
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
