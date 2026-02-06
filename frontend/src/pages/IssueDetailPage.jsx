import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Building,
    User,
    Clock,
    FileText,
    MessageSquare,
    Upload,
    X,
    CheckCircle,
    AlertTriangle,
    Send,
    Vote,
    Image as ImageIcon,
    Bot,
    Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useIssueDetail } from '../hooks/useIssues';
import { useEvidence } from '../hooks/useEvidence';
import { useLandlordResponse, useResolutionFollowup } from '../hooks/useLandlordResponse';
import { analyzeCase } from '../services/aiService';
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

const STATUS_CONFIG = {
    REPORTED: { label: 'Reported', variant: 'reported', color: 'text-blue-400' },
    AWAITING_LANDLORD_RESPONSE: { label: 'Awaiting Landlord Response', variant: 'awaiting', color: 'text-yellow-400' },
    DAO_REVIEW: { label: 'DAO Review', variant: 'dao_review', color: 'text-purple-400' },
    DAO_VERDICT: { label: 'DAO Verdict', variant: 'dao_verdict', color: 'text-indigo-400' },
    RESOLVED: { label: 'Resolved', variant: 'success', color: 'text-green-400' },
    ESCALATED_TO_ADMIN: { label: 'Escalated to Admin', variant: 'escalated', color: 'text-red-400' },
};

function TimelineItem({ icon: Icon, title, description, time, color = 'text-cyan-400' }) {
    return (
        <div className="flex gap-4">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 pb-6 border-l border-gray-700 pl-4 -ml-5 ml-5">
                <h4 className="font-medium text-white">{title}</h4>
                <p className="text-sm text-gray-400 mt-1">{description}</p>
                <span className="text-xs text-gray-500 mt-2 block">{time}</span>
            </div>
        </div>
    );
}

function EvidenceGallery({ evidence, title }) {
    const [selectedImage, setSelectedImage] = useState(null);

    if (!evidence || evidence.length === 0) return null;

    return (
        <div className="space-y-3">
            <h4 className="font-medium text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                {title}
            </h4>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {evidence.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setSelectedImage(item.file_url)}
                        className="aspect-square rounded-lg overflow-hidden border border-gray-700 hover:border-cyan-500 transition-colors"
                    >
                        <img
                            src={item.file_url}
                            alt={item.file_name || 'Evidence'}
                            className="w-full h-full object-cover"
                        />
                    </button>
                ))}
            </div>

            <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                <DialogContent className="max-w-3xl">
                    <img
                        src={selectedImage}
                        alt="Evidence"
                        className="w-full h-auto rounded-lg"
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}

