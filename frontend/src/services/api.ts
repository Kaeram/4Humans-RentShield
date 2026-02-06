import axios, { AxiosInstance } from 'axios'
import { Issue, AiVerdict, DaoCase, User, UserRole, HeatmapArea, LandlordStats, ReportIssueForm, VoteOption, IssueComment } from '@/types'
import { mockIssues, mockAiVerdicts, mockDaoCases, mockHeatmapAreas, mockLandlordStats } from '@/data/mockData'
import { supabase } from '@/lib/supabaseClient'

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
// User/Auth API (Supabase Auth)
// ============================================

export const authApi = {
    async login(email: string, password: string, role: string): Promise<User> {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) throw error
        if (!data.user) throw new Error('No user returned from login')

        // Fetch user profile from profiles table
        let { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle()

        // If profile doesn't exist, create it
        if (!profile) {
            const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                    id: data.user.id,
                    email: email,
                    full_name: data.user.user_metadata?.full_name || email.split('@')[0],
                    role: role || 'tenant',
                })
                .select()
                .single()

            if (createError) {
                console.error('Failed to create profile:', createError)
                // Use default role if profile creation fails
                profile = { role: role || 'tenant' }
            } else {
                profile = newProfile
            }
        }

        const user: User = {
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.full_name || email.split('@')[0],
            role: (profile?.role || 'tenant') as UserRole,
            createdAt: data.user.created_at || new Date().toISOString(),
        }

        return user
    },

    async signup(name: string, email: string, password: string, role: string): Promise<User> {
        // Sign up with Supabase Auth - pass role in metadata for trigger
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    role: role,
                },
            },
        })

        if (error) throw error
        if (!data.user) throw new Error('No user returned from signup')

        // The trigger should create the profile, but if it fails, try manual creation
        // Wait a moment for trigger to execute
        await new Promise(resolve => setTimeout(resolve, 500))

        // Check if profile exists
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .single()

        // If profile doesn't exist (trigger failed), create manually
        if (!existingProfile) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: data.user.id,
                    email: email,
                    full_name: name,
                    role: role as UserRole,
                })

            if (profileError) {
                console.error('Profile creation error:', profileError)
                // Don't throw - user is created, just profile failed
            }
        }

        const user: User = {
            id: data.user.id,
            email: data.user.email || '',
            name,
            role: role as UserRole,
            createdAt: data.user.created_at || new Date().toISOString(),
        }

        return user
    },

    async logout(): Promise<void> {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    },

    async getCurrentUser(): Promise<User | null> {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return null

        // Fetch user profile from profiles table
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()

        // Return user with profile data, or fall back to auth metadata
        return {
            id: user.id,
            email: user.email || '',
            name: profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '',
            role: (profile?.role || user.user_metadata?.role || 'tenant') as UserRole,
            createdAt: user.created_at || new Date().toISOString(),
        }
    },
}

// ============================================
// Issues API
// ============================================

