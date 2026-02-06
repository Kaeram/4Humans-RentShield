import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Plus,
    FileText,
    Clock,
    CheckCircle,
    AlertTriangle,
    Users,
    Building,
    ArrowRight,
    RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useIssues } from '../hooks/useIssues';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Spinner } from '../components/ui/spinner';

const STATUS_CONFIG = {
    REPORTED: { label: 'Reported', variant: 'reported', icon: FileText },
    AWAITING_LANDLORD_RESPONSE: { label: 'Awaiting Response', variant: 'awaiting', icon: Clock },
    DAO_REVIEW: { label: 'DAO Review', variant: 'dao_review', icon: Users },
    DAO_VERDICT: { label: 'DAO Verdict', variant: 'dao_verdict', icon: CheckCircle },
    RESOLVED: { label: 'Resolved', variant: 'success', icon: CheckCircle },
    ESCALATED_TO_ADMIN: { label: 'Escalated', variant: 'escalated', icon: AlertTriangle },
};

function IssueCard({ issue }) {
    const statusConfig = STATUS_CONFIG[issue.status] || STATUS_CONFIG.REPORTED;
    const StatusIcon = statusConfig.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
        >
            <Link to={`/issue/${issue.id}`}>
                <Card className="hover:border-cyan-500/50 transition-all cursor-pointer bg-gray-800/50 hover:bg-gray-800/80">
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
                                    {issue.title || 'Untitled Issue'}
                                </h3>
                                <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                                    {issue.description}
                                </p>
                                <div className="flex items-center gap-3 mt-3">
                                    <Badge variant={statusConfig.variant}>
                                        <StatusIcon className="w-3 h-3 mr-1" />
                                        {statusConfig.label}
                                    </Badge>
                                    {issue.category && (
                                        <Badge variant="outline">{issue.category}</Badge>
                                    )}
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                        </div>
                        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-700/50 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Building className="w-4 h-4" />
                                {issue.property?.address || 'No address'}
                            </span>
                            <span>
                                {new Date(issue.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    );
}

export default function DashboardPage() {
    const { user, role, profile } = useAuth();
    const [activeTab, setActiveTab] = useState('all');

    // Determine which issues to fetch based on role
    const isTenant = role === 'tenant';
    const isLandlord = role === 'landlord';

    const { issues, loading, error, fetchIssues } = useIssues({
        tenantOnly: isTenant,
        landlordOnly: isLandlord,
    });

    // Filter issues by tab
    const filteredIssues = issues.filter((issue) => {
        if (activeTab === 'all') return true;
        if (activeTab === 'active') {
            return !['RESOLVED', 'ESCALATED_TO_ADMIN'].includes(issue.status);
        }
        if (activeTab === 'resolved') return issue.status === 'RESOLVED';
        if (activeTab === 'awaiting') return issue.status === 'AWAITING_LANDLORD_RESPONSE';
        return true;
    });

    // Stats
    const stats = {
        total: issues.length,
        active: issues.filter(i => !['RESOLVED', 'ESCALATED_TO_ADMIN'].includes(i.status)).length,
        resolved: issues.filter(i => i.status === 'RESOLVED').length,
        awaiting: issues.filter(i => i.status === 'AWAITING_LANDLORD_RESPONSE').length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            Welcome, {profile?.full_name || 'User'}
                        </h1>
                        <p className="text-gray-400 mt-1">
                            {isTenant ? 'Track your reported issues' : 'Manage tenant issues'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" onClick={fetchIssues}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                        {isTenant && (
                            <Link to="/report-issue">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Report Issue
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-gray-800/50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Total Issues</p>
                                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                                </div>
                                <FileText className="w-8 h-8 text-gray-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800/50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Active</p>
                                    <p className="text-2xl font-bold text-cyan-400">{stats.active}</p>
                                </div>
                                <Clock className="w-8 h-8 text-cyan-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800/50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Resolved</p>
                                    <p className="text-2xl font-bold text-green-400">{stats.resolved}</p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800/50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Awaiting</p>
                                    <p className="text-2xl font-bold text-yellow-400">{stats.awaiting}</p>
                                </div>
                                <AlertTriangle className="w-8 h-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Issues List */}
                <Card className="bg-gray-800/30">
                    <CardHeader>
                        <CardTitle>Your Issues</CardTitle>
                        <CardDescription>
                            {isTenant ? 'Issues you have reported' : 'Issues assigned to your properties'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="mb-4">
                                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                                <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
                                {isLandlord && (
                                    <TabsTrigger value="awaiting">Awaiting Response ({stats.awaiting})</TabsTrigger>
                                )}
                                <TabsTrigger value="resolved">Resolved ({stats.resolved})</TabsTrigger>
                            </TabsList>

                            <TabsContent value={activeTab} className="mt-0">
                                {loading ? (
                                    <div className="flex justify-center py-12">
                                        <Spinner size="lg" />
                                    </div>
                                ) : error ? (
                                    <div className="text-center py-12">
                                        <p className="text-red-400">{error}</p>
                                        <Button variant="outline" onClick={fetchIssues} className="mt-4">
                                            Try Again
                                        </Button>
                                    </div>
                                ) : filteredIssues.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-400">No issues found</p>
                                        {isTenant && (
                                            <Link to="/report-issue">
                                                <Button className="mt-4">
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Report Your First Issue
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {filteredIssues.map((issue) => (
                                            <IssueCard key={issue.id} issue={issue} />
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
