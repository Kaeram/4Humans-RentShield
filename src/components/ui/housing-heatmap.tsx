import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Mock housing issue data for the heatmap
const mockHousingData = [
    { lat: 37.7749, lng: -122.4194, intensity: 0.8, issues: 45, area: "Mission District" },
    { lat: 37.7849, lng: -122.4094, intensity: 0.6, issues: 32, area: "SoMa" },
    { lat: 37.7649, lng: -122.4294, intensity: 0.9, issues: 58, area: "Castro" },
    { lat: 37.7549, lng: -122.4394, intensity: 0.4, issues: 18, area: "Noe Valley" },
    { lat: 37.7949, lng: -122.3994, intensity: 0.7, issues: 41, area: "Financial District" },
    { lat: 37.7699, lng: -122.4494, intensity: 0.5, issues: 25, area: "Haight-Ashbury" },
    { lat: 37.7599, lng: -122.3894, intensity: 0.85, issues: 52, area: "Potrero Hill" },
    { lat: 37.8049, lng: -122.4294, intensity: 0.3, issues: 12, area: "Marina" },
    { lat: 37.7449, lng: -122.4194, intensity: 0.75, issues: 38, area: "Excelsior" },
    { lat: 37.7849, lng: -122.4594, intensity: 0.55, issues: 28, area: "Richmond" },
];

export function HousingHeatmap() {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Initialize map centered on San Francisco
        const map = L.map(mapRef.current, {
            center: [37.7749, -122.4194],
            zoom: 12,
            zoomControl: false,
            scrollWheelZoom: false,
        });

        mapInstanceRef.current = map;

        // Add dark tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20,
        }).addTo(map);

        // Add zoom control to bottom right
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Add heatmap circles for each data point
        mockHousingData.forEach((point) => {
            const color = point.intensity > 0.7 ? '#ef4444' : point.intensity > 0.4 ? '#f59e0b' : '#22c55e';

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
                    <strong style="font-size: 14px;">${point.area}</strong><br/>
                    <span style="color: ${color}; font-size: 18px; font-weight: bold;">${point.issues}</span><br/>
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
            <div className="absolute bottom-4 left-4 bg-neutral-900/90 backdrop-blur-sm rounded-lg p-3 text-white text-sm z-[1000]">
                <div className="font-semibold mb-2">Issue Density</div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>High (&gt;40 issues)</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span>Medium (20-40)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>Low (&lt;20)</span>
                </div>
            </div>

            {/* Stats overlay */}
            <div className="absolute top-4 right-4 bg-neutral-900/90 backdrop-blur-sm rounded-lg p-4 text-white z-[1000]">
                <div className="text-2xl font-bold text-lime-400">349</div>
                <div className="text-sm text-neutral-300">Active Issues</div>
                <div className="text-xs text-neutral-500 mt-1">San Francisco, CA</div>
            </div>
        </div>
    );
}

export default HousingHeatmap;
