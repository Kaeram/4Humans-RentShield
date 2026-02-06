import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Shield, TrendingUp, AlertCircle, Clock, FileText } from 'lucide-react'
import { Navbar, Footer, IssueCard, StatusBadge } from '@/components'
import { api } from '@/services/api'
import { Issue } from '@/types'

const quickStats = [
    { label: 'Total Reports', value: '4', icon: FileText, color: 'text-violet-400' },
    { label: 'In Progress', value: '2', icon: Clock, color: 'text-amber-400' },
    { label: 'Resolved', value: '1', icon: TrendingUp, color: 'text-lime-400' },
    { label: 'Escalated', value: '1', icon: AlertCircle, color: 'text-red-400' },
]

export function TenantDashboard() {
    const [issues, setIssues] = useState<Issue[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all')

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const data = await api.issues.getByTenantId('tenant-1')
                setIssues(data)
            } finally {
                setIsLoading(false)
            }
        }
        fetchIssues()
    }, [])

    const filteredIssues = issues.filter((issue) => {
        if (filter === 'active') return !['resolved', 'dismissed'].includes(issue.status)
        if (filter === 'resolved') return ['resolved', 'dismissed'].includes(issue.status)
        return true
    })

    return (
        <div className="min-h-screen bg-neutral-950 selection:bg-lime-500/30">
            <Navbar theme="dark" />

            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-lime-500/10 rounded-full blur-[120px] mix-blend-screen" />
            </div>

            <main className="pt-24 pb-16 relative z-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-display font-bold text-white">
                                Tenant Dashboard
                            </h1>
                            <p className="text-neutral-400 mt-1">
                                Track your housing issues and get fair resolutions.
                            </p>
                        </div>
                        <Link to="/tenant/report" className="inline-flex items-center gap-2 rounded-lg bg-lime-400 px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-lime-300 transition-colors">
                            <Plus className="h-4 w-4" />
                            Report New Issue
                        </Link>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {quickStats.map((stat, idx) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 p-4 rounded-xl"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center bg-neutral-800/50 ${stat.color}`}>
                                        <stat.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                                        <p className="text-xs text-neutral-400">{stat.label}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Reputation Protection Notice */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-violet-900/20 to-lime-900/20 rounded-xl p-4 border border-violet-500/20 mb-8 backdrop-blur-md"
                    >
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0 border border-violet-500/30">
                                <Shield className="h-5 w-5 text-violet-300" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Your Identity is Protected</h3>
                                <p className="text-sm text-neutral-400 mt-1">
                                    All your reports are anonymized. Landlords and DAO members cannot see your personal information
                                    unless you explicitly grant access. Your reputation and housing history remain private.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Issues List */}
                    <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-xl overflow-hidden">
                        {/* Filter Tabs */}
                        <div className="flex items-center gap-4 p-4 border-b border-neutral-800">
                            <h2 className="font-semibold text-white">Your Issues</h2>
                            <div className="flex-1" />
                            <div className="flex items-center gap-2">
                                {(['all', 'active', 'resolved'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f
                                            ? 'bg-lime-400/10 text-lime-400 border border-lime-400/20'
                                            : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                                            }`}
                                    >
                                        {f.charAt(0).toUpperCase() + f.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Issues */}
                        <div className="divide-y divide-neutral-800">
                            {isLoading ? (
                                <div className="p-8 text-center">
                                    <div className="animate-spin h-8 w-8 border-2 border-lime-400 border-t-transparent rounded-full mx-auto" />
                                    <p className="mt-2 text-sm text-neutral-500">Loading issues...</p>
                                </div>
                            ) : filteredIssues.length === 0 ? (
                                <div className="p-8 text-center">
                                    <FileText className="h-12 w-12 text-neutral-700 mx-auto mb-3" />
                                    <p className="text-neutral-500">No issues found</p>
                                    <Link to="/tenant/report" className="inline-flex items-center gap-2 mt-4 text-lime-400 hover:text-lime-300 font-medium">
                                        <Plus className="h-4 w-4" />
                                        Report Your First Issue
                                    </Link>
                                </div>
                            ) : (
                                filteredIssues.map((issue) => (
                                    <div key={issue.id} className="p-4 hover:bg-neutral-800/30 transition-colors">
                                        <IssueCard issue={issue} variant="compact" linkPrefix="/tenant/issue" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recent Activity Timeline */}
                    <div className="mt-8">
                        <h3 className="font-semibold text-white mb-4">Recent Activity</h3>
                        <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 p-4 rounded-xl">
                            <div className="space-y-4">
                                {issues.slice(0, 3).flatMap((issue) =>
                                    issue.timeline.slice(-2).map((event) => (
                                        <div key={event.id} className="flex items-start gap-3">
                                            <div className="h-2 w-2 rounded-full bg-lime-500 mt-2 shadow-[0_0_8px_rgba(132,204,22,0.5)]" />
                                            <div className="flex-1">
                                                <p className="text-sm text-neutral-300">{event.message}</p>
                                                <p className="text-xs text-neutral-500 mt-0.5">
                                                    {issue.title} • {new Date(event.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <StatusBadge status={issue.status} size="sm" />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
