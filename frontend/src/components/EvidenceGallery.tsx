import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EvidenceAnalysis } from '@/types'

interface EvidenceGalleryProps {
    images: string[]
    analysis?: EvidenceAnalysis[]
}

export function EvidenceGallery({ images, analysis }: EvidenceGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    if (images.length === 0) {
        return (
            <div className="rounded-lg border-2 border-dashed border-neutral-200 p-8 text-center">
                <p className="text-sm text-neutral-500">No evidence images uploaded</p>
            </div>
        )
    }

    const getAnalysisForImage = (url: string) => {
        return analysis?.find(a => a.imageUrl === url)
    }

    const authenticityIcon = (auth: string) => {
        switch (auth) {
            case 'verified':
                return <CheckCircle className="h-4 w-4 text-success-500" />
            case 'suspicious':
                return <AlertCircle className="h-4 w-4 text-danger-500" />
            default:
                return <HelpCircle className="h-4 w-4 text-neutral-400" />
        }
    }

    return (
        <>
            {/* Thumbnail Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {images.map((img, idx) => {
                    const imgAnalysis = getAnalysisForImage(img)
                    return (
                        <motion.button
                            key={idx}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedIndex(idx)}
                            className="relative group aspect-square rounded-lg overflow-hidden bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        >
                            <img
                                src={img}
                                alt={`Evidence ${idx + 1}`}
                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            {imgAnalysis && (
                                <div className="absolute top-2 right-2 p-1 rounded-full bg-white shadow-md">
                                    {authenticityIcon(imgAnalysis.authenticity)}
                                </div>
                            )}
                        </motion.button>
                    )
                })}
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                        onClick={() => setSelectedIndex(null)}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setSelectedIndex(null)}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        {/* Navigation */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedIndex((selectedIndex - 1 + images.length) % images.length)
                                    }}
                                    className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedIndex((selectedIndex + 1) % images.length)
                                    }}
                                    className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </button>
                            </>
                        )}

                        {/* Image and Analysis */}
                        <motion.div
                            key={selectedIndex}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="max-w-4xl w-full flex flex-col gap-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={images[selectedIndex]}
                                alt={`Evidence ${selectedIndex + 1}`}
                                className="w-full max-h-[60vh] object-contain rounded-lg"
                            />

                            {/* Analysis Panel */}
                            {getAnalysisForImage(images[selectedIndex]) && (
                                <div className="bg-white rounded-lg p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-neutral-900">AI Analysis</h4>
                                        <div className="flex items-center gap-2">
                                            {authenticityIcon(getAnalysisForImage(images[selectedIndex])!.authenticity)}
                                            <span className={cn(
                                                'text-sm font-medium capitalize',
                                                getAnalysisForImage(images[selectedIndex])!.authenticity === 'verified' && 'text-success-600',
                                                getAnalysisForImage(images[selectedIndex])!.authenticity === 'suspicious' && 'text-danger-600',
                                                getAnalysisForImage(images[selectedIndex])!.authenticity === 'unverified' && 'text-neutral-500',
                                            )}>
                                                {getAnalysisForImage(images[selectedIndex])!.authenticity}
                                            </span>
                                            <span className="text-sm text-neutral-500">
                                                ({getAnalysisForImage(images[selectedIndex])!.confidenceScore}% confidence)
                                            </span>
                                        </div>
                                    </div>
                                    <ul className="space-y-1">
                                        {getAnalysisForImage(images[selectedIndex])!.findings.map((finding, i) => (
                                            <li key={i} className="text-sm text-neutral-600 flex items-start gap-2">
                                                <span className="text-primary-500 mt-1">•</span>
                                                {finding}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Counter */}
                            <p className="text-center text-white/70 text-sm">
                                {selectedIndex + 1} of {images.length}
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
