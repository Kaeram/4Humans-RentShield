import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'
import { MapPin, Filter, Info } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { categories_list } from '../data/mockData'

const categoryColors = {
    'Maintenance': '#f97316',
    'Safety': '#ef4444',
    'Harassment': '#a855f7',
    'Security Deposit': '#22c55e',
    'Illegal Eviction': '#dc2626',
    'Amenities': '#3b82f6',
    'Noise': '#eab308',
    'Pest Control': '#b45309',
}

const severityLegend = [
    { level: 1, label: 'Minor', color: '#22c55e' },
    { level: 2, label: 'Moderate', color: '#eab308' },
    { level: 3, label: 'Significant', color: '#f97316' },
    { level: 4, label: 'Severe', color: '#ef4444' },
    { level: 5, label: 'Critical', color: '#991b1b' },
]

export default function CommunityHeatmap() {
    const { issues } = useApp()
    const mapContainer = useRef(null)
    const mapRef = useRef(null)
    const heatLayerRef = useRef(null)
    const markersLayerRef = useRef(null)
    const [mapLoaded, setMapLoaded] = useState(false)
    const [selectedCategories, setSelectedCategories] = useState(new Set(categories_list))

    const filteredIssues = issues.filter(issue => selectedCategories.has(issue.category))

    const toggleCategory = (category) => {
        const newSelected = new Set(selectedCategories)
        if (newSelected.has(category)) {
            newSelected.delete(category)
        } else {
            newSelected.add(category)
        }
        setSelectedCategories(newSelected)
    }

    // Initialize map
    useEffect(() => {
        if (mapRef.current || !mapContainer.current) return

        // Create map centered on Mumbai
        mapRef.current = L.map(mapContainer.current).setView([19.0760, 72.8777], 11)

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
        }).addTo(mapRef.current)

        // Create markers layer group
        markersLayerRef.current = L.layerGroup().addTo(mapRef.current)

        setMapLoaded(true)

        return () => {
            if (mapRef.current) {
                mapRef.current.remove()
                mapRef.current = null
            }
        }
    }, [])

    // Update heatmap and markers when filtered issues change
    useEffect(() => {
        if (!mapRef.current || !mapLoaded) return

        // Remove existing heat layer
        if (heatLayerRef.current) {
            mapRef.current.removeLayer(heatLayerRef.current)
        }

        // Clear existing markers
        if (markersLayerRef.current) {
            markersLayerRef.current.clearLayers()
        }

        // Prepare heatmap data - [lat, lng, intensity]
        const heatData = filteredIssues.map(issue => [
            issue.location.lat,
            issue.location.lng,
            issue.severity * 0.2 // Normalize intensity
        ])

        // Create new heat layer
        if (heatData.length > 0) {
            heatLayerRef.current = L.heatLayer(heatData, {
                radius: 25,
                blur: 15,
                maxZoom: 17,
                max: 1.0,
                gradient: {
                    0.0: '#3b82f6',
                    0.25: '#22c55e',
                    0.5: '#eab308',
                    0.75: '#f97316',
                    1.0: '#ef4444'
                }
            }).addTo(mapRef.current)
        }

        // Add circle markers for individual issues (visible on zoom)
        filteredIssues.forEach(issue => {
            const severityColor = severityLegend[issue.severity - 1]?.color || '#888'

            const marker = L.circleMarker([issue.location.lat, issue.location.lng], {
                radius: 6 + issue.severity,
                fillColor: severityColor,
                color: '#fff',
                weight: 2,
                opacity: 0.9,
                fillOpacity: 0.7
            })

            marker.bindPopup(`
        <div style="min-width: 150px;">
          <strong>${issue.id}</strong><br/>
          <span style="color: ${categoryColors[issue.category]}">${issue.category}</span><br/>
          <small>${issue.location.area}</small><br/>
          <span>Severity: ${issue.severity}/5</span><br/>
          <a href="/issue/${issue.id}" style="color: #3b82f6;">View Details →</a>
        </div>
      `)

            markersLayerRef.current.addLayer(marker)
        })

    }, [filteredIssues, mapLoaded])

    const areaCounts = filteredIssues.reduce((acc, issue) => {
        acc[issue.location.area] = (acc[issue.location.area] || 0) + 1
        return acc
    }, {})

    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Community Heatmap</h1>
                    <p className="text-muted-foreground">
                        Visualize issue density across Mumbai neighborhoods.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-6"
                    >
                        {/* Category Filters */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <Filter className="w-4 h-4" />
                                    <span className="font-semibold">Filter by Category</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {categories_list.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => toggleCategory(category)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCategories.has(category)
                                                    ? 'text-white'
                                                    : 'bg-muted text-muted-foreground'
                                                }`}
                                            style={{
                                                backgroundColor: selectedCategories.has(category) ? categoryColors[category] : undefined,
                                            }}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Severity Legend */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <Info className="w-4 h-4" />
                                    <span className="font-semibold">Severity Legend</span>
                                </div>
                                <div className="space-y-2">
                                    {severityLegend.map((item) => (
                                        <div key={item.level} className="flex items-center gap-3">
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <span className="text-sm">{item.level} - {item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Area Stats */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <MapPin className="w-4 h-4" />
                                    <span className="font-semibold">Issues by Area</span>
                                </div>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {Object.entries(areaCounts)
                                        .sort((a, b) => b[1] - a[1])
                                        .map(([area, count]) => (
                                            <div key={area} className="flex items-center justify-between text-sm">
                                                <span className="truncate">{area}</span>
                                                <Badge variant="secondary">{count}</Badge>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Map */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-3"
                    >
                        <Card className="overflow-hidden">
                            <div
                                ref={mapContainer}
                                className="w-full h-[600px] bg-muted"
                                style={{ zIndex: 1 }}
                            >
                                {!mapLoaded && (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4 mx-auto" />
                                            <p className="text-muted-foreground">Loading map...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                            Showing {filteredIssues.length} issues • Click markers for details • Map data © OpenStreetMap
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
