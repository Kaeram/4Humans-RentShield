import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { IconBrandGoogle, IconBrandApple, IconBrandFacebook } from '@tabler/icons-react'
import { api } from '@/services/api'
import { UserRole } from '@/types'
import AnimatedShaderBackground from '@/components/ui/animated-shader-background'


export function LoginPage() {
    const navigate = useNavigate()
    const [selectedRole] = useState<UserRole>('tenant')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            await api.auth.login(email, password, selectedRole)
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
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Full Page Aurora Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <AnimatedShaderBackground />
            </div>

            <div className="relative z-10 w-full max-w-[440px] bg-white rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] p-10 sm:p-12 overflow-hidden">



                {/* Title */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                        Sign in to RentShield
                    </h1>
                    <p className="text-neutral-500 text-sm px-4">
                        Manage your rental agreements and disputes securely and fairly.
                    </p>
                </div>



                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-neutral-400 group-focus-within:text-neutral-600 transition-colors" />
                        </div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-12 pr-4 py-3.5 bg-neutral-100 hover:bg-neutral-200/50 focus:bg-neutral-200/50 border-none rounded-xl text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-0 transition-all font-medium"
                            placeholder="Email"
                            required
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-neutral-400 group-focus-within:text-neutral-600 transition-colors" />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-12 pr-12 py-3.5 bg-neutral-100 hover:bg-neutral-200/50 focus:bg-neutral-200/50 border-none rounded-xl text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-0 transition-all font-medium"
                            placeholder="Password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors focus:outline-none"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>

                    <div className="flex justify-end">
                        <Link to="#" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
                            Forgot password?
                        </Link>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-neutral-900 text-white font-semibold rounded-xl shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:bg-black hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            "Get Started"
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-neutral-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-wider font-semibold">
                        <span className="bg-white px-2 text-neutral-400">Or sign in with</span>
                    </div>
                </div>

                {/* Social Logins */}
                <div className="grid grid-cols-3 gap-4">
                    <button className="flex items-center justify-center py-2.5 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all shadow-sm">
                        <IconBrandGoogle className="h-5 w-5 text-neutral-700" />
                    </button>
                    <button className="flex items-center justify-center py-2.5 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all shadow-sm">
                        <IconBrandFacebook className="h-5 w-5 text-neutral-700" />
                    </button>
                    <button className="flex items-center justify-center py-2.5 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all shadow-sm">
                        <IconBrandApple className="h-5 w-5 text-neutral-900" />
                    </button>
                </div>

                {/* Footer text */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-neutral-500">
                        Don't have an account? <Link to="/signup" className="text-neutral-900 font-medium hover:underline">Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
