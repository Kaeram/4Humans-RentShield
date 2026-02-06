import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Upload,
    X,
    MapPin,
    Mail,
    FileText,
    AlertCircle,
    CheckCircle,
    Loader2,
    ArrowLeft,
    Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useIssues } from '../hooks/useIssues';
import { useEvidence } from '../hooks/useEvidence';
import { useProperties } from '../hooks/useProperties';
import { classifyIssue, validateEvidence, analyzeCase } from '../services/aiService';
import { supabase } from '../lib/supabaseClient';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';

const STEPS = [
    { id: 1, title: 'Property Details' },
    { id: 2, title: 'Issue Details' },
    { id: 3, title: 'Evidence Upload' },
    { id: 4, title: 'Processing' },
];

export default function ReportIssuePage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();
    const { createIssue, updateIssueStatus } = useIssues();
    const { uploadMultipleEvidence } = useEvidence();
    const { findLandlordByEmail, upsertProperty, getPropertyWithHistory } = useProperties();

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [processingStatus, setProcessingStatus] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        propertyAddress: '',
        area: '',
        city: '',
        landlordEmail: '',
        title: '',
        description: '',
        category: '',
        incidentDate: '',
    });
    const [images, setImages] = useState([]);
    const [errors, setErrors] = useState({});

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter((file) => {
            if (!file.type.startsWith('image/')) {
                toast.error('Invalid file', `${file.name} is not an image`);
                return false;
            }
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File too large', `${file.name} exceeds 10MB limit`);
                return false;
            }
            return true;
        });

        setImages((prev) => [...prev, ...validFiles]);
    };

    const removeImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const validateStep = (step) => {
        const newErrors = {};

        if (step === 1) {
            if (!formData.propertyAddress) newErrors.propertyAddress = 'Address is required';
            if (!formData.area) newErrors.area = 'Area is required';
            if (!formData.city) newErrors.city = 'City is required';
            if (!formData.landlordEmail) newErrors.landlordEmail = 'Landlord email is required';
            else if (!/\S+@\S+\.\S+/.test(formData.landlordEmail)) {
                newErrors.landlordEmail = 'Invalid email format';
            }
        }

        if (step === 2) {
            if (!formData.title) newErrors.title = 'Title is required';
            if (!formData.description) newErrors.description = 'Description is required';
            if (formData.description && formData.description.length < 50) {
                newErrors.description = 'Description must be at least 50 characters';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setCurrentStep((prev) => prev - 1);
    };

    const handleSubmit = async () => {
        if (images.length === 0) {
            toast.error('Evidence Required', 'Please upload at least one image as evidence');
            return;
        }

        setLoading(true);
        setCurrentStep(4);

        try {
            // STEP 1: Find landlord
            setProcessingStatus('Finding landlord...');
            setProgress(10);
            const { data: landlord, error: landlordError } = await findLandlordByEmail(formData.landlordEmail);
            if (landlordError || !landlord) {
                throw new Error(landlordError?.message || 'Landlord not found with this email');
            }

            // STEP 2: Upsert property
            setProcessingStatus('Creating property record...');
            setProgress(20);
            const { data: property, error: propertyError } = await upsertProperty({
                address: formData.propertyAddress,
                area: formData.area,
                city: formData.city,
            });
            if (propertyError) throw propertyError;

            // STEP 3: Create issue
            setProcessingStatus('Creating issue...');
            setProgress(30);
            const { data: issue, error: issueError } = await createIssue({
                tenant_id: user.id,
                landlord_id: landlord.id,
                property_id: property.id,
                title: formData.title,
                description: formData.description,
                category: formData.category || null,
                incident_date: formData.incidentDate || null,
                status: 'REPORTED',
            });
            if (issueError) throw issueError;

            // STEP 4: Upload evidence
            setProcessingStatus('Uploading evidence...');
            setProgress(40);
            const { data: evidenceRecords, errors: uploadErrors } = await uploadMultipleEvidence(
                images,
                issue.id,
                user.id,
                'tenant_evidence'
            );

            if (uploadErrors.length > 0) {
                console.warn('Some evidence failed to upload:', uploadErrors);
            }

            // STEP 5: Classify issue
            setProcessingStatus('AI: Classifying issue...');
            setProgress(50);
            let classification = null;
            try {
                classification = await classifyIssue(formData.description, images.length);

                // Update issue with classification
                if (classification?.primary_category) {
                    await supabase
                        .from('issues')
                        .update({ category: classification.primary_category })
                        .eq('id', issue.id);
                }
            } catch (classifyError) {
                console.error('Classification failed:', classifyError);
                // Continue without classification
            }

            // STEP 6: Validate each image
            setProcessingStatus('AI: Validating evidence...');
            setProgress(60);
            const evidenceResults = [];
            for (let i = 0; i < images.length; i++) {
                try {
                    const result = await validateEvidence(
                        images[i],
                        formData.description,
                        formData.incidentDate || null
                    );
                    evidenceResults.push({
                        file_name: images[i].name,
                        validation: result,
                    });
                } catch (validateError) {
                    console.error(`Validation failed for ${images[i].name}:`, validateError);
                    evidenceResults.push({
                        file_name: images[i].name,
                        validation: { error: validateError.message },
                    });
                }
                setProgress(60 + ((i + 1) / images.length) * 15);
            }

            // STEP 7: Full case analysis
            setProcessingStatus('AI: Analyzing case...');
            setProgress(80);
            let caseAnalysis = null;
            try {
                // Get property history
                const { data: propertyWithHistory } = await getPropertyWithHistory(property.id);

                caseAnalysis = await analyzeCase({
                    issueId: issue.id,
                    tenantComplaint: formData.description,
                    landlordResponse: null,
                    incidentDate: formData.incidentDate || null,
                    tenantEvidence: evidenceResults,
                    landlordEvidence: [],
                    propertyHistory: propertyWithHistory?.history || {
                        previous_complaints: 0,
                        resolution_rate: 0,
                    },
                });
            } catch (analysisError) {
                console.error('Case analysis failed:', analysisError);
                // Continue without analysis
            }

            // STEP 8: Store AI verdict
            setProcessingStatus('Storing AI verdict...');
            setProgress(90);
            if (caseAnalysis) {
                try {
                    await supabase.from('ai_verdicts').insert({
                        issue_id: issue.id,
                        classification: classification,
                        evidence_validation: evidenceResults,
                        case_analysis: caseAnalysis,
                        recommendation: caseAnalysis.recommendation || null,
                        confidence_score: caseAnalysis.confidence || null,
                    });
                } catch (verdictError) {
                    console.error('Failed to store verdict:', verdictError);
                }
            }

            // STEP 9: Update issue status
            setProcessingStatus('Finalizing...');
            setProgress(100);
            await updateIssueStatus(issue.id, 'AWAITING_LANDLORD_RESPONSE');

            toast.success('Issue Reported!', 'Your issue has been submitted and is awaiting landlord response');
            navigate(`/issue/${issue.id}`);
        } catch (error) {
            console.error('Report issue error:', error);
            toast.error('Error', error.message || 'Failed to report issue');
            setCurrentStep(3); // Go back to evidence step
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <h1 className="text-3xl font-bold text-white">Report an Issue</h1>
                    <p className="text-gray-400 mt-1">
                        Document your housing issue for fair resolution
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-8">
                    {STEPS.map((step, index) => (
                        <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${currentStep >= step.id
                                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                                            : 'bg-gray-700 text-gray-400'
                                        }`}
                                >
                                    {currentStep > step.id ? (
                                        <CheckCircle className="w-5 h-5" />
                                    ) : (
                                        step.id
                                    )}
                                </div>
                                <span className="text-xs text-gray-400 mt-2 hidden md:block">
                                    {step.title}
                                </span>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div
                                    className={`flex-1 h-0.5 mx-2 ${currentStep > step.id ? 'bg-cyan-500' : 'bg-gray-700'
                                        }`}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Form Steps */}
                <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-6">
                        {/* Step 1: Property Details */}
                        {currentStep === 1 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="propertyAddress">Property Address *</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                        <Input
                                            id="propertyAddress"
                                            placeholder="123 Main Street, Apt 4B"
                                            value={formData.propertyAddress}
                                            onChange={(e) => handleChange('propertyAddress', e.target.value)}
                                            error={errors.propertyAddress}
                                            className="pl-10"
                                        />
                                    </div>
                                    {errors.propertyAddress && (
                                        <p className="text-sm text-red-400">{errors.propertyAddress}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="area">Area *</Label>
                                        <Input
                                            id="area"
                                            placeholder="Downtown"
                                            value={formData.area}
                                            onChange={(e) => handleChange('area', e.target.value)}
                                            error={errors.area}
                                        />
                                        {errors.area && (
                                            <p className="text-sm text-red-400">{errors.area}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City *</Label>
                                        <Input
                                            id="city"
                                            placeholder="New York"
                                            value={formData.city}
                                            onChange={(e) => handleChange('city', e.target.value)}
                                            error={errors.city}
                                        />
                                        {errors.city && (
                                            <p className="text-sm text-red-400">{errors.city}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="landlordEmail">Landlord Email *</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                        <Input
                                            id="landlordEmail"
                                            type="email"
                                            placeholder="landlord@example.com"
                                            value={formData.landlordEmail}
                                            onChange={(e) => handleChange('landlordEmail', e.target.value)}
                                            error={errors.landlordEmail}
                                            className="pl-10"
                                        />
                                    </div>
                                    {errors.landlordEmail && (
                                        <p className="text-sm text-red-400">{errors.landlordEmail}</p>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Issue Details */}
                        {currentStep === 2 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="title">Issue Title *</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g., Water leak in bathroom ceiling"
                                        value={formData.title}
                                        onChange={(e) => handleChange('title', e.target.value)}
                                        error={errors.title}
                                    />
                                    {errors.title && (
                                        <p className="text-sm text-red-400">{errors.title}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Detailed Description *</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe the issue in detail. Include when it started, how it affects you, and any previous communication with your landlord..."
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        error={errors.description}
                                        className="min-h-[150px]"
                                    />
                                    <p className="text-xs text-gray-500">
                                        {formData.description.length}/50 characters minimum
                                    </p>
                                    {errors.description && (
                                        <p className="text-sm text-red-400">{errors.description}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="incidentDate">When did this issue start? (Optional)</Label>
                                    <Input
                                        id="incidentDate"
                                        type="date"
                                        value={formData.incidentDate}
                                        onChange={(e) => handleChange('incidentDate', e.target.value)}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Evidence Upload */}
                        {currentStep === 3 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-4"
                            >
                                <div>
                                    <Label>Upload Evidence Photos *</Label>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Upload clear photos showing the issue. Images will be verified by AI.
                                    </p>
                                </div>

                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-cyan-500 transition-colors bg-gray-800/30">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-400">
                                            <span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                                    </div>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                </label>

                                {images.length > 0 && (
                                    <div className="grid grid-cols-3 gap-3">
                                        {images.map((file, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={`Evidence ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg border border-gray-700"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4 text-white" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {images.length === 0 && (
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                                        <p className="text-sm text-amber-300">
                                            At least one photo is required as evidence
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Step 4: Processing */}
                        {currentStep === 4 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6 py-8"
                            >
                                <div className="text-center">
                                    <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        Processing Your Report
                                    </h3>
                                    <p className="text-gray-400">{processingStatus}</p>
                                </div>

                                <Progress value={progress} className="w-full" />

                                <div className="text-center text-sm text-gray-500">
                                    Please wait while we verify your evidence and analyze your case...
                                </div>
                            </motion.div>
                        )}

                        {/* Navigation Buttons */}
                        {currentStep < 4 && (
                            <div className="flex justify-between mt-8 pt-4 border-t border-gray-700">
                                {currentStep > 1 ? (
                                    <Button variant="outline" onClick={handleBack}>
                                        Back
                                    </Button>
                                ) : (
                                    <div />
                                )}

                                {currentStep < 3 ? (
                                    <Button onClick={handleNext}>
                                        Continue
                                    </Button>
                                ) : (
                                    <Button onClick={handleSubmit} disabled={images.length === 0}>
                                        Submit Report
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
