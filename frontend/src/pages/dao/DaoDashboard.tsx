import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Scale,
    Clock,
    Users,
    CheckCircle,
    AlertTriangle,
    Brain,
    ChevronRight,
    Loader2,
    Shield
} from 'lucide-react'
import { Navbar, Footer, StatusBadge, AiVerdictPanel } from '@/components'
import { api } from '@/services/api'
import { DaoCase, VoteOption } from '@/types'
import { getTimeAgo, truncateText } from '@/lib/utils'

export function DaoDashboard() {
    const [cases, setCases] = useState<DaoCase[]>([])
    const [selectedCase, setSelectedCase] = useState<DaoCase | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isVoting, setIsVoting] = useState(false)

    useEffect(() => {
        const fetchCases = async () => {
            try {
                const data = await api.dao.getPendingCases()
                setCases(data)
                if (data.length > 0) {
                    setSelectedCase(data[0])
                }
            } catch (error) {
                console.error('Failed to fetch DAO cases:', error)
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
            if (counts[vote.option as keyof typeof counts] !== undefined) {
                counts[vote.option as keyof typeof counts]++
            }
        })
        return counts
    }

    const handleVote = async (option: VoteOption) => {
        if (!selectedCase) return
        setIsVoting(true)
        try {
            await api.dao.vote(selectedCase.id, option)
            // Ideally refresh data here
            alert('Vote cast successfully!')
        } catch (error) {
            console.error('Vote failed:', error)
            alert('Failed to cast vote. ' + error)
        } finally {
            setIsVoting(false)
        }
    }

    return (
        <div className="min-h-screen bg-neutral-950 selection:bg-lime-500/30">
            <Navbar theme="dark" />

            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-sky-600/20 rounded-full blur-[130px] mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] mix-blend-screen" />
            </div>

            <main className="pt-24 pb-16 relative z-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-sky-500/20 to-violet-500/20 flex items-center justify-center border border-sky-500/30 shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                                <Scale className="h-7 w-7 text-sky-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white tracking-tight">
                                    DAO Tribunal
                                </h1>
                                <p className="text-neutral-400 mt-1">
                                    Decentralized dispute resolution powered by community consensus.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="px-4 py-2 rounded-lg bg-neutral-900/50 border border-neutral-800 flex items-center gap-2">
                                <Users className="h-4 w-4 text-sky-400" />
                                <span className="text-sm font-medium text-neutral-300">127 Active Jurors</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-xl p-5"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-white">{cases.length}</p>
                                    <p className="text-sm text-neutral-400">Pending Reviews</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-xl p-5"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-lime-500/20 flex items-center justify-center text-lime-400">
                                    <CheckCircle className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-white">24</p>
                                    <p className="text-sm text-neutral-400">Your Votes</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-xl p-5"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400">
                                    <Brain className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-white">89%</p>
                                    <p className="text-sm text-neutral-400">AI Match Rate</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Main Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-340px)] min-h-[600px]">
                        {/* Left - Pending Cases List */}
                        <div className="lg:col-span-3 flex flex-col bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-xl overflow-hidden">
                            <div className="p-4 border-b border-neutral-800">
                                <h2 className="font-semibold text-white">Case Queue</h2>
                            </div>

                            {isLoading ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
                                </div>
                            ) : cases.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-neutral-500">
                                    <CheckCircle className="h-10 w-10 mb-3 opacity-20" />
                                    <p>No pending cases</p>
                                </div>
                            ) : (
                                <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
                                    {cases.map((c) => (
                                        <button
                                            key={c.id}
                                            onClick={() => setSelectedCase(c)}
                                            className={`w-full p-4 text-left transition-all border-b border-neutral-800/50 hover:bg-neutral-800/50 ${selectedCase?.id === c.id
                                                ? 'bg-sky-500/10 border-l-2 border-l-sky-500'
                                                : 'border-l-2 border-l-transparent text-neutral-400'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-3 mb-1">
                                                <h3 className={`font-medium text-sm truncate ${selectedCase?.id === c.id ? 'text-white' : 'text-neutral-300'}`}>
                                                    {c.title}
                                                </h3>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-neutral-500">{getTimeAgo(c.createdAt)}</span>
                                                <StatusBadge status={c.status} size="sm" showDot={false} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Center - Case Details */}
                        <div className="lg:col-span-6 flex flex-col bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-xl overflow-hidden">
                            {selectedCase ? (
                                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-800 p-6">
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-neutral-800 text-neutral-400 border border-neutral-700">
                                                    {selectedCase.caseId}
                                                </span>
                                                <div className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    Severity {selectedCase.issue.severity}/10
                                                </div>
                                            </div>
                                            <h2 className="text-2xl font-bold text-white mb-2">
                                                {selectedCase.issue.title}
                                            </h2>
                                            <div className="flex items-center gap-2 text-sm text-neutral-400">
                                                <Clock className="h-4 w-4" />
                                                <span>Voting Deadline: <span className="text-white">{new Date(selectedCase.deadline).toLocaleDateString()}</span></span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="prose prose-invert prose-sm max-w-none mb-8">
                                        <h3 className="text-white font-medium mb-2">Complaint Description</h3>
                                        <p className="text-neutral-300 leading-relaxed bg-neutral-950/50 p-4 rounded-lg border border-neutral-800">
                                            {selectedCase.issue.description}
                                        </p>
                                    </div>

                                    {/* Evidence Preview */}
                                    {selectedCase.issue.images.length > 0 && (
                                        <div className="mb-8">
                                            <h3 className="text-sm font-medium text-neutral-400 mb-3 uppercase tracking-wider">Evidence</h3>
                                            <div className="grid grid-cols-4 gap-2">
                                                {selectedCase.issue.images.slice(0, 4).map((img, idx) => (
                                                    <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-neutral-800 border border-neutral-700 hover:border-sky-500/50 transition-colors cursor-pointer">
                                                        <img src={img} alt="" className="h-full w-full object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Voting Section */}
                                    <div className="bg-neutral-950/50 border border-neutral-800 rounded-xl p-6">
                                        <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                                            <Scale className="h-4 w-4 text-sky-400" />
                                            Cast Your Vote
                                        </h3>

                                        <div className="grid grid-cols-3 gap-3 mb-6">
                                            <button
                                                onClick={() => handleVote('favor-tenant')}
                                                disabled={isVoting}
                                                className="py-3 px-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all disabled:opacity-50"
                                            >
                                                Favor Tenant
                                            </button>
                                            <button
                                                onClick={() => handleVote('favor-landlord')}
                                                disabled={isVoting}
                                                className="py-3 px-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium hover:bg-orange-500/20 hover:border-orange-500/40 transition-all disabled:opacity-50"
                                            >
                                                Favor Landlord
                                            </button>
                                            <button
                                                onClick={() => handleVote('request-more-context')}
                                                disabled={isVoting}
                                                className="py-3 px-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300 text-sm font-medium hover:bg-neutral-700 hover:border-neutral-600 transition-all disabled:opacity-50"
                                            >
                                                More Context
                                            </button>
                                        </div>

                                        {/* Current Standings */}
                                        <div>
                                            <p className="text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wider">Current Standings (Blind)</p>
                                            <div className="flex gap-2">
                                                {Object.entries(getVoteCounts(selectedCase)).map(([option, count]) => (
                                                    <div key={option} className="flex-1 bg-neutral-900 rounded-lg p-2 text-center border border-neutral-800">
                                                        <span className="block text-lg font-bold text-white">{count}</span>
                                                        <span className="text-[10px] text-neutral-500 uppercase">{option.replace(/-/g, ' ')}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                    <div className="h-20 w-20 bg-neutral-900 rounded-full flex items-center justify-center mb-6 border border-neutral-800">
                                        <Scale className="h-10 w-10 text-neutral-700" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">No Case Selected</h3>
                                    <p className="text-neutral-400 max-w-sm">Select a pending case from the queue on the left to review evidence and cast your vote.</p>
                                </div>
                            )}
                        </div>

                        {/* Right - AI Verdict Summary */}
                        <div className="lg:col-span-3 flex flex-col space-y-4 h-full overflow-y-auto scrollbar-hide">
                            {selectedCase?.aiVerdict ? (
                                <motion.div
                                    key={selectedCase.id + '-verdict'}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                >
                                    <AiVerdictPanel verdict={selectedCase.aiVerdict} compact />
                                </motion.div>
                            ) : (
                                <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-xl p-6 text-center">
                                    <Brain className="h-10 w-10 text-neutral-700 mx-auto mb-3" />
                                    <p className="text-sm text-neutral-500">AI Analysis pending...</p>
                                </div>
                            )}

                            {/* Guidelines */}
                            <div className="bg-neutral-900/50 backdrop-blur-md border border-yellow-500/20 rounded-xl p-5">
                                <h3 className="font-semibold text-yellow-500 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                                    <Shield className="h-4 w-4" />
                                    Juror Guidelines
                                </h3>
                                <ul className="space-y-3">
                                    {[
                                        "Review all evidence carefully before voting.",
                                        "Consider AI analysis as a tool, not the final say.",
                                        "Votes are blind until the deadline passes.",
                                        "Request more context if evidence is inconclusive."
                                    ].map((item, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-neutral-400">
                                            <span className="text-yellow-500/50 font-bold">•</span>
                                            {item}
                                        </li>
                                    ))}
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
