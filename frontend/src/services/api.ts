import axios, { AxiosInstance } from 'axios'
import { Issue, AiVerdict, DaoCase, User, HeatmapArea, LandlordStats, ReportIssueForm, VoteOption } from '@/types'
import { mockIssues, mockAiVerdicts, mockDaoCases, mockUsers, mockHeatmapAreas, mockLandlordStats } from '@/data/mockData'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add auth token interceptor (placeholder for Supabase Auth)
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Simulate API delay for more realistic mocking
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// ============================================
// User/Auth API (Placeholder for Supabase)
// ============================================

export const authApi = {
    async login(email: string, _password: string, role: string): Promise<User> {
        await delay(500)
        // Mock login - find user by email or create mock user
        const user = mockUsers.find(u => u.email === email) || {
            id: `user-${Date.now()}`,
            email,
            name: email.split('@')[0],
            role: role as User['role'],
            createdAt: new Date().toISOString(),
        }
        localStorage.setItem('auth_token', 'mock-token-' + user.id)
        localStorage.setItem('current_user', JSON.stringify(user))
        return user
    },

    async signup(name: string, email: string, _password: string, role: string): Promise<User> {
        await delay(500)
        // Mock signup - create new user
        const user: User = {
            id: `user-${Date.now()}`,
            email,
            name,
            role: role as User['role'],
            createdAt: new Date().toISOString(),
        }
        localStorage.setItem('auth_token', 'mock-token-' + user.id)
        localStorage.setItem('current_user', JSON.stringify(user))
        return user
    },

    async logout(): Promise<void> {
        await delay(200)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('current_user')
    },

    getCurrentUser(): User | null {
        const userStr = localStorage.getItem('current_user')
        return userStr ? JSON.parse(userStr) : null
    },
}

// ============================================
// Issues API
// ============================================

export const issuesApi = {
    async getAll(): Promise<Issue[]> {
        await delay(300)
        return mockIssues
    },

    async getById(id: string): Promise<Issue | null> {
        await delay(200)
        return mockIssues.find(issue => issue.id === id) || null
    },

    async getByTenantId(tenantId: string): Promise<Issue[]> {
        await delay(300)
        return mockIssues.filter(issue => issue.tenantId === tenantId)
    },

    async getByLandlordId(landlordId: string): Promise<Issue[]> {
        await delay(300)
        return mockIssues.filter(issue => issue.landlordId === landlordId)
    },

    async create(data: ReportIssueForm): Promise<Issue> {
        await delay(500)
        const newIssue: Issue = {
            id: `issue-${Date.now()}`,
            category: data.category as Issue['category'],
            severity: 5,
            status: 'pending',
            title: `${data.category} Issue`,
            description: data.description,
            propertyAddress: data.propertyAddress,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tenantId: authApi.getCurrentUser()?.id || 'unknown',
            images: data.images.map(() => 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'),
            timeline: [
                {
                    id: `event-${Date.now()}`,
                    type: 'created',
                    message: 'Issue reported by tenant',
                    createdAt: new Date().toISOString(),
                    actorId: authApi.getCurrentUser()?.id || 'unknown',
                    actorRole: 'tenant',
                },
            ],
        }
        mockIssues.push(newIssue)
        return newIssue
    },

    async respondToIssue(issueId: string, response: string): Promise<Issue> {
        await delay(400)
        const issue = mockIssues.find(i => i.id === issueId)
        if (!issue) throw new Error('Issue not found')

        issue.timeline.push({
            id: `event-${Date.now()}`,
            type: 'response',
            message: response,
            createdAt: new Date().toISOString(),
            actorId: authApi.getCurrentUser()?.id || 'unknown',
            actorRole: 'landlord',
        })
        issue.updatedAt = new Date().toISOString()
        return issue
    },
}

// ============================================
// AI Verdicts API
// ============================================

export const aiApi = {
    async getVerdict(issueId: string): Promise<AiVerdict | null> {
        await delay(400)
        return mockAiVerdicts[issueId] || null
    },

    async requestVerification(issueId: string): Promise<AiVerdict> {
        await delay(1000) // Simulate AI processing time
        // Mock AI verdict generation
        const verdict: AiVerdict = {
            caseId: issueId,
            tenantConfidence: Math.floor(Math.random() * 40) + 60,
            landlordConfidence: Math.floor(Math.random() * 30),
            neutralConfidence: Math.floor(Math.random() * 20),
            recommendedAction: 'Review evidence and proceed to DAO voting',
            reasoning: 'AI analysis completed. Evidence appears consistent with tenant claims.',
            redFlags: [],
            evidenceAnalysis: [],
            generatedAt: new Date().toISOString(),
        }
        mockAiVerdicts[issueId] = verdict
        return verdict
    },
}

// ============================================
// DAO Cases API
// ============================================

export const daoApi = {
    async getAllCases(): Promise<DaoCase[]> {
        await delay(300)
        return mockDaoCases
    },

    async getCaseById(id: string): Promise<DaoCase | null> {
        await delay(200)
        return mockDaoCases.find(c => c.id === id) || null
    },

    async getPendingCases(): Promise<DaoCase[]> {
        await delay(300)
        return mockDaoCases.filter(c => c.status === 'pending' || c.status === 'voting')
    },

    async vote(caseId: string, option: VoteOption): Promise<void> {
        await delay(300)
        const daoCase = mockDaoCases.find(c => c.id === caseId)
        if (!daoCase) throw new Error('Case not found')

        daoCase.votes.push({
            id: `vote-${Date.now()}`,
            caseId,
            voterId: authApi.getCurrentUser()?.id || 'unknown',
            option,
            createdAt: new Date().toISOString(),
        })
    },
}

// ============================================
// Landlord Stats API
// ============================================

export const landlordApi = {
    async getStats(landlordId?: string): Promise<LandlordStats> {
        await delay(200)
        console.log('Fetching stats for landlord:', landlordId)
        return mockLandlordStats
    },
}

// ============================================
// Heatmap API (Placeholder for Mapbox)
// ============================================

export const heatmapApi = {
    async getAreas(): Promise<HeatmapArea[]> {
        await delay(300)
        return mockHeatmapAreas
    },

    async getAreaById(id: string): Promise<HeatmapArea | null> {
        await delay(200)
        return mockHeatmapAreas.find(a => a.id === id) || null
    },
}

// Export combined API object
export const api = {
    auth: authApi,
    issues: issuesApi,
    ai: aiApi,
    dao: daoApi,
    landlord: landlordApi,
    heatmap: heatmapApi,
}

export default api
