import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Scale,
    Clock,
    Users,
    CheckCircle,
    AlertTriangle,
    Brain,
    ChevronRight
} from 'lucide-react'
import { Navbar, Footer, StatusBadge, AiVerdictPanel } from '@/components'
import { api } from '@/services/api'
import { DaoCase } from '@/types'
import { getTimeAgo, truncateText } from '@/lib/utils'

export function DaoDashboard() {
    const [cases, setCases] = useState<DaoCase[]>([])
    const [selectedCase, setSelectedCase] = useState<DaoCase | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchCases = async () => {
            try {
                const data = await api.dao.getPendingCases()
                setCases(data)
                if (data.length > 0) {
                    setSelectedCase(data[0])
                }
            } finally {
                setIsLoading(false)
            }
        }
        fetchCases()
    }, [])

    const getVoteCounts = (daoCase: DaoCase) => {
        const counts = {
            'favor-tenant': 0,
            'favor-landlord': 0,
            'request-more-context': 0,
        }
        daoCase.votes.forEach((vote) => {
            counts[vote.option]++
        })
        return counts
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-success-500 to-accent-600 flex items-center justify-center">
                                <Scale className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-display font-bold text-neutral-900">
                                    DAO Dashboard
                                </h1>
                                <p className="text-neutral-600">
                                    Review cases and vote on tenant-landlord disputes.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2 text-neutral-600">
                                <Users className="h-4 w-4" />
                                <span>127 Active Jurors</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="card p-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-warning-100 flex items-center justify-center text-warning-600">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-neutral-900">{cases.length}</p>
                                    <p className="text-xs text-neutral-500">Pending Cases</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="card p-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-success-100 flex items-center justify-center text-success-600">
                                    <CheckCircle className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-neutral-900">24</p>
                                    <p className="text-xs text-neutral-500">Your Votes This Month</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="card p-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-accent-100 flex items-center justify-center text-accent-600">
                                    <Brain className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-neutral-900">89%</p>
                                    <p className="text-xs text-neutral-500">AI Agreement Rate</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Three Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left - Pending Cases List */}
                        <div className="lg:col-span-3">
                            <div className="card p-0 overflow-hidden">
                                <div className="p-4 border-b border-neutral-100">
                                    <h2 className="font-semibold text-neutral-900">Pending Cases</h2>
                                </div>

                                {isLoading ? (
                                    <div className="p-8 text-center">
                                        <div className="animate-spin h-6 w-6 border-2 border-primary-600 border-t-transparent rounded-full mx-auto" />
                                    </div>
                                ) : (
                                    <div className="divide-y divide-neutral-100 max-h-[600px] overflow-y-auto scrollbar-thin">
                                        {cases.map((c) => (
                                            <button
                                                key={c.id}
                                                onClick={() => setSelectedCase(c)}
                                                className={`w-full p-4 text-left transition-colors ${selectedCase?.id === c.id
                                                        ? 'bg-primary-50 border-l-2 border-primary-600'
                                                        : 'hover:bg-neutral-50'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-neutral-900 truncate">
                                                            {c.issue.title}
                                                        </p>
                                                        <p className="text-xs text-neutral-500 mt-0.5">
                                                            {getTimeAgo(c.createdAt)}
                                                        </p>
                                                    </div>
                                                    <StatusBadge status={c.status} size="sm" showDot={false} />
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-xs text-neutral-500">
                                                        {c.votes.length} votes
                                                    </span>
                                                    <span className="text-xs text-neutral-400">•</span>
                                                    <span className="text-xs text-neutral-500">
                                                        Severity {c.issue.severity}/10
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Center - Case Details */}
                        <div className="lg:col-span-5">
                            {selectedCase ? (
                                <motion.div
                                    key={selectedCase.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="card"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs text-neutral-500 uppercase tracking-wider">
                                                    Case #{selectedCase.id}
                                                </span>
                                                <StatusBadge status={selectedCase.status} size="sm" />
                                            </div>
                                            <h2 className="text-lg font-bold text-neutral-900">
                                                {selectedCase.issue.title}
                                            </h2>
                                        </div>
                                        <Link
                                            to={`/dao/case/${selectedCase.id}`}
                                            className="btn-secondary text-xs py-1.5 px-3"
                                        >
                                            Full View
                                            <ChevronRight className="h-3 w-3 ml-1" />
                                        </Link>
                                    </div>

                                    <p className="text-sm text-neutral-600 mb-4">
                                        {truncateText(selectedCase.issue.description, 200)}
                                    </p>

                                    {/* Evidence Preview */}
                                    {selectedCase.issue.images.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-xs font-medium text-neutral-500 mb-2">Evidence</p>
                                            <div className="flex gap-2">
                                                {selectedCase.issue.images.slice(0, 4).map((img, idx) => (
                                                    <div key={idx} className="h-16 w-16 rounded-lg overflow-hidden bg-neutral-100">
                                                        <img src={img} alt="" className="h-full w-full object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Current Votes */}
                                    <div className="p-4 rounded-lg bg-neutral-50 mb-4">
                                        <p className="text-xs font-medium text-neutral-500 mb-3">Current Votes (Blind)</p>
                                        <div className="grid grid-cols-3 gap-3">
                                            {Object.entries(getVoteCounts(selectedCase)).map(([option, count]) => (
                                                <div key={option} className="text-center p-2 rounded-lg bg-white border border-neutral-200">
                                                    <p className="text-lg font-bold text-neutral-900">{count}</p>
                                                    <p className="text-xs text-neutral-500 capitalize">
                                                        {option.replace(/-/g, ' ')}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Vote Buttons */}
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-neutral-500 mb-2">Cast Your Vote</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button className="py-3 rounded-lg bg-primary-100 text-primary-700 text-sm font-medium hover:bg-primary-200 transition-colors">
                                                Favor Tenant
                                            </button>
                                            <button className="py-3 rounded-lg bg-accent-100 text-accent-700 text-sm font-medium hover:bg-accent-200 transition-colors">
                                                Favor Landlord
                                            </button>
                                            <button className="py-3 rounded-lg bg-neutral-100 text-neutral-700 text-sm font-medium hover:bg-neutral-200 transition-colors">
                                                More Context
                                            </button>
                                        </div>
                                    </div>

                                    {/* Deadline */}
                                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-neutral-100 text-xs text-neutral-500">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>Voting deadline: {new Date(selectedCase.deadline).toLocaleDateString()}</span>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="card text-center py-12">
                                    <Scale className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                                    <p className="text-neutral-500">Select a case to review</p>
                                </div>
                            )}
                        </div>

                        {/* Right - AI Verdict Summary */}
                        <div className="lg:col-span-4">
                            {selectedCase?.aiVerdict ? (
                                <motion.div
                                    key={selectedCase.id + '-verdict'}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <AiVerdictPanel verdict={selectedCase.aiVerdict} />
                                </motion.div>
                            ) : (
                                <div className="card text-center py-12">
                                    <Brain className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                                    <p className="text-neutral-500">AI analysis will appear here</p>
                                </div>
                            )}

                            {/* Voting Guidelines */}
                            <div className="card mt-6">
                                <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-warning-500" />
                                    Voting Guidelines
                                </h3>
                                <ul className="space-y-2 text-sm text-neutral-600">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary-500 mt-1">•</span>
                                        Review all evidence before voting
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary-500 mt-1">•</span>
                                        Consider AI analysis but use your judgment
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary-500 mt-1">•</span>
                                        Votes are blind until deadline passes
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary-500 mt-1">•</span>
                                        Request more context if evidence is unclear
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
