import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Clock,
    MapPin,
    Vote,
    CheckCircle,
    Loader2,
    Users
} from 'lucide-react'
import { Navbar, Footer, StatusBadge, EvidenceGallery, AiVerdictPanel } from '@/components'
import { api } from '@/services/api'
import { DaoCase, VoteOption } from '@/types'
import { formatDateTime } from '@/lib/utils'

const voteOptions: { id: VoteOption; label: string; color: string; description: string }[] = [
    {
        id: 'favor-tenant',
        label: 'Favor Tenant',
        color: 'bg-primary-600 hover:bg-primary-700',
        description: 'Evidence supports tenant claims. Landlord should take action.',
    },
    {
        id: 'favor-landlord',
        label: 'Favor Landlord',
        color: 'bg-accent-600 hover:bg-accent-700',
        description: 'Evidence does not sufficiently support tenant claims.',
    },
    {
        id: 'request-more-context',
        label: 'Request More Context',
        color: 'bg-neutral-600 hover:bg-neutral-700',
        description: 'More information needed before making a decision.',
    },
]

export function DaoCaseDetail() {
    const { id } = useParams<{ id: string }>()
    const [daoCase, setDaoCase] = useState<DaoCase | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [selectedVote, setSelectedVote] = useState<VoteOption | null>(null)
    const [isVoting, setIsVoting] = useState(false)
    const [hasVoted, setHasVoted] = useState(false)

    useEffect(() => {
        const fetchCase = async () => {
            if (!id) return
            try {
                const data = await api.dao.getCaseById(id)
                setDaoCase(data)
            } finally {
                setIsLoading(false)
            }
        }
        fetchCase()
    }, [id])

    const handleVote = async () => {
        if (!selectedVote || !id) return
        setIsVoting(true)
        try {
            await api.dao.vote(id, selectedVote)
            setHasVoted(true)
        } finally {
            setIsVoting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full" />
            </div>
        )
    }

    if (!daoCase) {
        return (
            <div className="min-h-screen bg-neutral-50">
                <Navbar />
                <main className="pt-24 pb-16">
                    <div className="mx-auto max-w-4xl px-4 text-center">
                        <h1 className="text-2xl font-bold text-neutral-900">Case Not Found</h1>
                        <Link to="/dao/dashboard" className="btn-primary mt-4 inline-flex">
                            Back to Dashboard
                        </Link>
                    </div>
                </main>
            </div>
        )
    }

    const { issue, aiVerdict } = daoCase

    return (
        <div className="min-h-screen bg-neutral-50">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    {/* Back Link */}
                    <Link
                        to="/dao/dashboard"
                        className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Case Header */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-medium text-neutral-500">
                                                Case #{daoCase.id}
                                            </span>
                                            <StatusBadge status={daoCase.status} />
                                        </div>
                                        <h1 className="text-2xl font-bold text-neutral-900">{issue.title}</h1>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {issue.propertyAddress}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        Created {formatDateTime(issue.createdAt)}
                                    </span>
                                </div>

                                <div className="p-4 rounded-lg bg-neutral-50 mb-4">
                                    <h3 className="text-sm font-medium text-neutral-700 mb-2">Issue Description</h3>
                                    <p className="text-neutral-600 leading-relaxed">{issue.description}</p>
                                </div>

                                {/* Voting Stats */}
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-neutral-400" />
                                        <span className="text-neutral-600">
                                            <strong>{daoCase.votes.length}</strong> votes cast
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-warning-500" />
                                        <span className="text-warning-600">
                                            Deadline: {new Date(daoCase.deadline).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Evidence Gallery */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="card"
                            >
                                <h2 className="font-semibold text-neutral-900 mb-4">
                                    Evidence ({issue.images.length} items)
                                </h2>
                                <EvidenceGallery
                                    images={issue.images}
                                    analysis={aiVerdict?.evidenceAnalysis}
                                />
                            </motion.div>

                            {/* Timeline */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="card"
                            >
                                <h2 className="font-semibold text-neutral-900 mb-4">Case Timeline</h2>
                                <div className="space-y-4">
                                    {issue.timeline.map((event, idx) => (
                                        <div key={event.id} className="flex gap-4">
                                            <div className="relative">
                                                <div className={`h-3 w-3 rounded-full mt-1.5 ${event.type === 'resolved' ? 'bg-success-500' :
                                                        event.type === 'escalated' ? 'bg-accent-500' :
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
                            {aiVerdict && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <AiVerdictPanel verdict={aiVerdict} />
                                </motion.div>
                            )}

                            {/* Voting Panel */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="card"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <Vote className="h-5 w-5 text-accent-600" />
                                    <h3 className="font-semibold text-neutral-900">Cast Your Vote</h3>
                                </div>

                                {hasVoted ? (
                                    <div className="text-center py-6">
                                        <div className="h-12 w-12 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-3">
                                            <CheckCircle className="h-6 w-6 text-success-600" />
                                        </div>
                                        <p className="font-medium text-success-700">Vote Recorded</p>
                                        <p className="text-sm text-neutral-500 mt-1">
                                            Your vote will remain anonymous until the deadline.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-3 mb-4">
                                            {voteOptions.map((option) => (
                                                <button
                                                    key={option.id}
                                                    onClick={() => setSelectedVote(option.id)}
                                                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${selectedVote === option.id
                                                            ? 'border-primary-600 bg-primary-50'
                                                            : 'border-neutral-200 hover:border-neutral-300'
                                                        }`}
                                                >
                                                    <p className="font-medium text-neutral-900">{option.label}</p>
                                                    <p className="text-xs text-neutral-500 mt-0.5">{option.description}</p>
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={handleVote}
                                            disabled={!selectedVote || isVoting}
                                            className="btn-primary w-full"
                                        >
                                            {isVoting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                'Submit Vote'
                                            )}
                                        </button>

                                        <p className="text-xs text-neutral-500 text-center mt-3">
                                            Votes are blind until the deadline passes.
                                        </p>
                                    </>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
