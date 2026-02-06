import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * Hook for property operations
 */
export function useProperties() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Find landlord by email
     * @param {string} email - Landlord's email
     * @returns {Promise<{data, error}>}
     */
    const findLandlordByEmail = useCallback(async (email) => {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('profiles')
                .select('id, email, full_name, role')
                .eq('email', email.toLowerCase())
                .eq('role', 'landlord')
                .single();

            if (error && error.code === 'PGRST116') {
                // No landlord found
                return { data: null, error: new Error('Landlord not found with this email') };
            }

            if (error) throw error;
            return { data, error: null };
        } catch (err) {
            console.error('Error finding landlord:', err);
            setError(err.message);
            return { data: null, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Find or create property by address
     * @param {Object} propertyData - Property data
     * @returns {Promise<{data, error}>}
     */
    const upsertProperty = useCallback(async (propertyData) => {
        try {
            setLoading(true);
            setError(null);

            const { address, area, city, latitude, longitude } = propertyData;

            // First try to find existing property by address
            const { data: existing, error: findError } = await supabase
                .from('properties')
                .select('*')
                .ilike('address', address)
                .single();

            if (findError && findError.code !== 'PGRST116') {
                throw findError;
            }

            if (existing) {
                return { data: existing, error: null };
            }

            // Create new property
            const { data: newProperty, error: insertError } = await supabase
                .from('properties')
                .insert({
                    address,
                    area,
                    city,
                    latitude: latitude || null,
                    longitude: longitude || null,
                })
                .select()
                .single();

            if (insertError) throw insertError;
            return { data: newProperty, error: null };
        } catch (err) {
            console.error('Error upserting property:', err);
            setError(err.message);
            return { data: null, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Get property by ID with issue history
     */
    const getPropertyWithHistory = useCallback(async (propertyId) => {
        try {
            const { data, error } = await supabase
                .from('properties')
                .select(`
          *,
          issues(id, status, category, created_at)
        `)
                .eq('id', propertyId)
                .single();

            if (error) throw error;

            // Calculate property history stats
            const issues = data.issues || [];
            const resolvedCount = issues.filter(i => i.status === 'RESOLVED').length;
            const history = {
                previous_complaints: issues.length,
                resolution_rate: issues.length > 0 ? resolvedCount / issues.length : 0,
            };

            return { data: { ...data, history }, error: null };
        } catch (err) {
            console.error('Error fetching property:', err);
            return { data: null, error: err };
        }
    }, []);

    return {
        loading,
        error,
        findLandlordByEmail,
        upsertProperty,
        getPropertyWithHistory,
    };
}