function LandlordResponseForm({ issue, onSuccess }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const { submitResponse, loading: responseLoading } = useLandlordResponse();
    const { uploadMultipleEvidence } = useEvidence();

    const [responseText, setResponseText] = useState('');
    const [images, setImages] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setImages((prev) => [...prev, ...files.filter(f => f.type.startsWith('image/'))]);
    };

    const handleSubmit = async () => {
        if (!responseText.trim()) {
            toast.error('Error', 'Please enter a response');
            return;
        }

        setSubmitting(true);
        try {
            // Submit response text
            const { error: responseError } = await submitResponse(issue.id, user.id, responseText);
            if (responseError) throw responseError;

            // Upload counter evidence if any
            if (images.length > 0) {
                await uploadMultipleEvidence(images, issue.id, user.id, 'landlord_evidence');
            }

            // Call analyze-case again with landlord data
            try {
                const tenantEvidence = issue.evidence?.filter(e => e.evidence_type === 'tenant_evidence') || [];
                await analyzeCase({
                    issueId: issue.id,
                    tenantComplaint: issue.description,
                    landlordResponse: responseText,
                    incidentDate: issue.incident_date,
                    tenantEvidence: tenantEvidence.map(e => ({ file_url: e.file_url })),
                    landlordEvidence: images.map(f => ({ file_name: f.name })),
                    propertyHistory: { previous_complaints: 0, resolution_rate: 0 },
                });
            } catch (analysisError) {
                console.error('Analysis failed:', analysisError);
            }

            // Update issue status to DAO_REVIEW
            await supabase
                .from('issues')
                .update({ status: 'DAO_REVIEW', updated_at: new Date().toISOString() })
                .eq('id', issue.id);

            toast.success('Response Submitted', 'Your response has been recorded');
            onSuccess?.();
        } catch (error) {
            toast.error('Error', error.message || 'Failed to submit response');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card className="bg-gray-800/50 border-amber-500/30">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-amber-400" />
                    Your Response Required
                </CardTitle>
                <CardDescription>
                    Review the tenant's complaint and provide your response
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea
                    placeholder="Provide your response to this issue..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="min-h-[120px]"
                />

                <div>
                    <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer hover:text-white transition-colors">
                        <Upload className="w-4 h-4" />
                        Upload counter evidence (optional)
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                        />
                    </label>
                    {images.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                            {images.map((file, i) => (
                                <div key={i} className="relative">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`Evidence ${i + 1}`}
                                        className="w-16 h-16 object-cover rounded border border-gray-700"
                                    />
                                    <button
                                        onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Button onClick={handleSubmit} loading={submitting} className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Submit Response
                </Button>
            </CardContent>
        </Card>
    );
}

function TenantFollowupForm({ issue, onSuccess }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const { submitFollowup, loading } = useResolutionFollowup();
    const [notes, setNotes] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedAction, setSelectedAction] = useState(null);

    const handleConfirm = async () => {
        try {
            const { error } = await submitFollowup(issue.id, user.id, selectedAction === 'complied', notes);
            if (error) throw error;

            toast.success(
                selectedAction === 'complied' ? 'Issue Resolved!' : 'Escalated to Admin',
                selectedAction === 'complied'
                    ? 'Thank you for confirming resolution'
                    : 'An admin will review your case'
            );
            setShowConfirm(false);
            onSuccess?.();
        } catch (error) {
            toast.error('Error', error.message);
        }
    };

    return (
        <Card className="bg-gray-800/50 border-green-500/30">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Resolution Follow-up
                </CardTitle>
                <CardDescription>
                    The DAO has reached a verdict. Did your landlord comply with the resolution?
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea
                    placeholder="Add any notes about the resolution (optional)..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[80px]"
                />

                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="success"
                        onClick={() => { setSelectedAction('complied'); setShowConfirm(true); }}
                    >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Yes, Resolved
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => { setSelectedAction('not_complied'); setShowConfirm(true); }}
                    >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        No, Escalate
                    </Button>
                </div>

                <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {selectedAction === 'complied' ? 'Confirm Resolution' : 'Confirm Escalation'}
                            </DialogTitle>
                            <DialogDescription>
                                {selectedAction === 'complied'
                                    ? 'This will mark the issue as resolved.'
                                    : 'This will escalate the case to an admin for further review.'}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowConfirm(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant={selectedAction === 'complied' ? 'success' : 'destructive'}
                                onClick={handleConfirm}
                                loading={loading}
                            >
                                Confirm
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}

export default function IssueDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, role } = useAuth();
    const { issue, loading, error, refetch } = useIssueDetail(id);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error || !issue) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
                <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
                <h2 className="text-xl font-semibold">Issue not found</h2>
                <p className="text-gray-400 mt-2">{error || 'The issue you are looking for does not exist.'}</p>
                <Button onClick={() => navigate('/dashboard')} className="mt-4">
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    const statusConfig = STATUS_CONFIG[issue.status] || STATUS_CONFIG.REPORTED;
    const isLandlord = user?.id === issue.landlord_id;
    const isTenant = user?.id === issue.tenant_id;
    const canRespond = isLandlord && issue.status === 'AWAITING_LANDLORD_RESPONSE';
    const canFollowup = isTenant && issue.status === 'DAO_VERDICT';

    const tenantEvidence = issue.evidence?.filter(e => e.evidence_type === 'tenant_evidence') || [];
    const landlordEvidence = issue.evidence?.filter(e => e.evidence_type === 'landlord_evidence') || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">
                                {issue.title || 'Issue Details'}
                            </h1>
                            <div className="flex items-center gap-3 mt-2">
                                <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                                {issue.category && <Badge variant="outline">{issue.category}</Badge>}
                            </div>
                        </div>
                        <div className="text-sm text-gray-400">
                            <p>Created: {new Date(issue.created_at).toLocaleDateString()}</p>
                            <p>ID: {issue.id.slice(0, 8)}...</p>
                        </div>
                    </div>
                </div>

                {/* Action Cards */}
                {canRespond && <LandlordResponseForm issue={issue} onSuccess={refetch} />}
                {canFollowup && <TenantFollowupForm issue={issue} onSuccess={refetch} />}

                {/* Main Content */}
                <Tabs defaultValue="details" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="evidence">Evidence ({issue.evidence?.length || 0})</TabsTrigger>
                        <TabsTrigger value="timeline">Timeline</TabsTrigger>
                        {issue.ai_verdicts?.length > 0 && (
                            <TabsTrigger value="ai">AI Analysis</TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="details">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Issue Description */}
                            <Card className="bg-gray-800/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        Description
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-300 whitespace-pre-wrap">{issue.description}</p>
                                </CardContent>
                            </Card>

                            {/* Property & Parties */}
                            <div className="space-y-4">
                                <Card className="bg-gray-800/50">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Building className="w-4 h-4" />
                                            Property
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-white">{issue.property?.address}</p>
                                        <p className="text-sm text-gray-400">
                                            {issue.property?.area}, {issue.property?.city}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gray-800/50">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            Parties
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div>
                                            <span className="text-gray-400 text-sm">Tenant:</span>
                                            <p className="text-white">{issue.tenant?.full_name || issue.tenant?.email}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 text-sm">Landlord:</span>
                                            <p className="text-white">{issue.landlord?.full_name || issue.landlord?.email}</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Landlord Responses */}
                                {issue.landlord_responses?.length > 0 && (
                                    <Card className="bg-gray-800/50">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <MessageSquare className="w-4 h-4" />
                                                Landlord Response
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {issue.landlord_responses.map((response) => (
                                                <div key={response.id} className="text-gray-300">
                                                    <p className="whitespace-pre-wrap">{response.response_text}</p>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        {new Date(response.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="evidence">
                        <Card className="bg-gray-800/50">
                            <CardContent className="p-6 space-y-6">
                                <EvidenceGallery evidence={tenantEvidence} title="Tenant Evidence" />
                                <EvidenceGallery evidence={landlordEvidence} title="Landlord Evidence" />
                                {(!tenantEvidence.length && !landlordEvidence.length) && (
                                    <p className="text-gray-400 text-center py-8">No evidence uploaded yet</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="timeline">
                        <Card className="bg-gray-800/50">
                            <CardContent className="p-6">
                                <TimelineItem
                                    icon={FileText}
                                    title="Issue Reported"
                                    description={`${issue.tenant?.full_name || 'Tenant'} reported the issue`}
                                    time={new Date(issue.created_at).toLocaleString()}
                                    color="text-blue-400"
                                />

                                {issue.landlord_responses?.length > 0 && (
                                    <TimelineItem
                                        icon={MessageSquare}
                                        title="Landlord Responded"
                                        description="Landlord submitted their response"
                                        time={new Date(issue.landlord_responses[0].created_at).toLocaleString()}
                                        color="text-yellow-400"
                                    />
                                )}

                                {issue.status === 'DAO_REVIEW' && (
                                    <TimelineItem
                                        icon={Vote}
                                        title="Under DAO Review"
                                        description={`${issue.dao_votes?.length || 0} votes cast`}
                                        time="In progress"
                                        color="text-purple-400"
                                    />
                                )}

                                {issue.status === 'DAO_VERDICT' && (
                                    <TimelineItem
                                        icon={Shield}
                                        title="DAO Verdict Reached"
                                        description="Awaiting tenant confirmation"
                                        time="Pending"
                                        color="text-indigo-400"
                                    />
                                )}

                                {issue.status === 'RESOLVED' && (
                                    <TimelineItem
                                        icon={CheckCircle}
                                        title="Issue Resolved"
                                        description="The issue has been marked as resolved"
                                        time={issue.updated_at ? new Date(issue.updated_at).toLocaleString() : ''}
                                        color="text-green-400"
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {issue.ai_verdicts?.length > 0 && (
                        <TabsContent value="ai">
                            <Card className="bg-gray-800/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bot className="w-5 h-5 text-cyan-400" />
                                        AI Analysis
                                    </CardTitle>
                                    <CardDescription>
                                        Automated analysis of the case for DAO reference
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {issue.ai_verdicts.map((verdict, idx) => (
                                        <div key={idx} className="space-y-4">
                                            {verdict.classification && (
                                                <div>
                                                    <h4 className="font-medium text-white mb-2">Classification</h4>
                                                    <div className="flex gap-2 flex-wrap">
                                                        <Badge variant="default">
                                                            {verdict.classification.primary_category}
                                                        </Badge>
                                                        <Badge variant={verdict.classification.urgency_flag ? 'warning' : 'secondary'}>
                                                            {verdict.classification.severity} severity
                                                        </Badge>
                                                    </div>
                                                </div>
                                            )}

                                            {verdict.case_analysis?.recommendation && (
                                                <div>
                                                    <h4 className="font-medium text-white mb-2">Recommendation</h4>
                                                    <p className="text-gray-300">{verdict.case_analysis.recommendation}</p>
                                                </div>
                                            )}

                                            {verdict.confidence_score && (
                                                <div>
                                                    <span className="text-sm text-gray-400">
                                                        Confidence: {Math.round(verdict.confidence_score * 100)}%
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </div>
    );
}
