import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { issues, areas_list } from '@/lib/mock-data';

export function HousingHeatmap() {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Initialize map centered on Mumbai
        const map = L.map(mapRef.current, {
            center: [19.1136, 72.8697], // Centered around Andheri
            zoom: 11,
            zoomControl: false,
            scrollWheelZoom: false,
        });

        mapInstanceRef.current = map;

        // Add light tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20,
        }).addTo(map);

        // Add zoom control to top left (standard position, safer from 3D transform issues)
        L.control.zoom({ position: 'topleft' }).addTo(map);

        // Aggregate issues by area
        const areaStats = areas_list.map(area => {
            const areaIssues = issues.filter(issue => issue.location.area === area.name);
            const count = areaIssues.length;
            // Calculate intensity (0-1) based on max expected issues (e.g. 10)
            const intensity = Math.min(count / 8, 1);

            return {
                ...area,
                count,
                intensity
            };
        }).filter(stat => stat.count > 0);

        // Add heatmap circles for each area
        areaStats.forEach((point) => {
            const color = point.count > 6 ? '#ef4444' : point.count > 3 ? '#f59e0b' : '#22c55e';

            // Create a circle marker
            const circle = L.circleMarker([point.lat, point.lng], {
                radius: 15 + point.intensity * 25,
                fillColor: color,
                color: color,
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.4,
            }).addTo(map);

            // Add popup with info
            circle.bindPopup(`
                <div style="text-align: center; padding: 8px;">
                    <strong style="font-size: 14px;">${point.name}</strong><br/>
                    <span style="color: ${color}; font-size: 18px; font-weight: bold;">${point.count}</span><br/>
                    <span style="font-size: 12px; color: #666;">Active Issues</span>
                </div>
            `);
        });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    return (
        <div className="relative w-full h-full">
            <div ref={mapRef} className="w-full h-full rounded-2xl" />

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-neutral-900 text-sm z-[1000] border border-neutral-200 shadow-lg">
                <div className="font-semibold mb-2">Issue Density</div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>High (&gt;6 issues)</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span>Medium (3-6)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>Low (&lt;3)</span>
                </div>
            </div>

            {/* Stats overlay */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 text-neutral-900 z-[1000] border border-neutral-200 shadow-lg">
                <div className="text-2xl font-bold text-violet-600">{issues.length}</div>
                <div className="text-sm text-neutral-600">Active Issues</div>
                <div className="text-xs text-neutral-500 mt-1">Mumbai, IN</div>
            </div>
        </div>
    );
}

export default HousingHeatmap;
