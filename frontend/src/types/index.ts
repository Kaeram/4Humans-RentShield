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

// AI Verdict Types
export interface AiVerdict {
    caseId: string
    tenantConfidence: number // 0-100
    landlordConfidence: number // 0-100
    neutralConfidence: number // 0-100
    recommendedAction: string
    reasoning: string
    redFlags: string[]
    evidenceAnalysis: EvidenceAnalysis[]
    generatedAt: string
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

export interface Vote {
    id: string
    caseId: string
    voterId: string
    option: VoteOption
    createdAt: string
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
