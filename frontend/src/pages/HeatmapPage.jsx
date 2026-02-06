import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Map,
    Layers,
    Filter,
    RefreshCw,
    MapPin,
    AlertTriangle,
} from 'lucide-react';
import { useHeatmapData } from '../hooks/useHeatmapData';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Spinner } from '../components/ui/spinner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';

// Dynamic import for Leaflet to avoid SSR issues
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const CATEGORY_COLORS = {
    'Repairs': '#ef4444',
    'Safety': '#f59e0b',
    'Pest Control': '#84cc16',
    'Utilities': '#06b6d4',
    'Lease Violations': '#8b5cf6',
    'Other': '#6b7280',
};

const CATEGORIES = ['All', 'Repairs', 'Safety', 'Pest Control', 'Utilities', 'Lease Violations', 'Other'];

function MapController({ center }) {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.setView(center, 12);
        }
    }, [center, map]);

    return null;
}

function Legend() {
    return (
        <div className="absolute bottom-4 left-4 z-[1000] bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-700">
            <h4 className="text-sm font-medium text-white mb-2">Categories</h4>
            <div className="space-y-1">
                {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
                    <div key={category} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                        />
                        <span className="text-xs text-gray-300">{category}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function HeatmapPage() {
    const { data, loading, error, fetchData } = useHeatmapData();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]); // NYC default

    // Filter data by category
    const filteredData = useMemo(() => {
        if (selectedCategory === 'All') return data;
        return data.filter((item) => item.category === selectedCategory);
    }, [data, selectedCategory]);

    // Calculate center from data
    useEffect(() => {
        if (data.length > 0) {
            const validPoints = data.filter(d => d.latitude && d.longitude);
            if (validPoints.length > 0) {
                const avgLat = validPoints.reduce((sum, d) => sum + d.latitude, 0) / validPoints.length;
                const avgLng = validPoints.reduce((sum, d) => sum + d.longitude, 0) / validPoints.length;
                setMapCenter([avgLat, avgLng]);
            }
        }
    }, [data]);

    // Category stats
    const categoryStats = useMemo(() => {
        const stats = {};
        data.forEach((item) => {
            const cat = item.category || 'Other';
            stats[cat] = (stats[cat] || 0) + 1;
        });
        return stats;
    }, [data]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Map className="w-8 h-8 text-cyan-400" />
                            Community Heatmap
                        </h1>
                        <p className="text-gray-400 mt-1">
                            Visualize housing issues across the community
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-[180px]">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Filter category" />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map((cat) => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={fetchData}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="flex flex-wrap gap-3">
                    <Card className="bg-gray-800/50 flex-1 min-w-[120px]">
                        <CardContent className="p-3 text-center">
                            <p className="text-2xl font-bold text-cyan-400">{data.length}</p>
                            <p className="text-xs text-gray-400">Total Issues</p>
                        </CardContent>
                    </Card>
                    {Object.entries(categoryStats).slice(0, 4).map(([cat, count]) => (
                        <Card key={cat} className="bg-gray-800/50 flex-1 min-w-[120px]">
                            <CardContent className="p-3 text-center">
                                <p className="text-2xl font-bold" style={{ color: CATEGORY_COLORS[cat] || '#6b7280' }}>
                                    {count}
                                </p>
                                <p className="text-xs text-gray-400">{cat}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Map Container */}
                <Card className="bg-gray-800/30 overflow-hidden">
                    <CardContent className="p-0 relative" style={{ height: '600px' }}>
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                                <Spinner size="lg" />
                            </div>
                        ) : error ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                                <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
                                <p className="text-red-400">{error}</p>
                                <Button variant="outline" onClick={fetchData} className="mt-4">
                                    Try Again
                                </Button>
                            </div>
                        ) : (
                            <>
                                <MapContainer
                                    center={mapCenter}
                                    zoom={12}
                                    style={{ height: '100%', width: '100%' }}
                                    className="z-0"
                                >
                                    <MapController center={mapCenter} />
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />

                                    {filteredData.map((item, index) => {
                                        if (!item.latitude || !item.longitude) return null;
                                        const color = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other;

                                        return (
                                            <CircleMarker
                                                key={`${item.id || index}`}
                                                center={[item.latitude, item.longitude]}
                                                radius={10}
                                                fillColor={color}
                                                fillOpacity={0.7}
                                                color={color}
                                                weight={2}
                                            >
                                                <Popup>
                                                    <div className="text-sm">
                                                        <p className="font-medium">{item.category || 'Unknown'}</p>
                                                        {item.city && <p className="text-gray-600">{item.city}</p>}
                                                    </div>
                                                </Popup>
                                            </CircleMarker>
                                        );
                                    })}
                                </MapContainer>

                                <Legend />
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="bg-gray-800/30">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Layers className="w-5 h-5" />
                            About This Map
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-400 space-y-2">
                        <p>
                            This map shows anonymized locations of reported housing issues in the community.
                            Use the filter to view specific categories of issues.
                        </p>
                        <p>
                            <strong className="text-white">Privacy:</strong> Exact addresses are not shown.
                            Markers represent approximate neighborhoods only.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
