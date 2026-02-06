import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * Hook for fetching heatmap data (public query)
 */
export function useHeatmapData() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchHeatmapData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: issues, error: fetchError } = await supabase
                .from('issues')
                .select(`
          id,
          category,
          status,
          created_at,
          property:properties(
            latitude,
            longitude,
            city,
            area
          )
        `)
                .not('property', 'is', null);

            if (fetchError) throw fetchError;

            // Transform data for heatmap
            const heatmapPoints = issues
                .filter(issue => issue.property?.latitude && issue.property?.longitude)
                .map(issue => ({
                    id: issue.id,
                    latitude: issue.property.latitude,
                    longitude: issue.property.longitude,
                    category: issue.category,
                    status: issue.status,
                    city: issue.property.city,
                    area: issue.property.area,
                    createdAt: issue.created_at,
                }));

            setData(heatmapPoints);
        } catch (err) {
            console.error('Error fetching heatmap data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHeatmapData();
    }, [fetchHeatmapData]);

    return {
        data,
        loading,
        error,
        refetch: fetchHeatmapData,
    };
}
