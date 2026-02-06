import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Gavel, Shield, Users, ThumbsUp, ThumbsDown, Clock,
    CheckCircle, AlertCircle, Eye, Award, Coins, TrendingUp
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'

const severityColors = {
    1: 'bg-green-500',
    2: 'bg-yellow-500',
    3: 'bg-orange-500',
    4: 'bg-red-500',
    5: 'bg-red-700',
}

export default function DAOPanel() {
    const { issues, getPendingDisputes } = useApp()
    const [selectedDispute, setSelectedDispute] = useState(null)
    const [hasVoted, setHasVoted] = useState(false)
    const [vote, setVote] = useState(null)

    // Get disputes that need voting (Under Review status with pending verdict)
    const activeDisputes = issues.filter(issue =>
        issue.status === 'Under Review' ||
        (issue.status === 'Pending' && issue.dao_verdict.final_decision === 'Pending')
    ).slice(0, 10)

    const recentVerdicts = issues.filter(issue =>
        issue.dao_verdict.final_decision !== 'Pending'
    ).slice(0, 5)

    // Mock juror stats
    const jurorStats = {
        casesReviewed: 47,
        accuracy: 94,
        tokensEarned: 2340,
        rank: 'Senior Juror'
    }

    const handleVote = (voteType) => {
        setVote(voteType)
        setHasVoted(true)
        // In a real app, this would submit to the blockchain
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
                    <div className="flex items-center gap-3 mb-2">
                        <Gavel className="w-8 h-8 text-purple-500" />
                        <h1 className="text-3xl md:text-4xl font-bold">DAO Arbitration Panel</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Review evidence and cast your vote on active disputes.
                    </p>
                </motion.div>

                {/* Juror Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                >
                    <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
                        <CardContent className="p-4">
                            <Users className="w-6 h-6 mb-2 opacity-80" />
                            <div className="text-2xl font-bold">{jurorStats.casesReviewed}</div>
                            <p className="text-sm opacity-80">Cases Reviewed</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white">
                        <CardContent className="p-4">
                            <TrendingUp className="w-6 h-6 mb-2 opacity-80" />
                            <div className="text-2xl font-bold">{jurorStats.accuracy}%</div>
                            <p className="text-sm opacity-80">Accuracy Rate</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                        <CardContent className="p-4">
                            <Coins className="w-6 h-6 mb-2 opacity-80" />
                            <div className="text-2xl font-bold">{jurorStats.tokensEarned}</div>
                            <p className="text-sm opacity-80">Tokens Earned</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
                        <CardContent className="p-4">
                            <Award className="w-6 h-6 mb-2 opacity-80" />
                            <div className="text-2xl font-bold">{jurorStats.rank}</div>
                            <p className="text-sm opacity-80">Your Rank</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Active Disputes List */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-1"
                    >
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-yellow-500" />
                                    Active Disputes ({activeDisputes.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                    {activeDisputes.map((dispute) => (
                                        <button
                                            key={dispute.id}
                                            onClick={() => { setSelectedDispute(dispute); setHasVoted(false); setVote(null); }}
                                            className={`w-full p-4 rounded-lg text-left transition-all ${selectedDispute?.id === dispute.id
                                                    ? 'bg-primary/10 border-2 border-primary'
                                                    : 'bg-muted/50 hover:bg-muted border-2 border-transparent'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-mono text-sm font-medium">{dispute.id}</span>
                                                <div className={`w-3 h-3 rounded-full ${severityColors[dispute.severity]}`} />
                                            </div>
                                            <p className="text-sm font-medium mb-1">{dispute.category}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-2">{dispute.description}</p>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                <span>{dispute.dao_verdict.votes_for + dispute.dao_verdict.votes_against} votes</span>
                                                <span>•</span>
                                                <span>{dispute.location.area}</span>
                                            </div>
                                        </button>
                                    ))}
                                    {activeDisputes.length === 0 && (
                                        <p className="text-center text-muted-foreground py-8">
                                            No active disputes at the moment.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Evidence Viewer & Voting */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-2"
                    >
                        <AnimatePresence mode="wait">
                            {selectedDispute ? (
                                <motion.div
                                    key={selectedDispute.id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="space-y-6"
                                >
                                    {/* Dispute Details */}
                                    <Card>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="flex items-center gap-2">
                                                    <Eye className="w-5 h-5" />
                                                    Evidence Review - {selectedDispute.id}
                                                </CardTitle>
                                                <Button asChild variant="outline" size="sm">
                                                    <Link to={`/issue/${selectedDispute.id}`}>
                                                        Full Details
                                                    </Link>
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="font-medium mb-2">Issue Description</h4>
                                                    <p className="text-sm text-muted-foreground mb-4">
                                                        {selectedDispute.description}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        <Badge>{selectedDispute.category}</Badge>
                                                        <Badge variant="secondary">{selectedDispute.location.area}</Badge>
                                                        <Badge variant="outline">Severity: {selectedDispute.severity}/5</Badge>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium mb-2">Evidence Images</h4>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {selectedDispute.images.map((img, index) => (
                                                            <div
                                                                key={index}
                                                                className="aspect-video rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center"
                                                            >
                                                                <span className="text-xs text-muted-foreground">{img}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* AI Confidence */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Shield className="w-5 h-5 text-blue-500" />
                                                AI Analysis
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid md:grid-cols-3 gap-4">
                                                <div className="text-center p-4 rounded-lg bg-muted/50">
                                                    <div className="text-3xl font-bold text-blue-500 mb-1">
                                                        {Math.round(selectedDispute.ai_verdict.confidence_score * 100)}%
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">Confidence Score</p>
                                                </div>
                                                <div className="text-center p-4 rounded-lg bg-muted/50">
                                                    <div className="text-3xl font-bold text-red-500 mb-1">
                                                        {Math.round(selectedDispute.ai_verdict.tampering_probability * 100)}%
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">Tampering Probability</p>
                                                </div>
                                                <div className="text-center p-4 rounded-lg bg-muted/50">
                                                    <Badge variant={selectedDispute.ai_verdict.exif_valid ? 'success' : 'destructive'} className="text-lg px-4 py-1">
                                                        {selectedDispute.ai_verdict.exif_valid ? 'EXIF Valid' : 'EXIF Invalid'}
                                                    </Badge>
                                                    <p className="text-sm text-muted-foreground mt-2">Metadata Status</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Voting Section */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Gavel className="w-5 h-5 text-purple-500" />
                                                Cast Your Vote
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {!hasVoted ? (
                                                <div className="space-y-6">
                                                    <p className="text-muted-foreground text-center">
                                                        Based on the evidence presented, do you believe this is a valid claim?
                                                    </p>
                                                    <div className="flex justify-center gap-4">
                                                        <Button
                                                            size="lg"
                                                            className="gap-2 bg-green-600 hover:bg-green-700 text-white px-8"
                                                            onClick={() => handleVote('valid')}
                                                        >
                                                            <ThumbsUp className="w-5 h-5" />
                                                            Valid Claim
                                                        </Button>
                                                        <Button
                                                            size="lg"
                                                            variant="outline"
                                                            className="gap-2 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 px-8"
                                                            onClick={() => handleVote('invalid')}
                                                        >
                                                            <ThumbsDown className="w-5 h-5" />
                                                            Invalid Claim
                                                        </Button>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm text-muted-foreground">
                                                            Current votes: {selectedDispute.dao_verdict.votes_for} Valid / {selectedDispute.dao_verdict.votes_against} Invalid
                                                        </p>
                                                        <Progress
                                                            value={(selectedDispute.dao_verdict.votes_for / (selectedDispute.dao_verdict.votes_for + selectedDispute.dao_verdict.votes_against + 0.01)) * 100}
                                                            className="mt-2 h-2"
                                                            indicatorClassName="bg-green-500"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="text-center py-6"
                                                >
                                                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                                                    <h3 className="text-xl font-semibold mb-2">Vote Submitted!</h3>
                                                    <p className="text-muted-foreground mb-4">
                                                        You voted: <span className="font-medium">{vote === 'valid' ? 'Valid Claim' : 'Invalid Claim'}</span>
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        +50 tokens earned for participating in arbitration.
                                                    </p>
                                                </motion.div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-full"
                                >
                                    <Card className="h-full min-h-[400px] flex items-center justify-center">
                                        <CardContent className="text-center">
                                            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                                            <h3 className="text-xl font-semibold mb-2">Select a Dispute</h3>
                                            <p className="text-muted-foreground">
                                                Choose a dispute from the list to review evidence and cast your vote.
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Recent Verdicts */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                Recent Verdicts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-5 gap-4">
                                {recentVerdicts.map((verdict) => (
                                    <div
                                        key={verdict.id}
                                        className="p-4 rounded-lg bg-muted/50 text-center"
                                    >
                                        <span className="font-mono text-sm">{verdict.id}</span>
                                        <Badge
                                            variant={verdict.dao_verdict.final_decision === 'Valid' ? 'success' : 'destructive'}
                                            className="block mt-2"
                                        >
                                            {verdict.dao_verdict.final_decision}
                                        </Badge>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {verdict.dao_verdict.votes_for} / {verdict.dao_verdict.votes_against}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
