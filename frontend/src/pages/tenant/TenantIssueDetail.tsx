import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, MapPin, AlertTriangle, MessageSquare, Loader2, Upload, FileText } from 'lucide-react'
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
    const navigate = useNavigate()
    const [issue, setIssue] = useState<Issue | null>(null)
    const [verdict, setVerdict] = useState<AiVerdict | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isActionLoading, setIsActionLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    // Fetch data function to be reused
    const fetchData = async () => {
        if (!id) return
        try {
            const [issueData, verdictData] = await Promise.all([
                api.issues.getById(id),
                api.ai.getVerdict(id),
            ])
            setIssue(issueData)
            setVerdict(verdictData)
        } catch (error) {
            console.error('Failed to fetch issue details:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [id])

    const handleWithdraw = async () => {
        if (!id || !confirm('Are you sure you want to withdraw this issue? This action cannot be undone.')) return
        setIsActionLoading(true)
        try {
            await api.issues.withdrawIssue(id)
            await fetchData() // Refresh data
        } catch (error) {
            console.error('Failed to withdraw issue:', error)
            alert('Failed to withdraw issue. Please try again.')
        } finally {
            setIsActionLoading(false)
        }
    }

    const handleEscalate = async () => {
        if (!id || !confirm('Are you sure you want to escalate this issue to the DAO? This will start a voting process.')) return
        setIsActionLoading(true)
        try {
            await api.issues.requestEscalation(id)
            await fetchData() // Refresh data
        } catch (error) {
            console.error('Failed to escalate issue:', error)
            alert('Failed to escalate issue. Please try again.')
        } finally {
            setIsActionLoading(false)
        }
    }

    const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!id || !e.target.files?.length) return
        setIsUploading(true)
        try {
            const files = Array.from(e.target.files)
            await api.issues.uploadAdditionalEvidence(id, files)
            await fetchData() // Refresh data
        } catch (error) {
            console.error('Failed to upload evidence:', error)
            alert('Failed to upload evidence. Please try again.')
        } finally {
            setIsUploading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-lime-400 border-t-transparent rounded-full" />
            </div>
        )
    }

    if (!issue) {
        return (
            <div className="min-h-screen bg-neutral-950">
                <Navbar theme="dark" />
                <main className="pt-24 pb-16">
                    <div className="mx-auto max-w-4xl px-4 text-center">
                        <FileText className="h-16 w-16 text-neutral-800 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-white">Issue Not Found</h1>
                        <p className="text-neutral-400 mt-2 mb-6">The issue you are looking for does not exist or has been removed.</p>
                        <Link to="/tenant/dashboard" className="inline-flex px-6 py-2.5 rounded-lg bg-lime-400 text-neutral-900 font-semibold hover:bg-lime-300 transition-colors">
                            Back to Dashboard
                        </Link>
                    </div>
                </main>
            </div>
        )
    }

    const isResolved = ['resolved', 'dismissed'].includes(issue.status)
    const isEscalated = issue.status === 'escalated'

    return (
        <div className="min-h-screen bg-neutral-950 selection:bg-lime-500/30">
            <Navbar theme="dark" />

            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-lime-500/10 rounded-full blur-[120px] mix-blend-screen" />
            </div>

            <main className="pt-24 pb-16 relative z-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Back Link */}
                    <Link
                        to="/tenant/dashboard"
                        className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-6 transition-colors"
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
                                className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-xl p-6"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                                                {categoryLabels[issue.category]}
                                            </span>
                                            <StatusBadge status={issue.status} />
                                        </div>
                                        <h1 className="text-2xl font-bold text-white">{issue.title}</h1>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                        Severity: {issue.severity}/10
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-neutral-400 mb-6">
                                    <span className="flex items-center gap-1.5 bg-neutral-800/50 px-3 py-1 rounded-lg">
                                        <MapPin className="h-4 w-4 text-neutral-500" />
                                        {issue.propertyAddress}
                                    </span>
                                </div>

                                <div className="prose prose-invert max-w-none">
                                    <p className="text-neutral-300 leading-relaxed text-base">{issue.description}</p>
                                </div>

                                <div className="flex items-center gap-4 mt-6 pt-6 border-t border-neutral-800 text-xs text-neutral-500">
                                    <span className="flex items-center gap-1.5">
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
                                className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-xl p-6"
                            >
                                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
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
                                className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-xl p-6"
                            >
                                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-neutral-400" />
                                    Activity Timeline
                                </h2>
                                <div className="space-y-6">
                                    {issue.timeline.length > 0 ? (
                                        issue.timeline.map((event, idx) => (
                                            <div key={event.id} className="flex gap-4 group">
                                                <div className="relative">
                                                    <div className={`h-3 w-3 rounded-full mt-1.5 ring-4 ring-neutral-900 z-10 relative ${event.type === 'resolved' ? 'bg-lime-500' :
                                                        event.type === 'escalated' ? 'bg-red-500' :
                                                            'bg-violet-500'
                                                        }`} />
                                                    {idx < issue.timeline.length - 1 && (
                                                        <div className="absolute top-4 left-1.5 w-0.5 h-full -translate-x-1/2 bg-neutral-800 group-hover:bg-neutral-700 transition-colors" />
                                                    )}
                                                </div>
                                                <div className="flex-1 pb-2">
                                                    <div className="bg-neutral-800/30 rounded-lg p-3 hover:bg-neutral-800/50 transition-colors">
                                                        <p className="text-sm text-neutral-200">{event.message}</p>
                                                        <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500">
                                                            <span className="capitalize font-medium text-neutral-400">{event.actorRole}</span>
                                                            <span className="w-1 h-1 rounded-full bg-neutral-600" />
                                                            <span>{formatDateTime(event.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-neutral-500 italic">No activity yet.</p>
                                    )}
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
                                className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-xl p-6"
                            >
                                <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    {/* Add Evidence Button */}
                                    <div>
                                        <input
                                            type="file"
                                            id="add-evidence"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleEvidenceUpload}
                                            disabled={isUploading || isResolved}
                                        />
                                        <label
                                            htmlFor="add-evidence"
                                            className={`flex items-center justify-center w-full px-4 py-2.5 rounded-lg border border-neutral-700 bg-neutral-800 text-sm font-medium text-white transition-all ${isUploading || isResolved
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'hover:bg-neutral-700 hover:border-neutral-600 cursor-pointer'
                                                }`}
                                        >
                                            {isUploading ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <Upload className="h-4 w-4 mr-2" />
                                            )}
                                            {isUploading ? 'Uploading...' : 'Add More Evidence'}
                                        </label>
                                    </div>

                                    {/* Escalate Button */}
                                    {!isResolved && !isEscalated && (
                                        <button
                                            onClick={handleEscalate}
                                            disabled={isActionLoading}
                                            className="w-full px-4 py-2.5 rounded-lg border border-violet-500/30 bg-violet-500/10 text-sm font-medium text-violet-300 hover:bg-violet-500/20 hover:border-violet-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Request Escalation
                                        </button>
                                    )}

                                    {/* Withdraw Button */}
                                    {!isResolved && (
                                        <button
                                            onClick={handleWithdraw}
                                            disabled={isActionLoading}
                                            className="w-full px-4 py-2.5 rounded-lg border border-red-500/30 bg-red-500/10 text-sm font-medium text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Withdraw Issue
                                        </button>
                                    )}

                                    {isResolved && (
                                        <div className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-700 text-center">
                                            <p className="text-sm text-neutral-400">
                                                This issue has been {issue.status}. No further actions are available.
                                            </p>
                                        </div>
                                    )}
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
