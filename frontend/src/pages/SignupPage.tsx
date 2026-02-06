import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, User, Building2, Scale, Loader2, ArrowLeft, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '@/services/api'
import { UserRole } from '@/types'
import AnimatedShaderBackground from '@/components/ui/animated-shader-background'

const roles = [
    {
        id: 'tenant' as UserRole,
        title: 'Tenant',
        description: 'Report housing issues and track resolutions',
        icon: User,
        color: 'bg-neutral-800 text-neutral-400 border-neutral-700',
        selectedColor: 'bg-lime-400/10 text-lime-400 border-lime-400/50',
    },
    {
        id: 'landlord' as UserRole,
        title: 'Landlord',
        description: 'Respond to complaints and manage reputation',
        icon: Building2,
        color: 'bg-neutral-800 text-neutral-400 border-neutral-700',
        selectedColor: 'bg-violet-400/10 text-violet-400 border-violet-400/50',
    },
    {
        id: 'dao' as UserRole,
        title: 'DAO Member',
        description: 'Review cases and vote on disputes',
        icon: Scale,
        color: 'bg-neutral-800 text-neutral-400 border-neutral-700',
        selectedColor: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/50',
    },
]

export function SignupPage() {
    const navigate = useNavigate()
    const [selectedRole, setSelectedRole] = useState<UserRole>('tenant')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [agreeToTerms, setAgreeToTerms] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        // Validate terms accepted
        if (!agreeToTerms) {
            setError('Please accept the Terms of Service and Privacy Policy')
            return
        }

        setIsLoading(true)

        try {
            await api.auth.signup(name, email, password, selectedRole)

            // Navigate to appropriate dashboard
            const dashboardRoutes: Record<UserRole, string> = {
                tenant: '/tenant/dashboard',
                landlord: '/landlord/dashboard',
                dao: '/dao/dashboard',
            }
            navigate(dashboardRoutes[selectedRole])
        } catch {
            setError('An error occurred during signup. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-neutral-900 relative flex items-center justify-center p-4">
            {/* Aurora Background */}
            <div className="fixed inset-0 z-0">
                <AnimatedShaderBackground />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Back Link */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-sm text-neutral-300 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                </Link>

                {/* Signup Card */}
                <div className="bg-neutral-900/50 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-neutral-800">
                    {/* Logo */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime-400 shadow-lg">
                            <Shield className="h-6 w-6 text-neutral-900" />
                        </div>
                        <span className="font-display text-2xl font-bold text-white">
                            Rent<span className="text-lime-400">Shield</span>
                        </span>
                    </div>

                    <h1 className="text-xl font-semibold text-white text-center mb-2">
                        Create your account
                    </h1>
                    <p className="text-sm text-neutral-400 text-center mb-6">
                        Join the community and start protecting your rights
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
                    <p className="text-xs text-neutral-400 text-center mb-6 h-8">
                        {roles.find((r) => r.id === selectedRole)?.description}
                    </p>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-neutral-400 mb-1.5">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-neutral-800/50 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all"
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-neutral-400 mb-1.5">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-neutral-800/50 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-neutral-400 mb-1.5">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-neutral-800/50 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all"
                                placeholder="••••••••"
                                required
                                minLength={8}
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-400 mb-1.5">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-neutral-800/50 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all"
                                placeholder="••••••••"
                                required
                                minLength={8}
                            />
                        </div>

                        {/* Terms Checkbox */}
                        <div className="flex items-start gap-3">
                            <button
                                type="button"
                                onClick={() => setAgreeToTerms(!agreeToTerms)}
                                className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${agreeToTerms
                                    ? 'bg-lime-400 border-lime-400'
                                    : 'bg-neutral-800/50 border-neutral-700'
                                    }`}
                            >
                                {agreeToTerms && <Check className="h-3 w-3 text-neutral-900" />}
                            </button>
                            <label className="text-xs text-neutral-400 cursor-pointer" onClick={() => setAgreeToTerms(!agreeToTerms)}>
                                I agree to the{' '}
                                <Link to="#" className="text-lime-400 hover:text-lime-300">Terms of Service</Link>
                                {' '}and{' '}
                                <Link to="#" className="text-lime-400 hover:text-lime-300">Privacy Policy</Link>
                            </label>
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20"
                            >
                                {error}
                            </motion.p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-lime-400 px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-lime-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-neutral-400 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-lime-400 hover:text-lime-300 font-medium">Sign in</Link>
                </p>
            </motion.div>
        </div>
    )
}
