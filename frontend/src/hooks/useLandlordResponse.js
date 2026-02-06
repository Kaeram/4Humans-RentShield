import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * Hook for landlord response operations
 */
export function useLandlordResponse() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Submit landlord response to an issue
     * @param {string} issueId - The issue ID
     * @param {string} landlordId - The landlord's user ID
     * @param {string} responseText - The response text
     */
    const submitResponse = useCallback(async (issueId, landlordId, responseText) => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: insertError } = await supabase
                .from('landlord_responses')
                .insert({
                    issue_id: issueId,
                    landlord_id: landlordId,
                    response_text: responseText,
                })
                .select()
                .single();

            if (insertError) throw insertError;
            return { data, error: null };
        } catch (err) {
            console.error('Error submitting response:', err);
            setError(err.message);
            return { data: null, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Get landlord responses for an issue
     */
    const getResponses = useCallback(async (issueId) => {
        try {
            const { data, error } = await supabase
                .from('landlord_responses')
                .select('*')
                .eq('issue_id', issueId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return { data, error: null };
        } catch (err) {
            console.error('Error fetching responses:', err);
            return { data: null, error: err };
        }
    }, []);

    return {
        loading,
        error,
        submitResponse,
        getResponses,
    };
}

/**
 * Hook for resolution followup operations
 */
export function useResolutionFollowup() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Submit resolution followup
     * @param {string} issueId - The issue ID
     * @param {string} tenantId - The tenant's user ID
     * @param {boolean} complied - Whether landlord complied
     * @param {string} notes - Additional notes
     */
    const submitFollowup = useCallback(async (issueId, tenantId, complied, notes = '') => {
        try {
            setLoading(true);
            setError(null);

            // Insert followup record
            const { data, error: insertError } = await supabase
                .from('resolution_followups')
                .insert({
                    issue_id: issueId,
                    tenant_id: tenantId,
                    complied,
                    notes,
                })
                .select()
                .single();

            if (insertError) throw insertError;

            // Update issue status based on compliance
            const newStatus = complied ? 'RESOLVED' : 'ESCALATED_TO_ADMIN';

            const { error: updateError } = await supabase
                .from('issues')
                .update({
                    status: newStatus,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', issueId);

            if (updateError) throw updateError;

            return { data, error: null };
        } catch (err) {
            console.error('Error submitting followup:', err);
            setError(err.message);
            return { data: null, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        submitFollowup,
    };
}
