import { useState } from 'react'
import { Link } from 'react-router-dom'
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
    AlertTriangle,
    Shield
} from 'lucide-react'
import { Navbar, Footer } from '@/components'
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
        <div className="min-h-screen bg-neutral-950 selection:bg-lime-500/30">
            <Navbar theme="dark" />

            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-lime-500/10 rounded-full blur-[120px] mix-blend-screen" />
            </div>

            <main className="pt-24 pb-16 relative z-10">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            to="/tenant/dashboard"
                            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-6 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-display font-bold text-white mb-2">
                            Report an Issue
                        </h1>
                        <p className="text-neutral-400">
                            Submit a new complaint. Your report will be anonymized and securely stored on the blockchain.
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="mb-8 overflow-x-auto pb-4 sm:pb-0">
                        <div className="flex items-center justify-between min-w-[300px]">
                            {steps.map((step, idx) => (
                                <div key={step.id} className="flex items-center flex-1">
                                    <div className="relative flex flex-col items-center group">
                                        <div
                                            className={`flex items-center justify-center h-10 w-10 rounded-xl border-2 transition-all duration-300 ${currentStep >= step.id
                                                ? 'bg-lime-400 border-lime-400 text-neutral-900 shadow-[0_0_15px_rgba(132,204,22,0.3)]'
                                                : 'bg-neutral-900/50 border-neutral-700 text-neutral-500'
                                                }`}
                                        >
                                            {currentStep > step.id ? (
                                                <CheckCircle className="h-5 w-5" />
                                            ) : (
                                                <step.icon className="h-5 w-5" />
                                            )}
                                        </div>
                                        <span className={`absolute -bottom-6 text-xs font-medium whitespace-nowrap transition-colors ${currentStep >= step.id ? 'text-lime-400' : 'text-neutral-500'
                                            }`}>
                                            {step.title}
                                        </span>
                                    </div>
                                    {idx < steps.length - 1 && (
                                        <div className="flex-1 h-0.5 mx-2 bg-neutral-800 relative">
                                            <div
                                                className="absolute inset-y-0 left-0 bg-lime-400 transition-all duration-300"
                                                style={{ width: currentStep > step.id ? '100%' : '0%' }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-2xl p-6 sm:p-8 mt-8">
                        <AnimatePresence mode="wait">
                            {/* Step 1: Property Address */}
                            {currentStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <h2 className="text-xl font-semibold text-white mb-1">Property Details</h2>
                                        <p className="text-sm text-neutral-400 mb-6">Where is the issue located?</p>

                                        <label htmlFor="address" className="block text-sm font-medium text-neutral-300 mb-2">
                                            Property Address
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                                            <input
                                                id="address"
                                                type="text"
                                                value={formData.propertyAddress}
                                                onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-3 pl-10 pr-4 text-white placeholder-neutral-600 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-colors"
                                                placeholder="123 Main St, Apt 4B, San Francisco, CA 94102"
                                            />
                                        </div>
                                        <p className="mt-2 text-xs text-neutral-500">
                                            Enter the full address including apartment/unit number
                                        </p>
                                    </div>

                                    <div className="bg-violet-900/10 border border-violet-500/20 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <Shield className="h-5 w-5 text-violet-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-violet-300">Privacy Notice</p>
                                                <p className="text-xs text-violet-400/80 mt-1">
                                                    Your exact location is encrypted. Only verified parties involved in the dispute resolution will have access to this information.
                                                </p>
                                            </div>
                                        </div>
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
                                    <h2 className="text-xl font-semibold text-white mb-1">Issue Category</h2>
                                    <p className="text-sm text-neutral-400 mb-6">Select the category that best describes your issue</p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setFormData({ ...formData, category: cat.id })}
                                                className={`group p-4 rounded-xl border text-left transition-all duration-200 hover:scale-[1.02] ${formData.category === cat.id
                                                    ? 'bg-lime-400/10 border-lime-400'
                                                    : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                                                    }`}
                                            >
                                                <span className="text-2xl group-hover:scale-110 inline-block transition-transform duration-200">{cat.icon}</span>
                                                <p className={`font-medium mt-3 transition-colors ${formData.category === cat.id ? 'text-lime-400' : 'text-white'
                                                    }`}>
                                                    {cat.label}
                                                </p>
                                                <p className="text-xs text-neutral-500 mt-1">{cat.description}</p>
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
                                    className="space-y-6"
                                >
                                    <div>
                                        <h2 className="text-xl font-semibold text-white mb-1">Description</h2>
                                        <p className="text-sm text-neutral-400 mb-6">Provide detailed information about the issue</p>

                                        <label htmlFor="description" className="block text-sm font-medium text-neutral-300 mb-2">
                                            Issue Details
                                        </label>
                                        <textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-4 text-white placeholder-neutral-600 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-colors min-h-[200px] resize-y"
                                            placeholder="Example: The heating system has been broken for 3 days. I notified the landlord on Monday but haven't received a response. The temperature in the apartment is dropping below safe levels..."
                                        />
                                        <div className="flex justify-between mt-2">
                                            <p className="text-xs text-neutral-500">Minimum 20 characters</p>
                                            <p className={`text-xs ${formData.description.length >= 20 ? 'text-lime-400' : 'text-neutral-500'}`}>
                                                {formData.description.length} chars
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-900/10 border border-orange-500/20">
                                        <AlertTriangle className="h-5 w-5 text-orange-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-orange-300">Important</p>
                                            <p className="text-xs text-orange-400/80 mt-1">
                                                Stick to factual events. Avoid emotional language or personal attacks, as this will be reviewed by the DAO community.
                                            </p>
                                        </div>
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
                                    className="space-y-6"
                                >
                                    <div>
                                        <h2 className="text-xl font-semibold text-white mb-1">Evidence</h2>
                                        <p className="text-sm text-neutral-400 mb-6">Upload photos or documents to support your claim (Optional)</p>

                                        <div className="border-2 border-dashed border-neutral-800 rounded-xl p-8 text-center hover:border-lime-400/50 hover:bg-neutral-900 transition-all cursor-pointer group">
                                            <input
                                                type="file"
                                                id="images"
                                                multiple
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                            <label htmlFor="images" className="cursor-pointer w-full h-full block">
                                                <div className="h-14 w-14 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                                    <Upload className="h-7 w-7 text-neutral-400 group-hover:text-lime-400 transition-colors" />
                                                </div>
                                                <p className="text-base font-medium text-white mb-1">
                                                    <span className="text-lime-400">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-neutral-500">PNG, JPG, HEIC up to 10MB each</p>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Image Previews */}
                                    {imagePreview.length > 0 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {imagePreview.map((preview, idx) => (
                                                <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-neutral-800">
                                                    <img
                                                        src={preview}
                                                        alt={`Preview ${idx + 1}`}
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button
                                                            onClick={() => removeImage(idx)}
                                                            className="p-2 rounded-full bg-red-500/80 text-white hover:bg-red-500 transition-colors"
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                                        <Shield className="h-4 w-4" />
                                        <p>
                                            Photos are analyzed by AI for authenticity. EXIF metadata is verified but kept private.
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 5: Confirmation */}
                            {currentStep === 5 && (
                                <motion.div
                                    key="step5"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-12"
                                >
                                    <div className="h-20 w-20 rounded-full bg-lime-400/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(132,204,22,0.2)]">
                                        <CheckCircle className="h-10 w-10 text-lime-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3">
                                        Issue Submitted Successfully!
                                    </h3>
                                    <p className="text-neutral-400 mb-8 max-w-md mx-auto">
                                        Your issue has been recorded on the blockchain and is being processed. Our AI Agent is analyzing your evidence now.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <Link to="/tenant/dashboard" className="px-6 py-3 rounded-lg bg-lime-400 text-neutral-900 font-semibold hover:bg-lime-300 transition-colors">
                                            View Dashboard
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setCurrentStep(1)
                                                setFormData({ propertyAddress: '', category: '', description: '', images: [] })
                                                setImagePreview([])
                                            }}
                                            className="px-6 py-3 rounded-lg bg-neutral-800 text-white font-medium hover:bg-neutral-700 transition-colors border border-neutral-700"
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
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </button>

                                {currentStep < 4 ? (
                                    <button
                                        onClick={handleNext}
                                        disabled={!canProceed()}
                                        className="px-6 py-2.5 rounded-lg bg-lime-400 text-neutral-900 text-sm font-semibold hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(132,204,22,0.3)] disabled:shadow-none"
                                    >
                                        Continue
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="px-6 py-2.5 rounded-lg bg-lime-400 text-neutral-900 text-sm font-semibold hover:bg-lime-300 disabled:opacity-70 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(132,204,22,0.3)]"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                Submit Report
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

            <Footer />
        </div>
    )
}