export const issuesApi = {
    async getAll(): Promise<Issue[]> {
        const { data, error } = await supabase
            .from('issues')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        // Transform database records to frontend Issue type
        // Note: For now, returning partial data structure
        // Full implementation would need to fetch evidence and comments
        return (data || []).map(issue => ({
            id: issue.id,
            category: issue.category,
            severity: issue.severity || 5,
            status: issue.status || 'pending',
            title: `${issue.category} Issue`,
            description: issue.description || '',
            propertyAddress: issue.address || '',
            createdAt: issue.created_at,
            updatedAt: issue.updated_at || issue.created_at,
            tenantId: issue.reporter_id || '',
            landlordId: issue.landlord_id,
            images: [],
            timeline: [],
        }))
    },

    async getById(id: string): Promise<Issue | null> {
        const { data, error } = await supabase
            .from('issues')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null // Not found
            throw error
        }

        return {
            id: data.id,
            category: data.category,
            severity: data.severity || 5,
            status: data.status || 'pending',
            title: `${data.category} Issue`,
            description: data.description || '',
            propertyAddress: data.address || '',
            createdAt: data.created_at,
            updatedAt: data.updated_at || data.created_at,
            tenantId: data.reporter_id || '',
            landlordId: data.landlord_id,
            images: [],
            timeline: [],
        }
    },

    async getByTenantId(tenantId: string): Promise<Issue[]> {
        const { data, error } = await supabase
            .from('issues')
            .select('*')
            .eq('reporter_id', tenantId)
            .order('created_at', { ascending: false })

        if (error) throw error

        return (data || []).map(issue => ({
            id: issue.id,
            category: issue.category,
            severity: issue.severity || 5,
            status: issue.status || 'pending',
            title: `${issue.category} Issue`,
            description: issue.description || '',
            propertyAddress: issue.address || '',
            createdAt: issue.created_at,
            updatedAt: issue.updated_at || issue.created_at,
            tenantId: issue.reporter_id || '',
            landlordId: issue.landlord_id,
            images: [],
            timeline: [],
        }))
    },

    async getByLandlordId(landlordId: string): Promise<Issue[]> {
        const { data, error } = await supabase
            .from('issues')
            .select('*')
            .eq('landlord_id', landlordId)
            .order('created_at', { ascending: false })

        if (error) throw error

        return (data || []).map(issue => ({
            id: issue.id,
            category: issue.category,
            severity: issue.severity || 5,
            status: issue.status || 'pending',
            title: `${issue.category} Issue`,
            description: issue.description || '',
            propertyAddress: issue.address || '',
            createdAt: issue.created_at,
            updatedAt: issue.updated_at || issue.created_at,
            tenantId: issue.reporter_id || '',
            landlordId: issue.landlord_id,
            images: [],
            timeline: [],
        }))
    },

    async create(data: ReportIssueForm): Promise<Issue> {
        // Get current user - try a few times if auth just happened
        let currentUser = await authApi.getCurrentUser()

        if (!currentUser) {
            // Wait and retry once
            await new Promise(resolve => setTimeout(resolve, 1000))
            currentUser = await authApi.getCurrentUser()
        }

        if (!currentUser) throw new Error('User not authenticated. Please log in again.')

        // CRITICAL CHECK: Ensure profile exists in database before creating issue
        // This prevents the 'issues_reporter_id_fkey' constraint violation
        const { data: profileCheck } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', currentUser.id)
            .maybeSingle()

        if (!profileCheck) {
            console.log('Profile missing during issue creation, creating now...')
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: currentUser.id,
                    email: currentUser.email,
                    full_name: currentUser.name,
                    role: currentUser.role,
                })

            if (profileError) {
                console.error('Failed to create profile during issue submission:', profileError)
                throw new Error('Your user profile could not be created. Please run the SQL fix in Supabase and try again.')
            }
        }

        // Insert issue into database
        const { data: issueData, error } = await supabase
            .from('issues')
            .insert({
                category: data.category,
                severity: 5,
                status: 'pending',
                description: data.description,
                address: data.propertyAddress,
                reporter_id: currentUser.id,
            })
            .select()
            .single()

        if (error) throw error

        // Upload images to Supabase Storage and create evidence records
        const uploadedImages: string[] = []
        if (data.images && data.images.length > 0) {
            for (const file of data.images) {
                try {
                    // Generate unique filename
                    const fileExt = file.name.split('.').pop()
                    const fileName = `${issueData.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

                    // Upload to Supabase Storage
                    const { error: uploadError } = await supabase.storage
                        .from('evidence')
                        .upload(fileName, file, {
                            cacheControl: '3600',
                            upsert: false
                        })

                    if (uploadError) {
                        console.error('Failed to upload image:', uploadError)
                        continue
                    }

                    // Get public URL
                    const { data: urlData } = supabase.storage
                        .from('evidence')
                        .getPublicUrl(fileName)

                    const fileUrl = urlData.publicUrl

                    // Create evidence record in database
                    await supabase
                        .from('evidence')
                        .insert({
                            issue_id: issueData.id,
                            file_url: fileUrl,
                            file_type: file.type,
                            file_size: file.size,
                        })

                    uploadedImages.push(fileUrl)
                } catch (err) {
                    console.error('Error uploading image:', err)
                }
            }
        }

        return {
            id: issueData.id,
            category: issueData.category,
            severity: issueData.severity || 5,
            status: issueData.status,
            title: `${issueData.category} Issue`,
            description: issueData.description,
            propertyAddress: issueData.address,
            createdAt: issueData.created_at,
            updatedAt: issueData.updated_at || issueData.created_at,
            tenantId: issueData.reporter_id,
            landlordId: issueData.landlord_id,
            images: uploadedImages,
            timeline: [],
        }
    },

    async respondToIssue(issueId: string, response: string): Promise<Issue> {
        const currentUser = await authApi.getCurrentUser()
        if (!currentUser) throw new Error('User not authenticated')

        // Create comment in comments table
        const { error: commentError } = await supabase
            .from('comments')
            .insert({
                issue_id: issueId,
                author_id: currentUser.id,
                content: response,
            })

        if (commentError) throw commentError

        // Fetch updated issue
        const issue = await issuesApi.getById(issueId)
        if (!issue) throw new Error('Issue not found')

        return issue
    },

    async getComments(issueId: string): Promise<IssueComment[]> {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('issue_id', issueId)
            .order('created_at', { ascending: true })

        if (error) throw error

        return (data || []).map(comment => ({
            id: comment.id,
            issue_id: comment.issue_id,
            author_id: comment.author_id,
            content: comment.content,
            created_at: comment.created_at,
        }))
    },

    async addComment(issueId: string, content: string): Promise<IssueComment> {
        const currentUser = await authApi.getCurrentUser()
        if (!currentUser) throw new Error('User not authenticated')

        const { data, error } = await supabase
            .from('comments')
            .insert({
                issue_id: issueId,
                author_id: currentUser.id,
                content: content,
            })
            .select()
            .single()

        if (error) throw error

        return {
            id: data.id,
            issue_id: data.issue_id,
            author_id: data.author_id,
            content: data.content,
            created_at: data.created_at,
        }
    },

    async getEvidence(issueId: string): Promise<string[]> {
        const { data, error } = await supabase
            .from('evidence')
            .select('file_url')
            .eq('issue_id', issueId)

        if (error) throw error

        return (data || []).map(e => e.file_url)
    },

    async updateIssueStatus(issueId: string, status: string): Promise<Issue> {
        // First check if user owns this issue
        const currentUser = await authApi.getCurrentUser()
        if (!currentUser) throw new Error('User not authenticated')

        // Update the issue status
        const { error: updateError } = await supabase
            .from('issues')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', issueId)
            .eq('reporter_id', currentUser.id)

        if (updateError) throw updateError

        // Fetch the updated issue
        const { data, error } = await supabase
            .from('issues')
            .select('*')
            .eq('id', issueId)
            .single()

        if (error) throw error
        if (!data) throw new Error('Issue not found')

        return {
            id: data.id,
            category: data.category,
            severity: data.severity || 5,
            status: data.status,
            title: `${data.category} Issue`,
            description: data.description || '',
            propertyAddress: data.address || '',
            createdAt: data.created_at,
            updatedAt: data.updated_at || data.created_at,
            tenantId: data.reporter_id || '',
            landlordId: data.landlord_id,
            images: [],
            timeline: [],
        }
    },

    async withdrawIssue(issueId: string): Promise<Issue> {
        // Update status to dismissed
        const issue = await issuesApi.updateIssueStatus(issueId, 'dismissed')

        // Add a comment noting the withdrawal
        await issuesApi.addComment(issueId, 'Issue withdrawn by tenant')

        return issue
    },

    async requestEscalation(issueId: string): Promise<Issue> {
        // Update status to escalated
        const issue = await issuesApi.updateIssueStatus(issueId, 'escalated')

        // Add a comment noting the escalation request
        await issuesApi.addComment(issueId, 'Escalation requested by tenant')

        return issue
    },

    async uploadAdditionalEvidence(issueId: string, files: File[]): Promise<string[]> {
        const currentUser = await authApi.getCurrentUser()
        if (!currentUser) throw new Error('User not authenticated')

        const uploadedImages: string[] = []

        for (const file of files) {
            try {
                const fileExt = file.name.split('.').pop()
                const fileName = `${issueId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

                const { error: uploadError } = await supabase.storage
                    .from('evidence')
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: false
                    })

                if (uploadError) {
                    console.error('Failed to upload image:', uploadError)
                    continue
                }

                const { data: urlData } = supabase.storage
                    .from('evidence')
                    .getPublicUrl(fileName)

                const fileUrl = urlData.publicUrl

                await supabase
                    .from('evidence')
                    .insert({
                        issue_id: issueId,
                        file_url: fileUrl,
                        file_type: file.type,
                        file_size: file.size,
                    })

                uploadedImages.push(fileUrl)
            } catch (err) {
                console.error('Error uploading image:', err)
            }
        }

        // Add comment about new evidence
        if (uploadedImages.length > 0) {
            await issuesApi.addComment(issueId, `Added ${uploadedImages.length} new evidence file(s)`)
        }

        return uploadedImages
    },
}

