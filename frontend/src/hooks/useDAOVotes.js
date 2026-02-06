import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const VOTE_THRESHOLD = 10; // Number of votes needed to close a case

/**
 * Hook for DAO voting operations
 */
export function useDAOVotes() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Check if user has already voted on an issue
     */
    const hasVoted = useCallback(async (issueId) => {
        try {
            const { data, error } = await supabase
                .from('dao_votes')
                .select('id')
                .eq('issue_id', issueId)
                .eq('voter_id', user?.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                // PGRST116 = no rows returned
                throw error;
            }

            return !!data;
        } catch (err) {
            console.error('Error checking vote status:', err);
            return false;
        }
    }, [user]);

    /**
     * Get vote count for an issue
     */
    const getVoteCount = useCallback(async (issueId) => {
        try {
            const { count, error } = await supabase
                .from('dao_votes')
                .select('*', { count: 'exact', head: true })
                .eq('issue_id', issueId);

            if (error) throw error;
            return count || 0;
        } catch (err) {
            console.error('Error getting vote count:', err);
            return 0;
        }
    }, []);

    /**
     * Get vote summary (favor_tenant vs favor_landlord)
     */
    const getVoteSummary = useCallback(async (issueId) => {
        try {
            const { data, error } = await supabase
                .from('dao_votes')
                .select('vote')
                .eq('issue_id', issueId);

            if (error) throw error;

            const summary = {
                total: data.length,
                favor_tenant: data.filter(v => v.vote === 'favor_tenant').length,
                favor_landlord: data.filter(v => v.vote === 'favor_landlord').length,
                abstain: data.filter(v => v.vote === 'abstain').length,
            };

            return summary;
        } catch (err) {
            console.error('Error getting vote summary:', err);
            return { total: 0, favor_tenant: 0, favor_landlord: 0, abstain: 0 };
        }
    }, []);

    /**
     * Cast a vote on an issue
     * @param {string} issueId - The issue ID
     * @param {string} vote - The vote (favor_tenant | favor_landlord | abstain)
     * @param {string} reasoning - Optional reasoning for the vote
     */
    const castVote = useCallback(async (issueId, vote, reasoning = '') => {
        try {
            setLoading(true);
            setError(null);

            // Check if already voted
            const alreadyVoted = await hasVoted(issueId);
            if (alreadyVoted) {
                throw new Error('You have already voted on this issue');
            }

            // Insert vote
            const { data: voteData, error: voteError } = await supabase
                .from('dao_votes')
                .insert({
                    issue_id: issueId,
                    voter_id: user.id,
                    vote,
                    reasoning,
                })
                .select()
                .single();

            if (voteError) throw voteError;

            // Check if vote threshold reached
            const voteCount = await getVoteCount(issueId);

            if (voteCount >= VOTE_THRESHOLD) {
                // Update issue status to DAO_VERDICT
                const { error: updateError } = await supabase
                    .from('issues')
                    .update({
                        status: 'DAO_VERDICT',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', issueId);

                if (updateError) {
                    console.error('Error updating issue status:', updateError);
                }
            }

            return { data: voteData, error: null };
        } catch (err) {
            console.error('Error casting vote:', err);
            setError(err.message);
            return { data: null, error: err };
        } finally {
            setLoading(false);
        }
    }, [user, hasVoted, getVoteCount]);

    return {
        loading,
        error,
        hasVoted,
        getVoteCount,
        getVoteSummary,
        castVote,
        VOTE_THRESHOLD,
    };
}
