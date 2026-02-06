// User Types
export type UserRole = 'tenant' | 'landlord' | 'dao'

export interface User {
    id: string
    email: string
    name: string
    role: UserRole
    avatar?: string
    createdAt: string
}

// Profile Type (matches profiles table)
export interface Profile {
    id: string
    role: UserRole
    created_at: string
}

// Property Type (matches properties table)
export interface Property {
    id: string
    landlord_id: string
    area?: string
    risk_score?: number
    created_at: string
}

// Issue Types
export type IssueCategory =
    | 'maintenance'
    | 'safety'
    | 'pest'
    | 'noise'
    | 'lease-violation'
    | 'utilities'
    | 'security-deposit'
    | 'other'

export type IssueStatus =
    | 'pending'
    | 'in-review'
    | 'under-investigation'
    | 'resolved'
    | 'dismissed'
    | 'escalated'

export interface Issue {
    id: string
    category: IssueCategory
    severity: number // 1-10
    status: IssueStatus
    title: string
    description: string
    propertyAddress: string
    createdAt: string
    updatedAt: string
    tenantId: string
    landlordId?: string
    images: string[]
    timeline: TimelineEvent[]
}

export interface TimelineEvent {
    id: string
    type: 'created' | 'updated' | 'response' | 'escalated' | 'resolved'
    message: string
    createdAt: string
    actorId: string
    actorRole: UserRole
}

// IssueComment Type (matches comments table, renamed to avoid DOM Comment collision)
export interface IssueComment {
    id: string
    issue_id: string
    author_id: string
    content: string
    created_at: string
}

// Evidence Type (matches evidence table)
export interface Evidence {
    id: string
    issue_id: string
    file_url: string
    acf_valid?: boolean
    created_at: string
}

// AI Verdict Types (matches ai_verdicts table)
export interface AiVerdict {
    id?: string
    issue_id?: string
    caseId?: string // Legacy field for compatibility
    confidence_score?: number
    auto_category?: string
    raw_output?: string
    // Legacy fields for compatibility
    tenantConfidence?: number // 0-100
    landlordConfidence?: number // 0-100
    neutralConfidence?: number // 0-100
    recommendedAction?: string
    reasoning?: string
    redFlags?: string[]
    evidenceAnalysis?: EvidenceAnalysis[]
    created_at?: string
    generatedAt?: string
}

export interface EvidenceAnalysis {
    imageUrl: string
    findings: string[]
    authenticity: 'verified' | 'suspicious' | 'unverified'
    confidenceScore: number
}

// DAO Types
export type VoteOption = 'favor-tenant' | 'favor-landlord' | 'request-more-context'

export interface DaoCase {
    id: string
    issueId: string
    issue: Issue
    aiVerdict: AiVerdict
    status: 'pending' | 'voting' | 'resolved'
    votes: Vote[]
    deadline: string
    createdAt: string
}

// Vote Type (matches dao_votes table)
export interface Vote {
    id: string
    issue_id?: string
    caseId?: string // Legacy field for compatibility
    juror_id?: string
    voterId?: string // Legacy field for compatibility
    vote?: VoteOption
    option?: VoteOption // Legacy field for compatibility
    voted_at?: string
    createdAt?: string
}

export interface VoteResult {
    favorTenant: number
    favorLandlord: number
    requestMoreContext: number
    totalVotes: number
    decision?: VoteOption
}

// Landlord Types
export interface LandlordStats {
    totalComplaints: number
    pendingResponses: number
    reputationScore: number
    responseRate: number
    averageResponseTime: string
}

// Heatmap Types
export interface HeatmapArea {
    id: string
    name: string
    coordinates: [number, number]
    issueCount: number
    successRate: number
    positiveOutcomes: number
    avgResolutionDays: number
}

// Form Types
export interface ReportIssueForm {
    propertyAddress: string
    category: IssueCategory | ''
    description: string
    images: File[]
}
