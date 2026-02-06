import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft,
    ArrowRight,
    MapPin,
    Tag,
    FileText,
    Upload,
    CheckCircle,
    X,
    Loader2,
    AlertTriangle
} from 'lucide-react'
import { Navbar } from '@/components'
import { api } from '@/services/api'
import { IssueCategory, ReportIssueForm } from '@/types'

const categories: { id: IssueCategory; label: string; icon: string; description: string }[] = [
    { id: 'maintenance', label: 'Maintenance', icon: '🔧', description: 'Repairs, broken appliances, structural issues' },
    { id: 'safety', label: 'Safety Hazard', icon: '⚠️', description: 'Fire hazards, unsafe conditions, security' },
    { id: 'pest', label: 'Pest Infestation', icon: '🐛', description: 'Insects, rodents, other pests' },
    { id: 'noise', label: 'Noise Issue', icon: '🔊', description: 'Excessive noise, disturbances' },
    { id: 'lease-violation', label: 'Lease Violation', icon: '📋', description: 'Contract breaches, illegal terms' },
    { id: 'utilities', label: 'Utilities', icon: '💡', description: 'Water, electricity, gas, heating/cooling' },
    { id: 'security-deposit', label: 'Security Deposit', icon: '💰', description: 'Unfair deductions, refund issues' },
    { id: 'other', label: 'Other', icon: '📝', description: 'Other housing issues' },
]

const steps = [
    { id: 1, title: 'Property Address', icon: MapPin },
    { id: 2, title: 'Issue Category', icon: Tag },
    { id: 3, title: 'Description', icon: FileText },
    { id: 4, title: 'Evidence Upload', icon: Upload },
    { id: 5, title: 'Confirmation', icon: CheckCircle },
]

