import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Clock,
    MapPin,
    AlertTriangle,
    MessageSquare,
    Upload,
    Scale,
    CheckCircle,
    Loader2,
    Send
} from 'lucide-react'
import { Navbar, Footer, StatusBadge, AiVerdictPanel } from '@/components'
import AnimatedShaderBackground from '@/components/ui/animated-shader-background'
import { api } from '@/services/api'
import { Issue, AiVerdict, IssueComment } from '@/types'
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

export function TenantIssueDetail() {
    const { id } = useParams<{ id: string }>()
    const [issue, setIssue] = useState<Issue | null>(null)
    const [verdict, setVerdict] = useState<AiVerdict | null>(null)
    const [comments, setComments] = useState<IssueComment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [newComment, setNewComment] = useState('')
    const [isSubmittingComment, setIsSubmittingComment] = useState(false)
    const [isProcessingAction, setIsProcessingAction] = useState(false)
    const [evidenceImages, setEvidenceImages] = useState<string[]>([])
    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return
            try {
                setError('')
                const issueData = await api.issues.getById(id)
                setIssue(issueData)

                // Fetch evidence images
                try {
                    const images = await api.issues.getEvidence(id)
                    setEvidenceImages(images)
                } catch {
                    // Evidence may not exist
                }

                // Fetch verdict (may not exist)
                try {
                    const verdictData = await api.ai.getVerdict(id)
                    setVerdict(verdictData)
                } catch {
                    // Verdict may not exist yet
                }

                // Fetch comments
                try {
                    const commentsData = await api.issues.getComments(id)
                    setComments(commentsData)
                } catch {
                    // Comments may not exist
                }
            } catch (err: any) {
                console.error('Failed to fetch issue:', err)
                setError(err?.message || 'Failed to load issue details')
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [id])

    const handleAddComment = async () => {
        if (!id || !newComment.trim()) return
        setIsSubmittingComment(true)
        try {
            const comment = await api.issues.addComment(id, newComment)
            setComments([...comments, comment])
            setNewComment('')
        } catch (err: any) {
            console.error('Failed to add comment:', err)
        } finally {
            setIsSubmittingComment(false)
        }
    }

    const handleWithdraw = async () => {
        if (!id || !issue) return
        if (!window.confirm('Are you sure you want to withdraw this issue? This action cannot be undone.')) return

        setIsProcessingAction(true)
        try {
            await api.issues.withdrawIssue(id)
            navigate('/tenant/dashboard')
        } catch (err: any) {
            console.error('Failed to withdraw issue:', err)
            alert('Failed to withdraw issue: ' + (err?.message || 'Unknown error'))
        } finally {
            setIsProcessingAction(false)
        }
    }

    const handleEscalation = async () => {
        if (!id || !issue) return
        if (!window.confirm('Request escalation to DAO for review? This will make your issue visible to DAO members for voting.')) return

        setIsProcessingAction(true)
        try {
            const updatedIssue = await api.issues.requestEscalation(id)
            setIssue(updatedIssue)
            // Refresh comments to show escalation note
            const commentsData = await api.issues.getComments(id)
            setComments(commentsData)
        } catch (err: any) {
            console.error('Failed to escalate issue:', err)
            alert('Failed to escalate issue: ' + (err?.message || 'Unknown error'))
        } finally {
            setIsProcessingAction(false)
        }
    }

    const handleAddEvidence = () => {
        // Create a file input and trigger it
        const input = document.createElement('input')
        input.type = 'file'
        input.multiple = true
        input.accept = 'image/*'
        input.onchange = async (e) => {
            const files = (e.target as HTMLInputElement).files
            if (!files || files.length === 0 || !id) return

            setIsProcessingAction(true)
            try {
                const newImages = await api.issues.uploadAdditionalEvidence(id, Array.from(files))
                setEvidenceImages([...evidenceImages, ...newImages])
                // Refresh comments
                const commentsData = await api.issues.getComments(id)
                setComments(commentsData)
            } catch (err: any) {
                console.error('Failed to upload evidence:', err)
                alert('Failed to upload evidence: ' + (err?.message || 'Unknown error'))
            } finally {
                setIsProcessingAction(false)
            }
        }
        input.click()
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center relative">
                <AnimatedShaderBackground />
                <div className="relative z-10 flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 text-lime-400 animate-spin" />
                    <p className="text-neutral-400">Loading issue details...</p>
                </div>
            </div>
        )
    }

    if (error || !issue) {
        return (
            <div className="min-h-screen bg-neutral-950 relative">
                <AnimatedShaderBackground />
                <Navbar theme="dark" />
                <main className="pt-24 pb-16 relative z-10">
                    <div className="mx-auto max-w-4xl px-4 text-center">
                        <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800/50 rounded-2xl p-8">
                            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                            <h1 className="text-2xl font-bold text-white mb-2">Issue Not Found</h1>
                            <p className="text-neutral-400 mb-6">{error || "The issue you're looking for doesn't exist."}</p>
                            <Link
                                to="/tenant/dashboard"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-lime-400 text-neutral-900 rounded-lg font-medium hover:bg-lime-300 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-950 relative">
            <AnimatedShaderBackground />
            <Navbar theme="dark" />

            <main className="pt-24 pb-16 relative z-10">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    {/* Back Link */}
                    <Link
                        to="/tenant/dashboard"
                        className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-lime-400 mb-6 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Issue Header Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800/50 rounded-2xl p-6"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-2xl">{categoryIcons[issue.category]}</span>
                                            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                                                {categoryLabels[issue.category]}
                                            </span>
                                            <StatusBadge status={issue.status} />
                                        </div>
                                        <h1 className="text-2xl font-bold text-white">{issue.title}</h1>
                                    </div>
                                    <div className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full ${issue.severity >= 7 ? 'bg-red-500/20 text-red-400' :
                                        issue.severity >= 4 ? 'bg-amber-500/20 text-amber-400' :
                                            'bg-emerald-500/20 text-emerald-400'
                                        }`}>
                                        <AlertTriangle className="h-4 w-4" />
                                        Severity: {issue.severity}/10
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-neutral-400 mb-6">
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="h-4 w-4 text-lime-400" />
                                        {issue.propertyAddress || 'No address provided'}
                                    </span>
                                </div>

                                <div className="bg-neutral-800/30 rounded-xl p-4 mb-6">
                                    <h3 className="text-sm font-medium text-neutral-300 mb-2">Description</h3>
                                    <p className="text-neutral-300 leading-relaxed">{issue.description}</p>
                                </div>

                                <div className="flex items-center gap-6 pt-4 border-t border-neutral-800 text-xs text-neutral-500">
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" />
                                        Created {formatDateTime(issue.createdAt)}
                                    </span>
                                    <span>•</span>
                                    <span>Last updated {formatDateTime(issue.updatedAt)}</span>
                                </div>
                            </motion.div>

                            {/* Evidence Gallery */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800/50 rounded-2xl p-6"
                            >
                                <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                                    <Upload className="h-4 w-4 text-lime-400" />
                                    Evidence ({evidenceImages.length})
                                </h2>
                                {evidenceImages.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {evidenceImages.map((url, index) => (
                                            <a
                                                key={index}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="aspect-square rounded-lg overflow-hidden bg-neutral-800 hover:opacity-80 transition-opacity"
                                            >
                                                <img
                                                    src={url}
                                                    alt={`Evidence ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-neutral-500">
                                        <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>No evidence uploaded yet</p>
                                    </div>
                                )}
                            </motion.div>

                            {/* Comments Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800/50 rounded-2xl p-6"
                            >
                                <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-lime-400" />
                                    Comments ({comments.length})
                                </h2>

                                {/* Comments List */}
                                <div className="space-y-4 mb-6">
                                    {comments.length > 0 ? (
                                        comments.map((comment) => (
                                            <div key={comment.id} className="bg-neutral-800/30 rounded-lg p-4">
                                                <p className="text-neutral-300">{comment.content}</p>
                                                <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500">
                                                    <span>{formatDateTime(comment.created_at)}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-neutral-500 text-center py-4">No comments yet</p>
                                    )}
                                </div>

                                {/* Add Comment */}
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="flex-1 px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                    />
                                    <button
                                        onClick={handleAddComment}
                                        disabled={isSubmittingComment || !newComment.trim()}
                                        className="px-4 py-3 bg-lime-400 text-neutral-900 rounded-lg font-medium hover:bg-lime-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmittingComment ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <Send className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </motion.div>

                            {/* Timeline */}
                            {issue.timeline && issue.timeline.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800/50 rounded-2xl p-6"
                                >
                                    <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-lime-400" />
                                        Activity Timeline
                                    </h2>
                                    <div className="space-y-4">
                                        {issue.timeline.map((event, idx) => (
                                            <div key={event.id} className="flex gap-4">
                                                <div className="relative">
                                                    <div className={`h-3 w-3 rounded-full mt-1.5 ${event.type === 'resolved' ? 'bg-emerald-500' :
                                                        event.type === 'escalated' ? 'bg-red-500' :
                                                            'bg-lime-400'
                                                        }`} />
                                                    {idx < issue.timeline.length - 1 && (
                                                        <div className="absolute top-4 left-1.5 w-0.5 h-full -translate-x-1/2 bg-neutral-700" />
                                                    )}
                                                </div>
                                                <div className="flex-1 pb-4">
                                                    <p className="text-sm text-neutral-300">{event.message}</p>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                                                        <span className="capitalize text-lime-400">{event.actorRole}</span>
                                                        <span>•</span>
                                                        <span>{formatDateTime(event.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* AI Verdict */}
                            {verdict && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800/50 rounded-2xl p-6"
                                >
                                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                                        <Scale className="h-4 w-4 text-lime-400" />
                                        AI Analysis
                                    </h3>
                                    <AiVerdictPanel verdict={verdict} compact />
                                </motion.div>
                            )}

                            {/* Status Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800/50 rounded-2xl p-6"
                            >
                                <h3 className="font-semibold text-white mb-4">Issue Status</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-neutral-400">Current Status</span>
                                        <StatusBadge status={issue.status} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-neutral-400">Severity</span>
                                        <span className={`font-medium ${issue.severity >= 7 ? 'text-red-400' :
                                            issue.severity >= 4 ? 'text-amber-400' :
                                                'text-emerald-400'
                                            }`}>{issue.severity}/10</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-neutral-400">Category</span>
                                        <span className="text-white">{categoryLabels[issue.category]}</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Quick Actions */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800/50 rounded-2xl p-6"
                            >
                                <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={handleAddEvidence}
                                        disabled={isProcessingAction || issue.status === 'dismissed'}
                                        className="w-full px-4 py-3 bg-neutral-800 text-white rounded-lg font-medium hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Upload className="h-4 w-4" />
                                        Add More Evidence
                                    </button>
                                    {issue.status !== 'escalated' && issue.status !== 'dismissed' && (
                                        <button
                                            onClick={handleEscalation}
                                            disabled={isProcessingAction}
                                            className="w-full px-4 py-3 bg-amber-500/20 text-amber-400 rounded-lg font-medium hover:bg-amber-500/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Scale className="h-4 w-4" />
                                            {isProcessingAction ? 'Processing...' : 'Request Escalation'}
                                        </button>
                                    )}
                                    {issue.status === 'resolved' && (
                                        <button className="w-full px-4 py-3 bg-lime-400/20 text-lime-400 rounded-lg font-medium hover:bg-lime-400/30 transition-colors flex items-center justify-center gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            Mark as Accepted
                                        </button>
                                    )}
                                    {issue.status !== 'dismissed' && issue.status !== 'resolved' && (
                                        <button
                                            onClick={handleWithdraw}
                                            disabled={isProcessingAction}
                                            className="w-full px-4 py-3 bg-red-500/10 text-red-400 rounded-lg font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isProcessingAction ? 'Processing...' : 'Withdraw Issue'}
                                        </button>
                                    )}
                                    {issue.status === 'dismissed' && (
                                        <p className="text-center text-neutral-500 text-sm py-2">This issue has been withdrawn</p>
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
