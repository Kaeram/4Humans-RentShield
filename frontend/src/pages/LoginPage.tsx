import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, User, Building2, Scale, Loader2, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '@/services/api'
import { UserRole } from '@/types'

const roles = [
    {
        id: 'tenant' as UserRole,
        title: 'Tenant',
        description: 'Report housing issues and track resolutions',
        icon: User,
        color: 'bg-primary-100 text-primary-600 border-primary-200',
        selectedColor: 'bg-primary-600 text-white border-primary-600',
    },
    {
        id: 'landlord' as UserRole,
        title: 'Landlord',
        description: 'Respond to complaints and manage reputation',
        icon: Building2,
        color: 'bg-accent-100 text-accent-600 border-accent-200',
        selectedColor: 'bg-accent-600 text-white border-accent-600',
    },
    {
        id: 'dao' as UserRole,
        title: 'DAO Member',
        description: 'Review cases and vote on disputes',
        icon: Scale,
        color: 'bg-success-100 text-success-600 border-success-200',
        selectedColor: 'bg-success-600 text-white border-success-600',
    },
]

export function LoginPage() {
    const navigate = useNavigate()
    const [selectedRole, setSelectedRole] = useState<UserRole>('tenant')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            await api.auth.login(email, password, selectedRole)

            // Navigate to appropriate dashboard
            const dashboardRoutes: Record<UserRole, string> = {
                tenant: '/tenant/dashboard',
                landlord: '/landlord/dashboard',
                dao: '/dao/dashboard',
            }
            navigate(dashboardRoutes[selectedRole])
        } catch {
            setError('Invalid email or password. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-30">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary-200" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-md"
            >
                {/* Back Link */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                </Link>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-neutral-100">
                    {/* Logo */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 shadow-lg">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                        <span className="font-display text-2xl font-bold text-neutral-900">
                            Rent<span className="text-primary-600">Shield</span>
                        </span>
                    </div>

                    <h1 className="text-xl font-semibold text-neutral-900 text-center mb-2">
                        Welcome back
                    </h1>
                    <p className="text-sm text-neutral-500 text-center mb-6">
                        Sign in to access your dashboard
                    </p>

                    {/* Role Selector */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {roles.map((role) => (
                            <motion.button
                                key={role.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedRole(role.id)}
                                className={`p-3 rounded-xl border-2 transition-all ${selectedRole === role.id ? role.selectedColor : role.color
                                    }`}
                            >
                                <role.icon className="h-6 w-6 mx-auto mb-1" />
                                <p className="text-xs font-medium">{role.title}</p>
                            </motion.button>
                        ))}
                    </div>

                    {/* Role Description */}
                    <p className="text-xs text-neutral-500 text-center mb-6 h-8">
                        {roles.find((r) => r.id === selectedRole)?.description}
                    </p>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="label">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="label">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm text-danger-600 bg-danger-50 px-3 py-2 rounded-lg"
                            >
                                {error}
                            </motion.p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-neutral-200" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-white px-2 text-neutral-500">Demo Accounts</span>
                        </div>
                    </div>

                    {/* Quick Demo Login */}
                    <div className="space-y-2">
                        <button
                            type="button"
                            onClick={() => {
                                setEmail('john.tenant@email.com')
                                setPassword('demo')
                                setSelectedRole('tenant')
                            }}
                            className="w-full text-left text-xs p-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors"
                        >
                            <span className="font-medium text-neutral-700">Tenant Demo:</span>
                            <span className="text-neutral-500 ml-1">john.tenant@email.com</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setEmail('sarah.landlord@email.com')
                                setPassword('demo')
                                setSelectedRole('landlord')
                            }}
                            className="w-full text-left text-xs p-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors"
                        >
                            <span className="font-medium text-neutral-700">Landlord Demo:</span>
                            <span className="text-neutral-500 ml-1">sarah.landlord@email.com</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setEmail('mike.dao@email.com')
                                setPassword('demo')
                                setSelectedRole('dao')
                            }}
                            className="w-full text-left text-xs p-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors"
                        >
                            <span className="font-medium text-neutral-700">DAO Demo:</span>
                            <span className="text-neutral-500 ml-1">mike.dao@email.com</span>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-neutral-500 mt-6">
                    By signing in, you agree to our{' '}
                    <Link to="#" className="text-primary-600 hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="#" className="text-primary-600 hover:underline">Privacy Policy</Link>
                </p>
            </motion.div>
        </div>
    )
}
