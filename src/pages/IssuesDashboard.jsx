import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Search, Filter, ChevronLeft, ChevronRight, AlertCircle,
    Clock, CheckCircle, XCircle, Eye, ArrowUpDown
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { categories_list, statuses_list } from '../data/mockData'

const statusConfig = {
    'Pending': { variant: 'pending', icon: Clock },
    'Under Review': { variant: 'warning', icon: AlertCircle },
    'Resolved': { variant: 'success', icon: CheckCircle },
    'Rejected': { variant: 'destructive', icon: XCircle },
}

const severityColors = {
    1: 'bg-green-500',
    2: 'bg-yellow-500',
    3: 'bg-orange-500',
    4: 'bg-red-500',
    5: 'bg-red-700',
}

export default function IssuesDashboard() {
    const { issues } = useApp()
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    const [severityFilter, setSeverityFilter] = useState('all')
    const [sortBy, setSortBy] = useState('date')
    const [sortOrder, setSortOrder] = useState('desc')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    const filteredIssues = useMemo(() => {
        let result = [...issues]

        if (searchQuery) {
            result = result.filter(issue =>
                issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                issue.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                issue.location.area.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        if (categoryFilter !== 'all') {
            result = result.filter(issue => issue.category === categoryFilter)
        }

        if (statusFilter !== 'all') {
            result = result.filter(issue => issue.status === statusFilter)
        }

        if (severityFilter !== 'all') {
            result = result.filter(issue => issue.severity === parseInt(severityFilter))
        }

        result.sort((a, b) => {
            let comparison = 0
            if (sortBy === 'date') {
                comparison = new Date(a.created_at) - new Date(b.created_at)
            } else if (sortBy === 'severity') {
                comparison = a.severity - b.severity
            }
            return sortOrder === 'desc' ? -comparison : comparison
        })

        return result
    }, [issues, searchQuery, categoryFilter, statusFilter, severityFilter, sortBy, sortOrder])

    const totalPages = Math.ceil(filteredIssues.length / itemsPerPage)
    const paginatedIssues = filteredIssues.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const stats = useMemo(() => ({
        total: issues.length,
        pending: issues.filter(i => i.status === 'Pending').length,
        underReview: issues.filter(i => i.status === 'Under Review').length,
        resolved: issues.filter(i => i.status === 'Resolved').length,
    }), [issues])

    const toggleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(field)
            setSortOrder('desc')
        }
    }

    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Issues Dashboard</h1>
                    <p className="text-muted-foreground">
                        Overview of all reported tenant issues across the platform.
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                >
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Issues</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-orange-500">{stats.pending}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Under Review</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-yellow-500">{stats.underReview}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-500">{stats.resolved}</div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-card rounded-lg border p-4 mb-6"
                >
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by ID, description, or area..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                                className="pl-10"
                            />
                        </div>
                        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1) }}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories_list.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1) }}>
                            <SelectTrigger className="w-full md:w-[160px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                {statuses_list.map(status => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={severityFilter} onValueChange={(v) => { setSeverityFilter(v); setCurrentPage(1) }}>
                            <SelectTrigger className="w-full md:w-[140px]">
                                <SelectValue placeholder="Severity" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Severities</SelectItem>
                                {[1, 2, 3, 4, 5].map(sev => (
                                    <SelectItem key={sev} value={String(sev)}>Level {sev}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </motion.div>

                {/* Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-card rounded-lg border overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Area</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        <button onClick={() => toggleSort('severity')} className="flex items-center gap-1 hover:text-primary">
                                            Severity <ArrowUpDown className="w-3 h-3" />
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">
                                        <button onClick={() => toggleSort('date')} className="flex items-center gap-1 hover:text-primary">
                                            Date <ArrowUpDown className="w-3 h-3" />
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {paginatedIssues.map((issue) => {
                                    const StatusIcon = statusConfig[issue.status]?.icon
                                    return (
                                        <tr key={issue.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 font-mono text-sm">{issue.id}</td>
                                            <td className="px-4 py-3 text-sm">{issue.category}</td>
                                            <td className="px-4 py-3 text-sm">{issue.location.area}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full ${severityColors[issue.severity]}`} />
                                                    <span className="text-sm">{issue.severity}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant={statusConfig[issue.status]?.variant}>
                                                    {StatusIcon && <StatusIcon className="w-3 h-3 mr-1" />}
                                                    {issue.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground">{issue.created_at}</td>
                                            <td className="px-4 py-3">
                                                <Button asChild variant="ghost" size="sm">
                                                    <Link to={`/issue/${issue.id}`}>
                                                        <Eye className="w-4 h-4 mr-1" /> View
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                        <span className="text-sm text-muted-foreground">
                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredIssues.length)} of {filteredIssues.length} issues
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="text-sm">Page {currentPage} of {totalPages}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