// ============================================
// AI Verdicts API
// ============================================

export const aiApi = {
    async getVerdict(issueId: string): Promise<AiVerdict | null> {
        const { data, error } = await supabase
            .from('ai_verdicts')
            .select('*')
            .eq('issue_id', issueId)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null // Not found
            throw error
        }

        return {
            id: data.id,
            issue_id: data.issue_id,
            confidence_score: data.confidence_score,
            auto_category: data.auto_category,
            raw_output: data.raw_output,
            created_at: data.created_at,
        }
    },

    async requestVerification(issueId: string): Promise<AiVerdict> {
        // TODO: Implement AI verification via Supabase Edge Function
        // For now, creating a placeholder verdict
        const { data, error } = await supabase
            .from('ai_verdicts')
            .insert({
                issue_id: issueId,
                confidence_score: 75,
                auto_category: 'pending_review',
                raw_output: 'AI analysis pending implementation',
            })
            .select()
            .single()

        if (error) throw error

        return {
            id: data.id,
            issue_id: data.issue_id,
            confidence_score: data.confidence_score,
            auto_category: data.auto_category,
            raw_output: data.raw_output,
            created_at: data.created_at,
        }
    },
}

// ============================================
// DAO Cases API
// ============================================

export const daoApi = {
    async getAllCases(): Promise<DaoCase[]> {
        // Note: Returning mock data for now as DaoCase structure needs issues + verdicts
        // Full implementation would require complex joins
        return mockDaoCases
    },

    async getCaseById(id: string): Promise<DaoCase | null> {
        // Note: Returning mock data for now
        return mockDaoCases.find(c => c.id === id) || null
    },

    async getPendingCases(): Promise<DaoCase[]> {
        // Note: Returning mock data for now
        return mockDaoCases.filter(c => c.status === 'pending' || c.status === 'voting')
    },

    async vote(caseId: string, option: VoteOption): Promise<void> {
        const currentUser = await authApi.getCurrentUser()
        if (!currentUser) throw new Error('User not authenticated')

        // Insert vote into dao_votes table
        const { error } = await supabase
            .from('dao_votes')
            .insert({
                issue_id: caseId,
                juror_id: currentUser.id,
                vote: option,
            })

        if (error) throw error
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
