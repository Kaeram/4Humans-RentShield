import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, TrendingUp, Clock, CheckCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HeatmapArea } from '@/types'
import { mockHeatmapAreas } from '@/data/mockData'

interface HeatmapProps {
    expanded?: boolean
    onAreaSelect?: (area: HeatmapArea) => void
}

// Simple mock heatmap visualization
// In production, this would use Mapbox GL
export function Heatmap({ expanded = false, onAreaSelect }: HeatmapProps) {
    const [selectedArea, setSelectedArea] = useState<HeatmapArea | null>(null)
    const areas = mockHeatmapAreas

    const getHeatColor = (issueCount: number) => {
        if (issueCount > 150) return 'bg-danger-500'
        if (issueCount > 100) return 'bg-warning-500'
        if (issueCount > 50) return 'bg-primary-500'
        return 'bg-success-500'
    }

    const handleAreaClick = (area: HeatmapArea) => {
        setSelectedArea(area)
        onAreaSelect?.(area)
    }

    return (
        <div className={cn(
            'relative rounded-2xl overflow-hidden bg-gradient-to-br from-neutral-900 to-neutral-800',
            expanded ? 'h-[500px]' : 'h-[300px]'
        )}>
            {/* Map Background Pattern */}
            <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-neutral-400" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            {/* Mapbox Placeholder Text */}
            <div className="absolute bottom-4 left-4 text-xs text-neutral-500 flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                <span>Mapbox integration pending</span>
            </div>

            {/* Heatmap Points */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full max-w-lg h-full">
                    {areas.map((area, idx) => {
                        // Calculate position based on coordinates (simplified)
                        const x = 20 + (idx * 13) % 60
                        const y = 15 + (idx * 17) % 70
                        const isSelected = selectedArea?.id === area.id

                        return (
                            <motion.button
                                key={area.id}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => handleAreaClick(area)}
                                className={cn(
                                    'absolute rounded-full cursor-pointer transition-all duration-300',
                                    getHeatColor(area.issueCount),
                                    isSelected ? 'ring-4 ring-white ring-opacity-50 z-10' : 'hover:ring-2 hover:ring-white hover:ring-opacity-30'
                                )}
                                style={{
                                    left: `${x}%`,
                                    top: `${y}%`,
                                    width: `${Math.min(60, 20 + area.issueCount / 5)}px`,
                                    height: `${Math.min(60, 20 + area.issueCount / 5)}px`,
                                }}
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatType: 'loop' }}
                                    className={cn(
                                        'absolute inset-0 rounded-full opacity-50',
                                        getHeatColor(area.issueCount)
                                    )}
                                />
                                <span className="sr-only">{area.name}</span>
                            </motion.button>
                        )
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="absolute top-4 left-4 bg-neutral-900/80 backdrop-blur-sm rounded-lg p-3">
                <p className="text-xs text-neutral-400 font-medium mb-2">Issue Density</p>
                <div className="flex items-center gap-3 text-xs text-neutral-300">
                    <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-success-500" />
                        <span>Low</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-primary-500" />
                        <span>Medium</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-warning-500" />
                        <span>High</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-danger-500" />
                        <span>Critical</span>
                    </div>
                </div>
            </div>

            {/* Selected Area Info Panel */}
            <AnimatePresence>
                {selectedArea && expanded && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute top-4 right-4 w-64 bg-white rounded-xl shadow-xl overflow-hidden"
                    >
                        <div className="p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h4 className="font-semibold text-neutral-900">{selectedArea.name}</h4>
                                    <p className="text-xs text-neutral-500">{selectedArea.issueCount} reported issues</p>
                                </div>
                                <button
                                    onClick={() => setSelectedArea(null)}
                                    className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                                        <TrendingUp className="h-4 w-4 text-success-500" />
                                        <span>Success Rate</span>
                                    </div>
                                    <span className="text-sm font-semibold text-success-600">
                                        {selectedArea.successRate}%
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                                        <CheckCircle className="h-4 w-4 text-primary-500" />
                                        <span>Positive Outcomes</span>
                                    </div>
                                    <span className="text-sm font-semibold text-neutral-900">
                                        {selectedArea.positiveOutcomes}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                                        <Clock className="h-4 w-4 text-accent-500" />
                                        <span>Avg Resolution</span>
                                    </div>
                                    <span className="text-sm font-semibold text-neutral-900">
                                        {selectedArea.avgResolutionDays} days
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-100">
                            <button className="w-full btn-primary text-xs py-2">
                                View All Issues
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Compact Area Stats */}
            {!expanded && selectedArea && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-4 right-4 bg-white rounded-lg px-3 py-2 shadow-lg"
                >
                    <p className="text-sm font-medium text-neutral-900">{selectedArea.name}</p>
                    <p className="text-xs text-neutral-500">
                        {selectedArea.issueCount} issues • {selectedArea.successRate}% success
                    </p>
                </motion.div>
            )}
        </div>
    )
}
