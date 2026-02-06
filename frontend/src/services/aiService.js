import axios from 'axios';

const AI_ENGINE_URL = import.meta.env.VITE_AI_ENGINE_URL || 'http://localhost:8000';

const aiClient = axios.create({
    baseURL: AI_ENGINE_URL,
    timeout: 120000, // 2 minutes for AI operations
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Classify an issue by description
 * @param {string} description - Issue description
 * @param {number} evidenceCount - Number of evidence items
 * @returns {Promise<Object>} Classification result
 */
export async function classifyIssue(description, evidenceCount = 0) {
    const response = await aiClient.post('/api/v1/classify-issue', {
        description,
        evidence_count: evidenceCount,
    });
    return response.data;
}

/**
 * Validate evidence image
 * @param {File} imageFile - Image file to validate
 * @param {string} claimText - Claim text for the evidence
 * @param {string} incidentDate - ISO date string of incident
 * @returns {Promise<Object>} Validation result
 */
export async function validateEvidence(imageFile, claimText, incidentDate = null) {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (claimText) {
        formData.append('claim_text', claimText);
    }
    if (incidentDate) {
        formData.append('incident_date', incidentDate);
    }

    const response = await aiClient.post('/api/v1/validate-evidence', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

/**
 * Analyze a full dispute case
 * @param {Object} params - Case analysis parameters
 * @returns {Promise<Object>} DAO recommendation
 */
export async function analyzeCase({
    issueId,
    tenantComplaint,
    landlordResponse = null,
    incidentDate = null,
    tenantEvidence = [],
    landlordEvidence = [],
    propertyHistory = { previous_complaints: 0, resolution_rate: 0 },
}) {
    const response = await aiClient.post('/api/v1/analyze-case', {
        issue_id: issueId,
        tenant_complaint: tenantComplaint,
        landlord_response: landlordResponse,
        incident_date: incidentDate,
        tenant_evidence: tenantEvidence,
        landlord_evidence: landlordEvidence,
        property_history: propertyHistory,
    });
    return response.data;
}

/**
 * Check AI engine health
 * @returns {Promise<Object>} Health status
 */
export async function checkHealth() {
    const response = await aiClient.get('/health');
    return response.data;
}

export default aiClient;
