import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Vote,
    Scale,
    Eye,
    EyeOff,
    CheckCircle,
    AlertTriangle,
    User,
    Building,
    MessageSquare,
    ArrowRight,
    RefreshCw,
    ThumbsUp,
    ThumbsDown,
    Minus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useIssues } from '../hooks/useIssues';
import { useDAOVotes } from '../hooks/useDAOVotes';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Spinner } from '../components/ui/spinner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../components/ui/dialog';

function VoteCard({ issue, onVoteSuccess }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const { castVote, hasVoted, getVoteSummary, loading, VOTE_THRESHOLD } = useDAOVotes();

    const [alreadyVoted, setAlreadyVoted] = useState(false);
    const [voteSummary, setVoteSummary] = useState({ total: 0, favor_tenant: 0, favor_landlord: 0 });
    const [showVoteDialog, setShowVoteDialog] = useState(false);
    const [selectedVote, setSelectedVote] = useState(null);
    const [reasoning, setReasoning] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function checkStatus() {
            const voted = await hasVoted(issue.id);
            setAlreadyVoted(voted);
            if (voted) {
                const summary = await getVoteSummary(issue.id);
                setVoteSummary(summary);
            }
        }
        checkStatus();
    }, [issue.id, hasVoted, getVoteSummary]);

    const handleVote = async () => {
        if (!selectedVote) return;

        setSubmitting(true);
        try {
            const { error } = await castVote(issue.id, selectedVote, reasoning);
            if (error) throw error;

            toast.success('Vote Cast!', 'Your vote has been recorded');
            setShowVoteDialog(false);
            setAlreadyVoted(true);
            const summary = await getVoteSummary(issue.id);
            setVoteSummary(summary);
            onVoteSuccess?.();
        } catch (error) {
            toast.error('Error', error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const voteProgress = (voteSummary.total / VOTE_THRESHOLD) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card className="bg-gray-800/50 hover:bg-gray-800/70 transition-colors">
                <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
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
                                    {issue.property?.city || 'Unknown'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    vs {issue.landlord?.full_name || 'Landlord'}
                                </span>
                            </div>

                            {/* Vote Progress */}
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Votes: {voteSummary.total}/{VOTE_THRESHOLD}</span>
                                    {voteSummary.total >= VOTE_THRESHOLD && (
                                        <Badge variant="success">Threshold Reached</Badge>
                                    )}
                                </div>
                                <Progress value={voteProgress} className="h-2" />
                            </div>
                        </div>

                        <div className="flex-shrink-0">
                            {alreadyVoted ? (
                                <div className="flex flex-col items-center gap-2">
                                    <CheckCircle className="w-8 h-8 text-green-400" />
                                    <span className="text-xs text-green-400">Voted</span>
                                </div>
                            ) : (
                                <Button onClick={() => setShowVoteDialog(true)} size="sm">
                                    <Vote className="w-4 h-4 mr-2" />
                                    Cast Vote
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Vote Summary (only visible after voting) */}
                    {alreadyVoted && voteSummary.total > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-700 flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-green-400">
                                <ThumbsUp className="w-4 h-4" />
                                <span>{voteSummary.favor_tenant} Tenant</span>
                            </div>
                            <div className="flex items-center gap-1 text-red-400">
                                <ThumbsDown className="w-4 h-4" />
                                <span>{voteSummary.favor_landlord} Landlord</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-400">
                                <Minus className="w-4 h-4" />
                                <span>{voteSummary.abstain} Abstain</span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Vote Dialog */}
            <Dialog open={showVoteDialog} onOpenChange={setShowVoteDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Scale className="w-5 h-5 text-cyan-400" />
                            Cast Your Vote
                        </DialogTitle>
                        <DialogDescription>
                            Review the case and cast your vote. Your decision helps resolve disputes fairly.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="p-4 rounded-lg bg-gray-700/50">
                            <h4 className="font-medium text-white mb-2">{issue.title}</h4>
                            <p className="text-sm text-gray-400 line-clamp-3">{issue.description}</p>
                            <Link
                                to={`/issue/${issue.id}`}
                                target="_blank"
                                className="text-sm text-cyan-400 hover:text-cyan-300 mt-2 inline-flex items-center gap-1"
                            >
                                View full details
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setSelectedVote('favor_tenant')}
                                className={`p-4 rounded-lg border transition-all ${selectedVote === 'favor_tenant'
                                        ? 'border-green-500 bg-green-500/10'
                                        : 'border-gray-600 hover:border-gray-500'
                                    }`}
                            >
                                <ThumbsUp className={`w-6 h-6 mx-auto mb-2 ${selectedVote === 'favor_tenant' ? 'text-green-400' : 'text-gray-400'
                                    }`} />
                                <span className={`text-sm font-medium ${selectedVote === 'favor_tenant' ? 'text-green-400' : 'text-gray-300'
                                    }`}>
                                    Favor Tenant
                                </span>
                            </button>

                            <button
                                onClick={() => setSelectedVote('favor_landlord')}
                                className={`p-4 rounded-lg border transition-all ${selectedVote === 'favor_landlord'
                                        ? 'border-red-500 bg-red-500/10'
                                        : 'border-gray-600 hover:border-gray-500'
                                    }`}
                            >
                                <ThumbsDown className={`w-6 h-6 mx-auto mb-2 ${selectedVote === 'favor_landlord' ? 'text-red-400' : 'text-gray-400'
                                    }`} />
                                <span className={`text-sm font-medium ${selectedVote === 'favor_landlord' ? 'text-red-400' : 'text-gray-300'
                                    }`}>
                                    Favor Landlord
                                </span>
                            </button>

                            <button
                                onClick={() => setSelectedVote('abstain')}
                                className={`p-4 rounded-lg border transition-all ${selectedVote === 'abstain'
                                        ? 'border-gray-400 bg-gray-500/10'
                                        : 'border-gray-600 hover:border-gray-500'
                                    }`}
                            >
                                <Minus className={`w-6 h-6 mx-auto mb-2 ${selectedVote === 'abstain' ? 'text-gray-300' : 'text-gray-400'
                                    }`} />
                                <span className={`text-sm font-medium ${selectedVote === 'abstain' ? 'text-gray-300' : 'text-gray-400'
                                    }`}>
                                    Abstain
                                </span>
                            </button>
                        </div>

                        <Textarea
                            placeholder="Add your reasoning (optional)..."
                            value={reasoning}
                            onChange={(e) => setReasoning(e.target.value)}
                            className="min-h-[80px]"
                        />

                        <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-700/30 text-sm text-gray-400">
                            <EyeOff className="w-4 h-4 flex-shrink-0" />
                            <span>Your vote is private. Other jurors cannot see individual votes until the case is closed.</span>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowVoteDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleVote}
                            disabled={!selectedVote}
                            loading={submitting}
                        >
                            Submit Vote
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}

export default function DAOPage() {
    const { issues, loading, error, fetchIssues } = useIssues({ status: 'DAO_REVIEW' });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Scale className="w-8 h-8 text-purple-400" />
                            DAO Voting Panel
                        </h1>
                        <p className="text-gray-400 mt-1">
                            Review cases and cast your vote to help resolve disputes
                        </p>
                    </div>
                    <Button variant="outline" onClick={fetchIssues}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-gray-800/50">
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-purple-400">{issues.length}</p>
                            <p className="text-sm text-gray-400">Pending Cases</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800/50">
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-cyan-400">10</p>
                            <p className="text-sm text-gray-400">Votes Required</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-800/50">
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-green-400">Fair</p>
                            <p className="text-sm text-gray-400">Resolution Goal</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Cases List */}
                <Card className="bg-gray-800/30">
                    <CardHeader>
                        <CardTitle>Cases Awaiting Vote</CardTitle>
                        <CardDescription>
                            These cases have received both tenant and landlord input
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Spinner size="lg" />
                            </div>
                        ) : error ? (
                            <div className="text-center py-12">
                                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                                <p className="text-red-400">{error}</p>
                                <Button variant="outline" onClick={fetchIssues} className="mt-4">
                                    Try Again
                                </Button>
                            </div>
                        ) : issues.length === 0 ? (
                            <div className="text-center py-12">
                                <Vote className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400">No cases pending for review</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Check back later for new cases to vote on
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {issues.map((issue) => (
                                    <VoteCard key={issue.id} issue={issue} onVoteSuccess={fetchIssues} />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Guidelines */}
                <Card className="bg-gray-800/30 border-purple-500/20">
                    <CardHeader>
                        <CardTitle className="text-lg">Voting Guidelines</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-gray-400">
                        <div className="flex items-start gap-3">
                            <Eye className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                            <p>Review all evidence and statements from both parties before voting</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <Scale className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                            <p>Vote based on evidence and facts, not personal bias</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <EyeOff className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                            <p>Your vote is confidential until the case reaches 10 votes</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                            <p>Once 10 votes are cast, the majority decision becomes the verdict</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
