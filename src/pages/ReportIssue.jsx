import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Wrench, AlertTriangle, UserX, Wallet, Home, Wifi, Volume2, Bug,
    ArrowLeft, ArrowRight, Upload, CheckCircle, MapPin, X
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Textarea } from '../components/ui/textarea'
import { Slider } from '../components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog'
import { Progress } from '../components/ui/progress'
import { areas_list } from '../data/mockData'

const categories = [
    { id: 'Maintenance', label: 'Maintenance', icon: Wrench, color: 'bg-orange-500' },
    { id: 'Safety', label: 'Safety', icon: AlertTriangle, color: 'bg-red-500' },
    { id: 'Harassment', label: 'Harassment', icon: UserX, color: 'bg-purple-500' },
    { id: 'Security Deposit', label: 'Security Deposit', icon: Wallet, color: 'bg-green-500' },
    { id: 'Illegal Eviction', label: 'Illegal Eviction', icon: Home, color: 'bg-red-600' },
    { id: 'Amenities', label: 'Amenities', icon: Wifi, color: 'bg-blue-500' },
    { id: 'Noise', label: 'Noise', icon: Volume2, color: 'bg-yellow-500' },
    { id: 'Pest Control', label: 'Pest Control', icon: Bug, color: 'bg-amber-700' },
]

const severityLabels = {
    1: { label: 'Minor', description: 'Small inconvenience, can wait', color: 'text-green-500' },
    2: { label: 'Moderate', description: 'Needs attention soon', color: 'text-yellow-500' },
    3: { label: 'Significant', description: 'Affecting daily life', color: 'text-orange-500' },
    4: { label: 'Severe', description: 'Urgent action needed', color: 'text-red-500' },
    5: { label: 'Critical', description: 'Health/safety hazard', color: 'text-red-700' },
}

const steps = [
    { id: 1, title: 'Category' },
    { id: 2, title: 'Description' },
    { id: 3, title: 'Evidence' },
    { id: 4, title: 'Severity' },
    { id: 5, title: 'Location' },
]

