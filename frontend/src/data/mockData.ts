import { Issue, AiVerdict, DaoCase, User, HeatmapArea, LandlordStats } from '@/types'

// Mock Users
export const mockUsers: User[] = [
    {
        id: 'tenant-1',
        email: 'john.tenant@email.com',
        name: 'John Smith',
        role: 'tenant',
        createdAt: '2024-01-15T10:00:00Z',
    },
    {
        id: 'landlord-1',
        email: 'sarah.landlord@email.com',
        name: 'Sarah Johnson',
        role: 'landlord',
        createdAt: '2024-01-10T10:00:00Z',
    },
    {
        id: 'dao-1',
        email: 'mike.dao@email.com',
        name: 'Mike Chen',
        role: 'dao',
        createdAt: '2024-01-05T10:00:00Z',
    },
]

// Mock Issues
export const mockIssues: Issue[] = [
    {
        id: 'issue-1',
        category: 'maintenance',
        severity: 7,
        status: 'in-review',
        title: 'Broken Heating System',
        description: 'The heating system has been broken for 2 weeks. Multiple requests to the landlord have been ignored. Temperature inside the apartment drops to 50°F at night.',
        propertyAddress: '123 Oak Street, Apt 4B, San Francisco, CA 94102',
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-01-25T14:30:00Z',
        tenantId: 'tenant-1',
        landlordId: 'landlord-1',
        images: [
            'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800',
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        ],
        timeline: [
            {
                id: 'event-1',
                type: 'created',
                message: 'Issue reported by tenant',
                createdAt: '2024-01-20T10:00:00Z',
                actorId: 'tenant-1',
                actorRole: 'tenant',
            },
            {
                id: 'event-2',
                type: 'updated',
                message: 'AI evidence verification completed',
                createdAt: '2024-01-20T10:05:00Z',
                actorId: 'system',
                actorRole: 'dao',
            },
            {
                id: 'event-3',
                type: 'response',
                message: 'Landlord has been notified',
                createdAt: '2024-01-20T10:10:00Z',
                actorId: 'system',
                actorRole: 'dao',
            },
        ],
    },
    {
        id: 'issue-2',
        category: 'pest',
        severity: 8,
        status: 'pending',
        title: 'Cockroach Infestation',
        description: 'Severe cockroach infestation in the kitchen area. Found multiple roaches in cabinets and near food storage. Issue has persisted for over a month.',
        propertyAddress: '456 Pine Avenue, Unit 2, Oakland, CA 94612',
        createdAt: '2024-01-22T15:00:00Z',
        updatedAt: '2024-01-22T15:00:00Z',
        tenantId: 'tenant-1',
        images: [
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        ],
        timeline: [
            {
                id: 'event-4',
                type: 'created',
                message: 'Issue reported by tenant',
                createdAt: '2024-01-22T15:00:00Z',
                actorId: 'tenant-1',
                actorRole: 'tenant',
            },
        ],
    },
    {
        id: 'issue-3',
        category: 'safety',
        severity: 9,
        status: 'escalated',
        title: 'Faulty Smoke Detectors',
        description: 'All smoke detectors in the apartment are non-functional. Landlord was notified 3 weeks ago but no action has been taken. This is a serious safety hazard.',
        propertyAddress: '789 Elm Street, Apt 12C, Berkeley, CA 94704',
        createdAt: '2024-01-18T09:00:00Z',
        updatedAt: '2024-01-28T11:00:00Z',
        tenantId: 'tenant-1',
        landlordId: 'landlord-1',
        images: [
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
            'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800',
        ],
        timeline: [
            {
                id: 'event-5',
                type: 'created',
                message: 'Issue reported by tenant',
                createdAt: '2024-01-18T09:00:00Z',
                actorId: 'tenant-1',
                actorRole: 'tenant',
            },
            {
                id: 'event-6',
                type: 'escalated',
                message: 'Case escalated to DAO review due to safety concerns',
                createdAt: '2024-01-28T11:00:00Z',
                actorId: 'system',
                actorRole: 'dao',
            },
        ],
    },
    {
        id: 'issue-4',
        category: 'security-deposit',
        severity: 6,
        status: 'resolved',
        title: 'Unfair Security Deposit Deduction',
        description: 'Landlord deducted $800 from security deposit for normal wear and tear. I have photos proving the condition of the apartment upon move-out.',
        propertyAddress: '321 Maple Drive, San Jose, CA 95112',
        createdAt: '2024-01-10T14:00:00Z',
        updatedAt: '2024-01-30T16:00:00Z',
        tenantId: 'tenant-1',
        landlordId: 'landlord-1',
        images: [],
        timeline: [
            {
                id: 'event-7',
                type: 'created',
                message: 'Issue reported by tenant',
                createdAt: '2024-01-10T14:00:00Z',
                actorId: 'tenant-1',
                actorRole: 'tenant',
            },
            {
                id: 'event-8',
                type: 'resolved',
                message: 'Case resolved in favor of tenant. Landlord agreed to refund $600.',
                createdAt: '2024-01-30T16:00:00Z',
                actorId: 'dao-1',
                actorRole: 'dao',
            },
        ],
    },
]

