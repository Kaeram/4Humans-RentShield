import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, MapPin, AlertTriangle, Send, Loader2 } from 'lucide-react'
import { Navbar, Footer, StatusBadge, EvidenceGallery } from '@/components'
import { api } from '@/services/api'
import { Issue } from '@/types'
import { formatDateTime, getTimeAgo } from '@/lib/utils'

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

export function LandlordIssueDetail() {
    const { id } = useParams<{ id: string }>()
    const [issue, setIssue] = useState<Issue | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [response, setResponse] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return
            try {
                const issueData = await api.issues.getById(id)
                setIssue(issueData)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [id])

    const handleSubmitResponse = async () => {
        if (!id || !response.trim()) return
        setIsSubmitting(true)
        try {
            await api.issues.respondToIssue(id, response)
            setSubmitted(true)
            setResponse('')
        } finally {
            setIsSubmitting(false)
        }
    }

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
                        <Link to="/landlord/dashboard" className="btn-primary mt-4 inline-flex">
                            Back to Dashboard
                        </Link>
                    </div>
                </main>
            </div>
        )
    }

    const needsResponse = ['pending', 'in-review'].includes(issue.status)

    return (
        <div className="min-h-screen bg-neutral-50">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* Back Link */}
                    <Link
                        to="/landlord/dashboard"
                        className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>

                    {/* Urgent Banner */}
                    {needsResponse && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-warning-50 border border-warning-200 rounded-xl p-4 mb-6"
                        >
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-5 w-5 text-warning-600" />
                                <div>
                                    <p className="font-medium text-warning-800">Response Required</p>
                                    <p className="text-sm text-warning-600">
                                        This complaint was filed {getTimeAgo(issue.createdAt)}. Please respond promptly to maintain your reputation.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

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
                                        Severity: {issue.severity}/10
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
                                        Reported {formatDateTime(issue.createdAt)}
                                    </span>
                                </div>
                            </motion.div>

                            {/* Evidence */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="card"
                            >
                                <h2 className="font-semibold text-neutral-900 mb-4">
                                    Tenant Evidence ({issue.images.length})
                                </h2>
                                <EvidenceGallery images={issue.images} />
                            </motion.div>

                            {/* Response Form */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="card"
                            >
                                <h2 className="font-semibold text-neutral-900 mb-4">Your Response</h2>

                                {submitted ? (
                                    <div className="text-center py-6">
                                        <div className="h-12 w-12 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-3">
                                            <Send className="h-6 w-6 text-success-600" />
                                        </div>
                                        <p className="text-success-700 font-medium">Response Submitted</p>
                                        <p className="text-sm text-neutral-500 mt-1">
                                            Your response has been recorded and the tenant has been notified.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="response" className="label">
                                                Write your response
                                            </label>
                                            <textarea
                                                id="response"
                                                value={response}
                                                onChange={(e) => setResponse(e.target.value)}
                                                className="input-field min-h-[150px]"
                                                placeholder="Explain your position, provide context, or describe actions you're taking to resolve the issue..."
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-neutral-500">
                                                Your response will be visible to the tenant and DAO reviewers.
                                            </p>
                                            <button
                                                onClick={handleSubmitResponse}
                                                disabled={isSubmitting || !response.trim()}
                                                className="btn-primary"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="h-4 w-4 mr-2" />
                                                        Submit Response
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Timeline */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card"
                            >
                                <h3 className="font-semibold text-neutral-900 mb-4">Timeline</h3>
                                <div className="space-y-3">
                                    {issue.timeline.map((event, idx) => (
                                        <div key={event.id} className="flex gap-3">
                                            <div className="relative">
                                                <div className={`h-2.5 w-2.5 rounded-full mt-1.5 ${event.actorRole === 'landlord' ? 'bg-accent-500' :
                                                    event.actorRole === 'tenant' ? 'bg-primary-500' :
                                                        'bg-neutral-400'
                                                    }`} />
                                                {idx < issue.timeline.length - 1 && (
                                                    <div className="absolute top-3 left-1 w-0.5 h-full bg-neutral-200" />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-3">
                                                <p className="text-sm text-neutral-900">{event.message}</p>
                                                <p className="text-xs text-neutral-500 mt-0.5">
                                                    {formatDateTime(event.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Quick Actions */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="card"
                            >
                                <h3 className="font-semibold text-neutral-900 mb-4">Quick Actions</h3>
                                <div className="space-y-2">
                                    <button className="btn-secondary w-full text-sm">
                                        Request More Details
                                    </button>
                                    <button className="btn-secondary w-full text-sm">
                                        Propose Resolution
                                    </button>
                                    <button className="btn-secondary w-full text-sm text-danger-600 border-danger-200 hover:bg-danger-50">
                                        Dispute Claim
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
