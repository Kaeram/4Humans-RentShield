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
    Building2
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
                const [issuesData, statsData] = await Promise.all([
                    api.issues.getByLandlordId('landlord-1'),
                    api.landlord.getStats('landlord-1'),
                ])
                setIssues(issuesData)
                setStats(statsData)
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
        <div className="min-h-screen bg-neutral-50">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-accent-100 flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-accent-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-display font-bold text-neutral-900">
                                    Landlord Dashboard
                                </h1>
                                <p className="text-neutral-600">
                                    Manage complaints and maintain your reputation.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    {stats && (
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                                        <MessageSquare className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-neutral-900">{stats.totalComplaints}</p>
                                        <p className="text-xs text-neutral-500">Total Complaints</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="card p-4 border-warning-200 bg-warning-50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-warning-100 flex items-center justify-center text-warning-600">
                                        <AlertCircle className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-warning-700">{stats.pendingResponses}</p>
                                        <p className="text-xs text-warning-600">Pending Responses</p>
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
                                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stats.reputationScore >= 70
                                            ? 'bg-success-100 text-success-600'
                                            : stats.reputationScore >= 50
                                                ? 'bg-warning-100 text-warning-600'
                                                : 'bg-danger-100 text-danger-600'
                                        }`}>
                                        <Star className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-neutral-900">{stats.reputationScore}</p>
                                        <p className="text-xs text-neutral-500">Reputation Score</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="card p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-success-100 flex items-center justify-center text-success-600">
                                        <TrendingUp className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-neutral-900">{stats.responseRate}%</p>
                                        <p className="text-xs text-neutral-500">Response Rate</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="card p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-neutral-900">{stats.averageResponseTime}</p>
                                        <p className="text-xs text-neutral-500">Avg Response</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content - Active Complaints */}
                        <div className="lg:col-span-2">
                            <div className="card p-0 overflow-hidden">
                                <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                                    <h2 className="font-semibold text-neutral-900">Active Complaints</h2>
                                    <Link to="#" className="text-sm text-primary-600 hover:text-primary-700">
                                        View All
                                    </Link>
                                </div>

                                {isLoading ? (
                                    <div className="p-8 text-center">
                                        <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto" />
                                    </div>
                                ) : issues.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <MessageSquare className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                                        <p className="text-neutral-500">No active complaints</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-neutral-100">
                                        {issues.map((issue) => (
                                            <div key={issue.id} className="p-4">
                                                <IssueCard
                                                    issue={issue}
                                                    variant="compact"
                                                    linkPrefix="/landlord/issue"
                                                    showSeverity
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Urgent Response Needed */}
                            {pendingResponses.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="card border-warning-200 bg-gradient-to-br from-warning-50 to-white"
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <AlertCircle className="h-5 w-5 text-warning-600" />
                                        <h3 className="font-semibold text-warning-700">Response Needed</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {pendingResponses.slice(0, 3).map((issue) => (
                                            <Link
                                                key={issue.id}
                                                to={`/landlord/issue/${issue.id}`}
                                                className="block p-3 rounded-lg bg-white border border-warning-100 hover:border-warning-300 transition-colors"
                                            >
                                                <p className="text-sm font-medium text-neutral-900 mb-1">
                                                    {issue.title}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <StatusBadge status={issue.status} size="sm" />
                                                    <span className="text-xs text-neutral-500">
                                                        {getTimeAgo(issue.createdAt)}
                                                    </span>
                                                </div>
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
                                    className="card"
                                >
                                    <h3 className="font-semibold text-neutral-900 mb-4">Reputation Overview</h3>

                                    {/* Score Gauge */}
                                    <div className="relative h-32 flex items-center justify-center mb-4">
                                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="42"
                                                fill="none"
                                                stroke="#e4e4e7"
                                                strokeWidth="10"
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
                                                strokeWidth="10"
                                                strokeLinecap="round"
                                                strokeDasharray={`${(stats.reputationScore / 100) * 264} 264`}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-3xl font-bold text-neutral-900">
                                                {stats.reputationScore}
                                            </span>
                                            <span className="text-xs text-neutral-500">/ 100</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-neutral-600">Response Rate</span>
                                            <span className="font-medium text-neutral-900">{stats.responseRate}%</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-neutral-600">Avg Response Time</span>
                                            <span className="font-medium text-neutral-900">{stats.averageResponseTime}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 p-3 rounded-lg bg-neutral-50">
                                        <div className="flex items-start gap-2">
                                            {stats.reputationScore >= 70 ? (
                                                <TrendingUp className="h-4 w-4 text-success-500 mt-0.5" />
                                            ) : (
                                                <TrendingDown className="h-4 w-4 text-danger-500 mt-0.5" />
                                            )}
                                            <p className="text-xs text-neutral-600">
                                                {stats.reputationScore >= 70
                                                    ? 'Great work! Your reputation is in good standing.'
                                                    : 'Respond to pending issues promptly to improve your score.'}
                                            </p>
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