// Mock AI Verdicts
export const mockAiVerdicts: Record<string, AiVerdict> = {
    'issue-1': {
        caseId: 'issue-1',
        tenantConfidence: 78,
        landlordConfidence: 15,
        neutralConfidence: 7,
        recommendedAction: 'Escalate to DAO review. High confidence in tenant claim validity.',
        reasoning: 'Evidence analysis indicates heating system malfunction consistent with tenant description. Timestamp analysis shows issue duration aligns with reported timeline. No signs of evidence tampering detected.',
        redFlags: [
            'Landlord has not responded within required timeframe',
            'Health and safety violation potential',
        ],
        evidenceAnalysis: [
            {
                imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800',
                findings: ['Thermostat shows low temperature reading', 'Visible frost on windows'],
                authenticity: 'verified',
                confidenceScore: 92,
            },
            {
                imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
                findings: ['HVAC unit appears non-operational', 'Maintenance stickers outdated'],
                authenticity: 'verified',
                confidenceScore: 85,
            },
        ],
        generatedAt: '2024-01-20T10:05:00Z',
    },
    'issue-3': {
        caseId: 'issue-3',
        tenantConfidence: 91,
        landlordConfidence: 5,
        neutralConfidence: 4,
        recommendedAction: 'Immediate DAO intervention recommended. Critical safety violation.',
        reasoning: 'Multiple non-functional smoke detectors confirmed via image analysis. This represents a clear violation of housing safety codes. The extended timeframe without landlord response is concerning.',
        redFlags: [
            'Critical safety equipment non-functional',
            'Extended period without landlord action',
            'Potential habitability violation',
        ],
        evidenceAnalysis: [
            {
                imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
                findings: ['Smoke detector battery compartment empty', 'Device appears damaged'],
                authenticity: 'verified',
                confidenceScore: 95,
            },
        ],
        generatedAt: '2024-01-28T11:05:00Z',
    },
}

// Mock DAO Cases
export const mockDaoCases: DaoCase[] = [
    {
        id: 'case-1',
        issueId: 'issue-3',
        issue: mockIssues.find(i => i.id === 'issue-3')!,
        aiVerdict: mockAiVerdicts['issue-3'],
        status: 'voting',
        votes: [
            { id: 'vote-1', caseId: 'case-1', voterId: 'dao-1', option: 'favor-tenant', createdAt: '2024-01-28T12:00:00Z' },
            { id: 'vote-2', caseId: 'case-1', voterId: 'dao-2', option: 'favor-tenant', createdAt: '2024-01-28T13:00:00Z' },
            { id: 'vote-3', caseId: 'case-1', voterId: 'dao-3', option: 'favor-landlord', createdAt: '2024-01-28T14:00:00Z' },
        ],
        deadline: '2024-02-05T23:59:59Z',
        createdAt: '2024-01-28T11:00:00Z',
    },
    {
        id: 'case-2',
        issueId: 'issue-1',
        issue: mockIssues.find(i => i.id === 'issue-1')!,
        aiVerdict: mockAiVerdicts['issue-1'],
        status: 'pending',
        votes: [],
        deadline: '2024-02-10T23:59:59Z',
        createdAt: '2024-01-25T14:30:00Z',
    },
]

// Mock Landlord Stats
export const mockLandlordStats: LandlordStats = {
    totalComplaints: 12,
    pendingResponses: 3,
    reputationScore: 72,
    responseRate: 85,
    averageResponseTime: '2.5 days',
}

// Mock Heatmap Data
export const mockHeatmapAreas: HeatmapArea[] = [
    {
        id: 'area-1',
        name: 'Mission District',
        coordinates: [-122.4194, 37.7599],
        issueCount: 145,
        successRate: 78,
        positiveOutcomes: 113,
        avgResolutionDays: 12,
    },
    {
        id: 'area-2',
        name: 'SoMa',
        coordinates: [-122.3999, 37.7785],
        issueCount: 98,
        successRate: 82,
        positiveOutcomes: 80,
        avgResolutionDays: 10,
    },
    {
        id: 'area-3',
        name: 'Tenderloin',
        coordinates: [-122.4147, 37.7847],
        issueCount: 234,
        successRate: 65,
        positiveOutcomes: 152,
        avgResolutionDays: 18,
    },
    {
        id: 'area-4',
        name: 'Financial District',
        coordinates: [-122.4001, 37.7946],
        issueCount: 32,
        successRate: 91,
        positiveOutcomes: 29,
        avgResolutionDays: 7,
    },
    {
        id: 'area-5',
        name: 'Castro',
        coordinates: [-122.4350, 37.7609],
        issueCount: 67,
        successRate: 85,
        positiveOutcomes: 57,
        avgResolutionDays: 9,
    },
    {
        id: 'area-6',
        name: 'Haight-Ashbury',
        coordinates: [-122.4477, 37.7692],
        issueCount: 89,
        successRate: 76,
        positiveOutcomes: 68,
        avgResolutionDays: 14,
    },
]

// FAQ Data
export const faqItems = [
    {
        question: 'Is my identity protected?',
        answer: 'Yes, absolutely. RentShield uses advanced anonymization techniques to protect tenant identities throughout the dispute resolution process. Your personal information is encrypted and never shared with landlords or DAO members without your explicit consent.',
    },
    {
        question: 'How does AI verify evidence?',
        answer: 'Our AI engine uses multiple verification methods including EXIF metadata analysis, image authenticity checks, timestamp verification, and computer vision to analyze submitted evidence. This helps ensure that all evidence is genuine and accurately represents the reported issues.',
    },
    {
        question: 'What is the DAO?',
        answer: 'The DAO (Decentralized Autonomous Organization) is a community of verified housing advocates, former tenants, and housing law experts who review escalated cases. They vote on disputes using a blind voting system to ensure fair and unbiased decisions.',
    },
    {
        question: 'What happens after a verdict?',
        answer: 'After the DAO reaches a verdict, both parties are notified of the decision and recommended next steps. If the verdict favors the tenant, the landlord\'s reputation score is affected, and the case can be used as documentation for legal proceedings if needed.',
    },
]
