import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Hook for handling evidence uploads to Supabase Storage
 */
export function useEvidence() {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Validate file before upload
     */
    const validateFile = useCallback((file) => {
        if (!file.type.startsWith('image/')) {
            return { valid: false, error: 'File must be an image' };
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return { valid: false, error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}` };
        }

        if (file.size > MAX_FILE_SIZE) {
            return { valid: false, error: 'File size must be less than 10MB' };
        }

        return { valid: true, error: null };
    }, []);

    /**
     * Upload a single evidence file
     * @param {File} file - The file to upload
     * @param {string} issueId - The issue ID
     * @param {string} uploadedBy - The user ID who is uploading
     * @param {string} type - Evidence type (tenant_evidence | landlord_evidence)
     * @returns {Promise<{data, error}>}
     */
    const uploadEvidence = useCallback(async (file, issueId, uploadedBy, type = 'tenant_evidence') => {
        try {
            setUploading(true);
            setError(null);

            // Validate file
            const validation = validateFile(file);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // Generate unique filename
            const timestamp = Date.now();
            const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const filePath = `evidence/${issueId}/${filename}`;

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('evidence')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('evidence')
                .getPublicUrl(filePath);

            // Insert evidence record in database
            const { data: evidenceRecord, error: insertError } = await supabase
                .from('evidence')
                .insert({
                    issue_id: issueId,
                    file_url: publicUrl,
                    file_name: file.name,
                    file_type: file.type,
                    file_size: file.size,
                    uploaded_by: uploadedBy,
                    evidence_type: type,
                })
                .select()
                .single();

            if (insertError) throw insertError;

            return { data: evidenceRecord, error: null };
        } catch (err) {
            console.error('Error uploading evidence:', err);
            setError(err.message);
            return { data: null, error: err };
        } finally {
            setUploading(false);
        }
    }, [validateFile]);

    /**
     * Upload multiple evidence files
     * @param {File[]} files - Array of files to upload
     * @param {string} issueId - The issue ID
     * @param {string} uploadedBy - The user ID
     * @param {string} type - Evidence type
     * @returns {Promise<{data: Array, errors: Array}>}
     */
    const uploadMultipleEvidence = useCallback(async (files, issueId, uploadedBy, type = 'tenant_evidence') => {
        const results = [];
        const errors = [];

        setUploading(true);

        for (const file of files) {
            const { data, error } = await uploadEvidence(file, issueId, uploadedBy, type);
            if (error) {
                errors.push({ file: file.name, error: error.message });
            } else {
                results.push(data);
            }
        }

        setUploading(false);

        return { data: results, errors };
    }, [uploadEvidence]);

    /**
     * Get evidence for an issue
     */
    const getEvidenceForIssue = useCallback(async (issueId) => {
        try {
            const { data, error } = await supabase
                .from('evidence')
                .select('*')
                .eq('issue_id', issueId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return { data, error: null };
        } catch (err) {
            console.error('Error fetching evidence:', err);
            return { data: null, error: err };
        }
    }, []);

    return {
        uploading,
        error,
        validateFile,
        uploadEvidence,
        uploadMultipleEvidence,
        getEvidenceForIssue,
    };
}