export default function ReportIssue() {
    const [currentStep, setCurrentStep] = useState(1)
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [formData, setFormData] = useState({
        category: '',
        description: '',
        images: [],
        severity: 3,
        location: '',
    })

    const handleCategorySelect = (category) => {
        setFormData({ ...formData, category })
    }

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files || [])
        const newImages = files.map((file, index) => ({
            id: Date.now() + index,
            name: file.name,
            preview: URL.createObjectURL(file)
        }))
        setFormData({ ...formData, images: [...formData.images, ...newImages] })
    }

    const removeImage = (id) => {
        setFormData({
            ...formData,
            images: formData.images.filter(img => img.id !== id)
        })
    }

    const handleSubmit = () => {
        setShowConfirmation(true)
    }

    const canProceed = () => {
        switch (currentStep) {
            case 1: return formData.category !== ''
            case 2: return formData.description.length >= 20
            case 3: return true
            case 4: return true
            case 5: return formData.location !== ''
            default: return false
        }
    }

    const progress = (currentStep / steps.length) * 100

    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">Report an Issue</h1>
                    <p className="text-muted-foreground">
                        Your identity is completely anonymous. Report safely and securely.
                    </p>
                </motion.div>

                {/* Progress bar */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        {steps.map((step) => (
                            <div
                                key={step.id}
                                className={`text-sm font-medium ${currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'
                                    }`}
                            >
                                {step.title}
                            </div>
                        ))}
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                {/* Form Steps */}
                <Card className="p-6 md:p-8">
                    <CardContent className="p-0">
                        <AnimatePresence mode="wait">
                            {/* Step 1: Category Selection */}
                            {currentStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <h2 className="text-xl font-semibold mb-4">What type of issue are you reporting?</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => handleCategorySelect(cat.id)}
                                                className={`p-4 rounded-lg border-2 transition-all ${formData.category === cat.id
                                                        ? 'border-primary bg-primary/10'
                                                        : 'border-border hover:border-primary/50'
                                                    }`}
                                            >
                                                <div className={`w-12 h-12 rounded-lg ${cat.color} flex items-center justify-center mx-auto mb-3`}>
                                                    <cat.icon className="w-6 h-6 text-white" />
                                                </div>
                                                <span className="text-sm font-medium">{cat.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Description */}
                            {currentStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <h2 className="text-xl font-semibold mb-4">Describe the issue in detail</h2>
                                    <p className="text-muted-foreground mb-4">
                                        Provide as much detail as possible. Include dates, times, and any communication with your landlord.
                                    </p>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe the issue..."
                                        className="min-h-[200px]"
                                    />
                                    <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                                        <span>{formData.description.length} characters</span>
                                        <span className={formData.description.length >= 20 ? 'text-green-500' : ''}>
                                            Minimum 20 characters
                                        </span>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Image Upload */}
                            {currentStep === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <h2 className="text-xl font-semibold mb-4">Upload evidence (optional)</h2>
                                    <p className="text-muted-foreground mb-4">
                                        Add photos or screenshots to support your case. All images will be verified by our AI.
                                    </p>

                                    <label className="block border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                        <p className="font-medium">Click to upload or drag and drop</p>
                                        <p className="text-sm text-muted-foreground mt-1">PNG, JPG up to 10MB each</p>
                                    </label>

                                    {formData.images.length > 0 && (
                                        <div className="grid grid-cols-3 gap-4 mt-6">
                                            {formData.images.map((img) => (
                                                <div key={img.id} className="relative group">
                                                    <div className="aspect-square rounded-lg bg-muted overflow-hidden">
                                                        <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                                                            <span className="text-xs text-muted-foreground">{img.name}</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeImage(img.id)}
                                                        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Step 4: Severity */}
                            {currentStep === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <h2 className="text-xl font-semibold mb-4">How severe is this issue?</h2>
                                    <p className="text-muted-foreground mb-8">
                                        Rate the severity from 1 (minor) to 5 (critical health/safety hazard).
                                    </p>

                                    <div className="mb-8">
                                        <Slider
                                            value={[formData.severity]}
                                            onValueChange={(value) => setFormData({ ...formData, severity: value[0] })}
                                            min={1}
                                            max={5}
                                            step={1}
                                            className="w-full"
                                        />
                                        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                                            <span>Minor</span>
                                            <span>Critical</span>
                                        </div>
                                    </div>

                                    <div className="text-center p-6 rounded-lg bg-muted">
                                        <div className={`text-3xl font-bold mb-2 ${severityLabels[formData.severity].color}`}>
                                            {severityLabels[formData.severity].label}
                                        </div>
                                        <p className="text-muted-foreground">
                                            {severityLabels[formData.severity].description}
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 5: Location */}
                            {currentStep === 5 && (
                                <motion.div
                                    key="step5"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <h2 className="text-xl font-semibold mb-4">Select your area</h2>
                                    <p className="text-muted-foreground mb-4">
                                        We only collect area-level location to protect your privacy while mapping issues.
                                    </p>

                                    <div className="flex items-center gap-2 mb-6">
                                        <MapPin className="w-5 h-5 text-primary" />
                                        <span className="text-sm">Your exact address will never be stored or shared</span>
                                    </div>

                                    <Select
                                        value={formData.location}
                                        onValueChange={(value) => setFormData({ ...formData, location: value })}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select your area" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {areas_list.map((area) => (
                                                <SelectItem key={area.name} value={area.name}>
                                                    {area.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8 pt-6 border-t">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentStep(prev => prev - 1)}
                                disabled={currentStep === 1}
                                className="gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back
                            </Button>

                            {currentStep < 5 ? (
                                <Button
                                    onClick={() => setCurrentStep(prev => prev + 1)}
                                    disabled={!canProceed()}
                                    className="gap-2"
                                >
                                    Next <ArrowRight className="w-4 h-4" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!canProceed()}
                                    className="gap-2"
                                >
                                    Submit Report <CheckCircle className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Confirmation Modal */}
            <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
                <DialogContent className="sm:max-w-md text-center">
                    <DialogHeader>
                        <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <DialogTitle className="text-2xl">Report Submitted!</DialogTitle>
                        <DialogDescription className="text-base">
                            Your issue has been anonymously reported and assigned ID:
                            <span className="block text-lg font-mono font-bold text-foreground mt-2">
                                ISS-{String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}
                            </span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <p className="text-sm text-muted-foreground">
                            Our AI will verify your evidence and the case will be reviewed by the DAO within 48 hours.
                        </p>
                        <Button className="w-full" onClick={() => window.location.href = '/dashboard'}>
                            View Dashboard
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
