import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import AnimatedShaderBackground from '@/components/ui/animated-shader-background'
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
    const [error, setError] = useState('')
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
        setError('')
        try {
            console.log('Creating issue with data:', formData)
            await api.issues.create(formData)
            console.log('Issue created successfully')
            setCurrentStep(5)
        } catch (err: any) {
            console.error('Failed to submit issue:', err)
            setError(err?.message || 'Failed to submit issue. Please try again.')
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
        <div className="min-h-screen bg-neutral-900 relative overflow-hidden">
            <AnimatedShaderBackground />
            <Navbar theme="dark" />

            <main className="pt-24 pb-16 relative z-10">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    {/* Back Link */}
                    <Link
                        to="/tenant/dashboard"
                        className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-lime-400 mb-6 transition-colors"
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
                                                ? 'bg-lime-400 border-lime-400 text-neutral-900'
                                                : 'border-neutral-600 text-neutral-500'
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
                                            className={`hidden sm:block w-12 lg:w-24 h-0.5 mx-2 ${currentStep > step.id ? 'bg-lime-400' : 'bg-neutral-700'
                                                }`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <h2 className="text-lg font-semibold text-white">
                                {steps[currentStep - 1].title}
                            </h2>
                            <p className="text-sm text-neutral-400">Step {currentStep} of 5</p>
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800/50 rounded-2xl shadow-2xl p-6">
                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

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
                                        <label htmlFor="address" className="block text-sm font-medium text-neutral-300 mb-2">
                                            Property Address
                                        </label>
                                        <input
                                            id="address"
                                            type="text"
                                            value={formData.propertyAddress}
                                            onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                                            className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all"
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
                                    <p className="text-sm text-neutral-400 mb-4">
                                        Select the category that best describes your issue
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setFormData({ ...formData, category: cat.id })}
                                                className={`p-4 rounded-xl border-2 text-left transition-all ${formData.category === cat.id
                                                        ? 'border-lime-400 bg-lime-400/10'
                                                        : 'border-neutral-700 hover:border-neutral-600 bg-neutral-800/30'
                                                    }`}
                                            >
                                                <span className="text-2xl">{cat.icon}</span>
                                                <p className="font-medium text-white mt-2">{cat.label}</p>
                                                <p className="text-xs text-neutral-400 mt-0.5">{cat.description}</p>
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
                                        <label htmlFor="description" className="block text-sm font-medium text-neutral-300 mb-2">
                                            Describe the Issue
                                        </label>
                                        <textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all min-h-[200px]"
                                            placeholder="Please provide detailed information about the issue. Include when it started, how it affects you, and any previous attempts to resolve it with your landlord."
                                        />
                                        <p className="mt-1.5 text-xs text-neutral-500">
                                            Minimum 20 characters. Be as detailed as possible.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                        <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-yellow-200">
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
                                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                                            Upload Evidence (Optional)
                                        </label>
                                        <div className="border-2 border-dashed border-neutral-700 rounded-xl p-6 text-center hover:border-lime-400 transition-colors bg-neutral-800/30">
                                            <input
                                                type="file"
                                                id="images"
                                                multiple
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                            <label htmlFor="images" className="cursor-pointer">
                                                <Upload className="h-10 w-10 text-neutral-500 mx-auto mb-3" />
                                                <p className="text-sm text-neutral-300">
                                                    <span className="text-lime-400 font-medium">Click to upload</span> or drag and drop
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
                                    <div className="h-16 w-16 rounded-full bg-lime-400/20 flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="h-8 w-8 text-lime-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        Issue Submitted Successfully!
                                    </h3>
                                    <p className="text-neutral-400 mb-6">
                                        Your issue has been submitted and is being processed. Our AI will analyze your evidence shortly.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        <Link
                                            to="/tenant/dashboard"
                                            className="px-6 py-3 bg-lime-400 text-neutral-900 rounded-lg font-medium hover:bg-lime-300 transition-colors"
                                        >
                                            View Dashboard
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setCurrentStep(1)
                                                setFormData({ propertyAddress: '', category: '', description: '', images: [] })
                                                setImagePreview([])
                                            }}
                                            className="px-6 py-3 bg-neutral-800 text-white rounded-lg font-medium hover:bg-neutral-700 transition-colors"
                                        >
                                            Report Another Issue
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        {currentStep < 5 && (
                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-800">
                                <button
                                    onClick={handleBack}
                                    disabled={currentStep === 1}
                                    className="px-6 py-3 bg-neutral-800 text-white rounded-lg font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </button>

                                {currentStep < 4 ? (
                                    <button
                                        onClick={handleNext}
                                        disabled={!canProceed()}
                                        className="px-6 py-3 bg-lime-400 text-neutral-900 rounded-lg font-medium hover:bg-lime-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        Continue
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="px-6 py-3 bg-lime-400 text-neutral-900 rounded-lg font-medium hover:bg-lime-300 transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                Submit Issue
                                                <CheckCircle className="h-4 w-4" />
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
