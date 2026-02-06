import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    ArrowLeft, Calendar, MapPin, AlertCircle, CheckCircle, XCircle,
    Image, Shield, Users, Clock, ExternalLink
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'

const statusConfig = {
    'Pending': { variant: 'pending', icon: Clock, color: 'text-orange-500' },
    'Under Review': { variant: 'warning', icon: AlertCircle, color: 'text-yellow-500' },
    'Resolved': { variant: 'success', icon: CheckCircle, color: 'text-green-500' },
    'Rejected': { variant: 'destructive', icon: XCircle, color: 'text-red-500' },
}

const severityColors = {
    1: { bg: 'bg-green-500', text: 'text-green-500', label: 'Minor' },
    2: { bg: 'bg-yellow-500', text: 'text-yellow-500', label: 'Moderate' },
    3: { bg: 'bg-orange-500', text: 'text-orange-500', label: 'Significant' },
    4: { bg: 'bg-red-500', text: 'text-red-500', label: 'Severe' },
    5: { bg: 'bg-red-700', text: 'text-red-700', label: 'Critical' },
}

export default function IssueDetail() {
    const { id } = useParams()
    const { getIssueById, getPropertyById } = useApp()

    const issue = getIssueById(id)

    if (!issue) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="p-8 text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h2 className="text-xl font-semibold mb-2">Issue Not Found</h2>
                    <p className="text-muted-foreground mb-4">The issue you're looking for doesn't exist.</p>
                    <Button asChild>
                        <Link to="/dashboard">Back to Dashboard</Link>
                    </Button>
                </Card>
            </div>
        )
    }

    const property = getPropertyById(issue.property_id)
    const StatusIcon = statusConfig[issue.status]?.icon
    const totalVotes = issue.dao_verdict.votes_for + issue.dao_verdict.votes_against
    const forPercentage = totalVotes > 0 ? (issue.dao_verdict.votes_for / totalVotes) * 100 : 0

    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Back button */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-6"
                >
                    <Button asChild variant="ghost" className="gap-2">
                        <Link to="/dashboard">
                            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                        </Link>
                    </Button>
                </motion.div>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
                >
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold">{issue.id}</h1>
                            <Badge variant={statusConfig[issue.status]?.variant} className="text-sm">
                                {StatusIcon && <StatusIcon className="w-3 h-3 mr-1" />}
                                {issue.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">{issue.category}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {issue.created_at}
                        </span>
                        <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {issue.location.area}
                        </span>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>Issue Description</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-foreground leading-relaxed">{issue.description}</p>
                                    <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-4 h-4 rounded-full ${severityColors[issue.severity].bg}`} />
                                            <span className={`font-medium ${severityColors[issue.severity].text}`}>
                                                Severity: {issue.severity}/5 ({severityColors[issue.severity].label})
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Image Gallery */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Image className="w-5 h-5" />
                                        Evidence Gallery
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {issue.images.map((img, index) => (
                                            <div
                                                key={index}
                                                className="aspect-square rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center overflow-hidden hover:ring-2 ring-primary cursor-pointer transition-all"
                                            >
                                                <span className="text-xs text-muted-foreground text-center p-2">{img}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* AI Verification */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-blue-500" />
                                        AI Verification Report
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-muted-foreground">EXIF Data Valid</span>
                                                <Badge variant={issue.ai_verdict.exif_valid ? 'success' : 'destructive'}>
                                                    {issue.ai_verdict.exif_valid ? 'Valid' : 'Invalid'}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-muted-foreground">Auto Category</span>
                                                <Badge variant="secondary">{issue.ai_verdict.auto_category}</Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm text-muted-foreground">Confidence Score</span>
                                                    <span className="text-sm font-medium">{Math.round(issue.ai_verdict.confidence_score * 100)}%</span>
                                                </div>
                                                <Progress value={issue.ai_verdict.confidence_score * 100} indicatorClassName="bg-blue-500" />
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm text-muted-foreground">Tampering Probability</span>
                                                    <span className="text-sm font-medium text-red-500">{Math.round(issue.ai_verdict.tampering_probability * 100)}%</span>
                                                </div>
                                                <Progress value={issue.ai_verdict.tampering_probability * 100} indicatorClassName="bg-red-500" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* DAO Voting */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-purple-500" />
                                        DAO Voting
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center mb-6">
                                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-3 ${issue.dao_verdict.final_decision === 'Valid' ? 'bg-green-100 dark:bg-green-900/30' :
                                                issue.dao_verdict.final_decision === 'Invalid' ? 'bg-red-100 dark:bg-red-900/30' :
                                                    'bg-yellow-100 dark:bg-yellow-900/30'
                                            }`}>
                                            {issue.dao_verdict.final_decision === 'Valid' && <CheckCircle className="w-10 h-10 text-green-500" />}
                                            {issue.dao_verdict.final_decision === 'Invalid' && <XCircle className="w-10 h-10 text-red-500" />}
                                            {issue.dao_verdict.final_decision === 'Pending' && <Clock className="w-10 h-10 text-yellow-500" />}
                                        </div>
                                        <div className="text-xl font-bold">{issue.dao_verdict.final_decision}</div>
                                        <p className="text-sm text-muted-foreground">Final Verdict</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-green-500">Valid ({issue.dao_verdict.votes_for})</span>
                                                <span className="text-red-500">Invalid ({issue.dao_verdict.votes_against})</span>
                                            </div>
                                            <div className="h-4 bg-red-200 dark:bg-red-900/30 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500 rounded-full transition-all"
                                                    style={{ width: `${forPercentage}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="text-center text-sm text-muted-foreground">
                                            {totalVotes} total votes cast
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Property Info */}
                        {property && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Property Info</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Property ID</p>
                                                <p className="font-mono">{property.property_id}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Area</p>
                                                <p>{property.area}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Risk Score</p>
                                                <div className="flex items-center gap-2">
                                                    <div className={`text-lg font-bold ${property.risk_score > 70 ? 'text-red-500' :
                                                            property.risk_score > 40 ? 'text-yellow-500' : 'text-green-500'
                                                        }`}>
                                                        {property.risk_score}/100
                                                    </div>
                                                </div>
                                            </div>
                                            <Button asChild variant="outline" className="w-full mt-4">
                                                <Link to={`/property/${property.property_id}`}>
                                                    View Property Profile <ExternalLink className="w-4 h-4 ml-2" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
