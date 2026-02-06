import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Shield,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Building,
    User,
    FileText,
    RefreshCw,
    Eye,
    Gavel,
    MessageSquare,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useIssues } from '../hooks/useIssues';
import { supabase } from '../lib/supabaseClient';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Spinner } from '../components/ui/spinner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../components/ui/dialog';

function EscalatedIssueCard({ issue, onAction }) {
    const { toast } = useToast();
    const [showActionDialog, setShowActionDialog] = useState(false);
    const [action, setAction] = useState(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAction = async () => {
        if (!action) return;

        setLoading(true);
        try {
            const newStatus = action === 'resolve' ? 'RESOLVED' : 'CLOSED';

            // Update issue status
            const { error } = await supabase
                .from('issues')
                .update({
                    status: newStatus,
                    admin_notes: adminNotes,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', issue.id);

            if (error) throw error;

            toast.success(
                action === 'resolve' ? 'Issue Resolved' : 'Issue Closed',
                'The issue has been updated'
            );
            setShowActionDialog(false);
            onAction?.();
        } catch (error) {
            toast.error('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-gray-800/50 border-red-500/30 hover:bg-gray-800/70 transition-colors">
                <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                                <Badge variant="escalated">Escalated</Badge>
                            </div>

                            <Link
                                to={`/issue/${issue.id}`}
                                className="font-semibold text-white hover:text-cyan-400 transition-colors block truncate"
                            >
                                {issue.title || 'Untitled Issue'}
                            </Link>
                            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                                {issue.description}
                            </p>

                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Building className="w-4 h-4" />
                                    {issue.property?.address?.slice(0, 30) || 'Unknown'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    {issue.tenant?.full_name || 'Tenant'}
                                </span>
                            </div>

                            <div className="mt-3 text-xs text-gray-500">
                                Escalated: {new Date(issue.updated_at).toLocaleString()}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Link to={`/issue/${issue.id}`}>
                                <Button variant="outline" size="sm">
                                    <Eye className="w-4 h-4 mr-1" />
                                    View
                                </Button>
                            </Link>
                            <Button
                                size="sm"
                                onClick={() => setShowActionDialog(true)}
                            >
                                <Gavel className="w-4 h-4 mr-1" />
                                Action
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Dialog */}
            <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Gavel className="w-5 h-5 text-cyan-400" />
                            Admin Action
                        </DialogTitle>
                        <DialogDescription>
                            Take action on this escalated case
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="p-4 rounded-lg bg-gray-700/50">
                            <h4 className="font-medium text-white mb-1">{issue.title}</h4>
                            <p className="text-sm text-gray-400">
                                Tenant: {issue.tenant?.full_name} vs Landlord: {issue.landlord?.full_name}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setAction('resolve')}
                                className={`p-4 rounded-lg border transition-all text-center ${action === 'resolve'
                                        ? 'border-green-500 bg-green-500/10'
                                        : 'border-gray-600 hover:border-gray-500'
                                    }`}
                            >
                                <CheckCircle className={`w-6 h-6 mx-auto mb-2 ${action === 'resolve' ? 'text-green-400' : 'text-gray-400'
                                    }`} />
                                <span className={`text-sm font-medium ${action === 'resolve' ? 'text-green-400' : 'text-gray-300'
                                    }`}>
                                    Resolve
                                </span>
                            </button>

                            <button
                                onClick={() => setAction('close')}
                                className={`p-4 rounded-lg border transition-all text-center ${action === 'close'
                                        ? 'border-red-500 bg-red-500/10'
                                        : 'border-gray-600 hover:border-gray-500'
                                    }`}
                            >
                                <XCircle className={`w-6 h-6 mx-auto mb-2 ${action === 'close' ? 'text-red-400' : 'text-gray-400'
                                    }`} />
                                <span className={`text-sm font-medium ${action === 'close' ? 'text-red-400' : 'text-gray-300'
                                    }`}>
                                    Close
                                </span>
                            </button>
                        </div>

                        <Textarea
                            placeholder="Add admin notes (required)..."
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowActionDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAction}
                            disabled={!action || !adminNotes.trim()}
                            loading={loading}
                        >
                            Confirm Action
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}

export default function AdminPage() {
    const { issues: escalatedIssues, loading, fetchIssues } = useIssues({ status: 'ESCALATED_TO_ADMIN' });
    const { issues: allIssues } = useIssues();
    const [activeTab, setActiveTab] = useState('escalated');

    // Calculate stats
    const stats = {
        escalated: escalatedIssues.length,
        total: allIssues.length,
        resolved: allIssues.filter(i => i.status === 'RESOLVED').length,
        active: allIssues.filter(i => !['RESOLVED', 'ESCALATED_TO_ADMIN', 'CLOSED'].includes(i.status)).length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Shield className="w-8 h-8 text-red-400" />
                            Admin Panel
                        </h1>
                        <p className="text-gray-400 mt-1">
                            Manage escalated cases and platform oversight
                        </p>
                    </div>
                    <Button variant="outline" onClick={fetchIssues}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-red-500/10 border-red-500/30">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Escalated</p>
                                    <p className="text-2xl font-bold text-red-400">{stats.escalated}</p>
                                </div>
                                <AlertTriangle className="w-8 h-8 text-red-500/50" />
                            </div>
                        </CardContent>
                    </Card>
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
                                <MessageSquare className="w-8 h-8 text-cyan-600" />
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
                </div>

                {/* Main Content */}
                <Card className="bg-gray-800/30">
                    <CardHeader>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList>
                                <TabsTrigger value="escalated">
                                    Escalated Cases ({stats.escalated})
                                </TabsTrigger>
                                <TabsTrigger value="all">
                                    All Issues ({stats.total})
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </CardHeader>
                    <CardContent>
                        {activeTab === 'escalated' && (
                            <>
                                {loading ? (
                                    <div className="flex justify-center py-12">
                                        <Spinner size="lg" />
                                    </div>
                                ) : escalatedIssues.length === 0 ? (
                                    <div className="text-center py-12">
                                        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                                        <p className="text-gray-400">No escalated cases</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            All current issues are being handled normally
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {escalatedIssues.map((issue) => (
                                            <EscalatedIssueCard
                                                key={issue.id}
                                                issue={issue}
                                                onAction={fetchIssues}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === 'all' && (
                            <>
                                {allIssues.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-400">No issues in the system</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {allIssues.map((issue) => (
                                            <Link key={issue.id} to={`/issue/${issue.id}`}>
                                                <Card className="bg-gray-800/50 hover:bg-gray-800/70 transition-colors cursor-pointer">
                                                    <CardContent className="p-4 flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium text-white">{issue.title}</p>
                                                            <p className="text-sm text-gray-400">
                                                                {issue.property?.city} • {new Date(issue.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <Badge variant={
                                                            issue.status === 'RESOLVED' ? 'success' :
                                                                issue.status === 'ESCALATED_TO_ADMIN' ? 'escalated' :
                                                                    'default'
                                                        }>
                                                            {issue.status.replace(/_/g, ' ')}
                                                        </Badge>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
