import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    AlertCircle,
    Clock,
    TrendingUp,
    TrendingDown,
    Star,
    MessageSquare,
    Building2,
    Users,
    ArrowRight,
    Loader2
} from 'lucide-react'
import { Navbar, Footer, IssueCard, StatusBadge } from '@/components'
import { api } from '@/services/api'
import { Issue, LandlordStats } from '@/types'
import { getTimeAgo } from '@/lib/utils'

export function LandlordDashboard() {
    const [issues, setIssues] = useState<Issue[]>([])
    const [stats, setStats] = useState<LandlordStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get current user first to ensure we have the ID
                const user = await api.auth.getCurrentUser()
                if (!user) return

                const [issuesData, statsData] = await Promise.all([
                    api.issues.getByLandlordId(user.id),
                    api.landlord.getStats(user.id),
                ])
                setIssues(issuesData)
                setStats(statsData)
            } catch (error) {
                console.error('Failed to fetch landlord dashboard data:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    const pendingResponses = issues.filter(
        (i) => i.status === 'pending' || i.status === 'in-review'
    )

    return (
        <div className="min-h-screen bg-neutral-950 selection:bg-lime-500/30">
            <Navbar theme="dark" />

            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-lime-500/10 rounded-full blur-[120px] mix-blend-screen" />
            </div>

            <main className="pt-24 pb-16 relative z-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                                <Building2 className="h-7 w-7 text-violet-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white tracking-tight">
                                    Landlord Dashboard
                                </h1>
                                <p className="text-neutral-400 mt-1">
                                    Monitor property issues and maintain your reputation score.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    {stats && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-xl p-5"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-lime-400/20 flex items-center justify-center text-lime-400">
                                        <MessageSquare className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-white">{stats.totalComplaints}</p>
                                        <p className="text-sm text-neutral-400">Total Reports</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-xl p-5 relative overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 p-2 ${stats.pendingResponses > 0 ? 'text-orange-400 animate-pulse' : 'text-neutral-600'}`}>
                                    <AlertCircle className="h-5 w-5" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                                        <Clock className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-white">{stats.pendingResponses}</p>
                                        <p className="text-sm text-neutral-400">Action Needed</p>
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
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stats.reputationScore >= 70
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : stats.reputationScore >= 50
                                            ? 'bg-yellow-500/20 text-yellow-400'
                                            : 'bg-red-500/20 text-red-400'
                                        }`}>
                                        <Star className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-3xl font-bold text-white">{stats.reputationScore}</p>
                                            <span className="text-xs text-neutral-500">/ 100</span>
                                        </div>
                                        <p className="text-sm text-neutral-400">Reputation</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-xl p-5"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400">
                                        <TrendingUp className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-white">{stats.responseRate}%</p>
                                        <p className="text-sm text-neutral-400">Response Rate</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content - Active Complaints */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-white">Recent Reports</h2>
                            </div>

                            {isLoading ? (
                                <div className="py-20 text-center">
                                    <Loader2 className="h-10 w-10 text-lime-400 animate-spin mx-auto mb-4" />
                                    <p className="text-neutral-400">Loading issues...</p>
                                </div>
                            ) : issues.length === 0 ? (
                                <div className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-12 text-center">
                                    <div className="h-16 w-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MessageSquare className="h-8 w-8 text-neutral-600" />
                                    </div>
                                    <h3 className="text-lg font-medium text-white mb-2">No active issues</h3>
                                    <p className="text-neutral-400">Great job! There are no reported issues for your properties right now.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {issues.map((issue) => (
                                        <IssueCard
                                            key={issue.id}
                                            issue={issue}
                                            variant="compact"
                                            linkPrefix="/landlord/issue"
                                            showSeverity
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Urgent Response Needed */}
                            {pendingResponses.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-neutral-900/80 backdrop-blur-xl border border-orange-500/30 rounded-xl p-6 shadow-[0_0_30px_-10px_rgba(234,88,12,0.15)] relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-10 -mt-10" />

                                    <div className="flex items-center gap-2 mb-4 relative z-10">
                                        <AlertCircle className="h-5 w-5 text-orange-400" />
                                        <h3 className="font-semibold text-white">Action Required</h3>
                                    </div>

                                    <div className="space-y-3 relative z-10">
                                        {pendingResponses.slice(0, 3).map((issue) => (
                                            <Link
                                                key={issue.id}
                                                to={`/landlord/issue/${issue.id}`}
                                                className="block p-4 rounded-lg bg-neutral-800/50 border border-neutral-700 hover:border-orange-500/50 hover:bg-neutral-800 transition-all group"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs font-medium text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full border border-orange-400/20">
                                                        Wait time: {getTimeAgo(issue.createdAt)}
                                                    </span>
                                                    <ArrowRight className="h-4 w-4 text-neutral-600 group-hover:text-orange-400 transition-colors" />
                                                </div>
                                                <p className="text-sm font-medium text-white group-hover:text-orange-300 transition-colors line-clamp-1">
                                                    {issue.title}
                                                </p>
                                                <p className="text-xs text-neutral-500 mt-1 truncate">
                                                    {issue.description}
                                                </p>
                                            </Link>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Reputation Overview */}
                            {stats && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-xl p-6"
                                >
                                    <h3 className="font-semibold text-white mb-6">Reputation Health</h3>

                                    {/* Score Gauge */}
                                    <div className="relative h-40 flex items-center justify-center mb-6">
                                        <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="42"
                                                fill="none"
                                                stroke="#262626"
                                                strokeWidth="8"
                                            />
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="42"
                                                fill="none"
                                                stroke={
                                                    stats.reputationScore >= 70 ? '#10b981' :
                                                        stats.reputationScore >= 50 ? '#f59e0b' : '#ef4444'
                                                }
                                                strokeWidth="8"
                                                strokeLinecap="round"
                                                strokeDasharray={`${(stats.reputationScore / 100) * 264} 264`}
                                                className="drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-4xl font-bold text-white">
                                                {stats.reputationScore}
                                            </span>
                                            <span className="text-xs text-neutral-500">EXCELLENT</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-800/30 border border-neutral-800">
                                            <span className="text-sm text-neutral-400">Response Rate</span>
                                            <span className="font-semibold text-white">{stats.responseRate}%</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-800/30 border border-neutral-800">
                                            <span className="text-sm text-neutral-400">Avg Time</span>
                                            <span className="font-semibold text-white">{stats.averageResponseTime}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