export function ReportIssue() {
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState<ReportIssueForm>({
        propertyAddress: '',
        category: '',
        description: '',
        images: [],
    })
    const [imagePreview, setImagePreview] = useState<string[]>([])

    const handleNext = () => {
        if (currentStep < 5) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files) {
            const newFiles = Array.from(files)
            setFormData({ ...formData, images: [...formData.images, ...newFiles] })

            // Create previews
            newFiles.forEach((file) => {
                const reader = new FileReader()
                reader.onload = (e) => {
                    if (e.target?.result) {
                        setImagePreview((prev) => [...prev, e.target!.result as string])
                    }
                }
                reader.readAsDataURL(file)
            })
        }
    }

    const removeImage = (index: number) => {
        setFormData({
            ...formData,
            images: formData.images.filter((_, i) => i !== index),
        })
        setImagePreview(imagePreview.filter((_, i) => i !== index))
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            await api.issues.create(formData)
            setCurrentStep(5)
        } catch (error) {
            console.error('Failed to submit issue:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return formData.propertyAddress.length > 10
            case 2:
                return formData.category !== ''
            case 3:
                return formData.description.length > 20
            case 4:
                return true // Images are optional
            default:
                return false
        }
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    {/* Back Link */}
                    <Link
                        to="/tenant/dashboard"
                        className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>

                    {/* Progress Steps */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            {steps.map((step, idx) => (
                                <div key={step.id} className="flex items-center">
                                    <div
                                        className={`flex items-center justify-center h-10 w-10 rounded-full border-2 transition-colors ${currentStep >= step.id
                                                ? 'bg-primary-600 border-primary-600 text-white'
                                                : 'border-neutral-300 text-neutral-400'
                                            }`}
                                    >
                                        {currentStep > step.id ? (
                                            <CheckCircle className="h-5 w-5" />
                                        ) : (
                                            <step.icon className="h-5 w-5" />
                                        )}
                                    </div>
                                    {idx < steps.length - 1 && (
                                        <div
                                            className={`hidden sm:block w-12 lg:w-24 h-0.5 mx-2 ${currentStep > step.id ? 'bg-primary-600' : 'bg-neutral-200'
                                                }`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <h2 className="text-lg font-semibold text-neutral-900">
                                {steps[currentStep - 1].title}
                            </h2>
                            <p className="text-sm text-neutral-500">Step {currentStep} of 5</p>
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="card p-6">
                        <AnimatePresence mode="wait">
                            {/* Step 1: Property Address */}
                            {currentStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label htmlFor="address" className="label">
                                            Property Address
                                        </label>
                                        <input
                                            id="address"
                                            type="text"
                                            value={formData.propertyAddress}
                                            onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                                            className="input-field"
                                            placeholder="123 Main St, Apt 4B, San Francisco, CA 94102"
                                        />
                                        <p className="mt-1.5 text-xs text-neutral-500">
                                            Enter the full address including apartment/unit number
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Category Selection */}
                            {currentStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <p className="text-sm text-neutral-600 mb-4">
                                        Select the category that best describes your issue
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setFormData({ ...formData, category: cat.id })}
                                                className={`p-4 rounded-xl border-2 text-left transition-all ${formData.category === cat.id
                                                        ? 'border-primary-600 bg-primary-50'
                                                        : 'border-neutral-200 hover:border-neutral-300'
                                                    }`}
                                            >
                                                <span className="text-2xl">{cat.icon}</span>
                                                <p className="font-medium text-neutral-900 mt-2">{cat.label}</p>
                                                <p className="text-xs text-neutral-500 mt-0.5">{cat.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Description */}
                            {currentStep === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label htmlFor="description" className="label">
                                            Describe the Issue
                                        </label>
                                        <textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="input-field min-h-[200px]"
                                            placeholder="Please provide detailed information about the issue. Include when it started, how it affects you, and any previous attempts to resolve it with your landlord."
                                        />
                                        <p className="mt-1.5 text-xs text-neutral-500">
                                            Minimum 20 characters. Be as detailed as possible.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-2 p-3 rounded-lg bg-warning-50 border border-warning-100">
                                        <AlertTriangle className="h-4 w-4 text-warning-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-warning-700">
                                            Avoid including personal identifying information of others. Your own identity is protected.
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 4: Evidence Upload */}
                            {currentStep === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className="label">Upload Evidence (Optional)</label>
                                        <div className="border-2 border-dashed border-neutral-300 rounded-xl p-6 text-center hover:border-primary-500 transition-colors">
                                            <input
                                                type="file"
                                                id="images"
                                                multiple
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                            <label htmlFor="images" className="cursor-pointer">
                                                <Upload className="h-10 w-10 text-neutral-400 mx-auto mb-3" />
                                                <p className="text-sm text-neutral-600">
                                                    <span className="text-primary-600 font-medium">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-neutral-500 mt-1">PNG, JPG, HEIC up to 10MB each</p>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Image Previews */}
                                    {imagePreview.length > 0 && (
                                        <div className="grid grid-cols-3 gap-3">
                                            {imagePreview.map((preview, idx) => (
                                                <div key={idx} className="relative group aspect-square">
                                                    <img
                                                        src={preview}
                                                        alt={`Preview ${idx + 1}`}
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                    <button
                                                        onClick={() => removeImage(idx)}
                                                        className="absolute top-2 right-2 p-1 rounded-full bg-neutral-900/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <p className="text-xs text-neutral-500">
                                        Photos will be analyzed by our AI for authenticity and relevant details.
                                        EXIF metadata will be verified but kept private.
                                    </p>
                                </motion.div>
                            )}

                            {/* Step 5: Confirmation */}
                            {currentStep === 5 && (
                                <motion.div
                                    key="step5"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-8"
                                >
                                    <div className="h-16 w-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="h-8 w-8 text-success-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                                        Issue Submitted Successfully!
                                    </h3>
                                    <p className="text-neutral-600 mb-6">
                                        Your issue has been submitted and is being processed. Our AI will analyze your evidence shortly.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        <Link to="/tenant/dashboard" className="btn-primary">
                                            View Dashboard
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setCurrentStep(1)
                                                setFormData({ propertyAddress: '', category: '', description: '', images: [] })
                                                setImagePreview([])
                                            }}
                                            className="btn-secondary"
                                        >
                                            Report Another Issue
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        {currentStep < 5 && (
                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-100">
                                <button
                                    onClick={handleBack}
                                    disabled={currentStep === 1}
                                    className="btn-secondary disabled:opacity-50"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </button>

                                {currentStep < 4 ? (
                                    <button
                                        onClick={handleNext}
                                        disabled={!canProceed()}
                                        className="btn-primary disabled:opacity-50"
                                    >
                                        Continue
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="btn-primary"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                Submit Issue
                                                <CheckCircle className="h-4 w-4 ml-2" />
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
