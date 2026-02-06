import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

/**
 * Hook for managing issues with realtime subscriptions
 */
export function useIssues(options = {}) {
    const { user, role } = useAuth();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { status, landlordOnly, tenantOnly } = options;

    // Fetch issues based on role and filters
    const fetchIssues = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('issues')
                .select(`
          *,
          property:properties(*),
          tenant:profiles!issues_tenant_id_fkey(id, full_name, email),
          landlord:profiles!issues_landlord_id_fkey(id, full_name, email)
        `)
                .order('created_at', { ascending: false });

            // Filter by status if provided
            if (status) {
                query = query.eq('status', status);
            }

            // Filter for landlord's issues
            if (landlordOnly && user) {
                query = query.eq('landlord_id', user.id);
            }

            // Filter for tenant's issues
            if (tenantOnly && user) {
                query = query.eq('tenant_id', user.id);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;
            setIssues(data || []);
        } catch (err) {
            console.error('Error fetching issues:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user, status, landlordOnly, tenantOnly]);

    // Get single issue by ID
    const getIssue = useCallback(async (issueId) => {
        try {
            const { data, error } = await supabase
                .from('issues')
                .select(`
          *,
          property:properties(*),
          tenant:profiles!issues_tenant_id_fkey(id, full_name, email),
          landlord:profiles!issues_landlord_id_fkey(id, full_name, email),
          evidence(*),
          landlord_responses(*),
          ai_verdicts(*),
          dao_votes(*),
          resolution_followups(*)
        `)
                .eq('id', issueId)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (err) {
            console.error('Error fetching issue:', err);
            return { data: null, error: err };
        }
    }, []);

    // Create new issue
    const createIssue = useCallback(async (issueData) => {
        try {
            const { data, error } = await supabase
                .from('issues')
                .insert({
                    ...issueData,
                    tenant_id: user.id,
                    status: 'REPORTED',
                })
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (err) {
            console.error('Error creating issue:', err);
            return { data: null, error: err };
        }
    }, [user]);

    // Update issue status
    const updateIssueStatus = useCallback(async (issueId, status) => {
        try {
            const { data, error } = await supabase
                .from('issues')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', issueId)
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (err) {
            console.error('Error updating issue status:', err);
            return { data: null, error: err };
        }
    }, []);

    // Setup realtime subscription
    useEffect(() => {
        fetchIssues();

        const channel = supabase
            .channel('issues-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'issues' },
                (payload) => {
                    console.log('Issue change:', payload);
                    fetchIssues(); // Refetch on any change
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchIssues]);

    return {
        issues,
        loading,
        error,
        fetchIssues,
        getIssue,
        createIssue,
        updateIssueStatus,
    };
}

/**
 * Hook for fetching a single issue with realtime updates
 */
export function useIssueDetail(issueId) {
    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchIssue = useCallback(async () => {
        if (!issueId) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('issues')
                .select(`
          *,
          property:properties(*),
          tenant:profiles!issues_tenant_id_fkey(id, full_name, email),
          landlord:profiles!issues_landlord_id_fkey(id, full_name, email),
          evidence(*),
          landlord_responses(*),
          ai_verdicts(*),
          dao_votes(id, vote, created_at),
          resolution_followups(*)
        `)
                .eq('id', issueId)
                .single();

            if (error) throw error;
            setIssue(data);
        } catch (err) {
            console.error('Error fetching issue:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [issueId]);

    useEffect(() => {
        fetchIssue();

        const channel = supabase
            .channel(`issue-${issueId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'issues', filter: `id=eq.${issueId}` },
                () => fetchIssue()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'dao_votes', filter: `issue_id=eq.${issueId}` },
                () => fetchIssue()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [issueId, fetchIssue]);

    return { issue, loading, error, refetch: fetchIssue };
}
