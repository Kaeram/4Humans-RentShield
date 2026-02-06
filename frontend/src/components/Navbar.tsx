import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Shield, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/services/api'

const navigation = [
    { name: 'Home', href: '/' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'FAQ', href: '/#faq' },
]

const dashboardLinks = {
    tenant: '/tenant/dashboard',
    landlord: '/landlord/dashboard',
    dao: '/dao/dashboard',
}

export function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const location = useLocation()
    const currentUser = api.auth.getCurrentUser()

    const isActive = (href: string) => {
        if (href === '/') return location.pathname === '/'
        return location.pathname.startsWith(href)
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-neutral-200/50">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 shadow-md transition-transform group-hover:scale-105">
                                <Shield className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-display text-xl font-bold text-neutral-900">
                                Rent<span className="text-primary-600">Shield</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:gap-8">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    'text-sm font-medium transition-colors duration-200',
                                    isActive(item.href)
                                        ? 'text-primary-600'
                                        : 'text-neutral-600 hover:text-neutral-900'
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side - Auth/Dashboard */}
                    <div className="hidden md:flex md:items-center md:gap-4">
                        {currentUser ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    to={dashboardLinks[currentUser.role]}
                                    className="flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-900"
                                >
                                    Dashboard
                                    <ChevronDown className="h-4 w-4" />
                                </Link>
                                <button
                                    onClick={() => {
                                        api.auth.logout()
                                        window.location.href = '/'
                                    }}
                                    className="btn-secondary text-sm py-2 px-4"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-sm font-semibold text-neutral-700 hover:text-neutral-900 transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link to="/tenant/report" className="btn-primary text-sm py-2.5 px-5">
                                    Report Issue
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex md:hidden">
                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <span className="sr-only">Open main menu</span>
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden overflow-hidden"
                        >
                            <div className="space-y-1 pb-4 pt-2">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                            'block rounded-lg px-3 py-2 text-base font-medium transition-colors',
                                            isActive(item.href)
                                                ? 'bg-primary-50 text-primary-600'
                                                : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
                                        )}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                                <div className="mt-4 flex flex-col gap-2 px-3">
                                    {currentUser ? (
                                        <>
                                            <Link
                                                to={dashboardLinks[currentUser.role]}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="btn-secondary w-full text-center"
                                            >
                                                Dashboard
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    api.auth.logout()
                                                    setMobileMenuOpen(false)
                                                    window.location.href = '/'
                                                }}
                                                className="btn-secondary w-full"
                                            >
                                                Sign Out
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                to="/login"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="btn-secondary w-full text-center"
                                            >
                                                Sign In
                                            </Link>
                                            <Link
                                                to="/tenant/report"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="btn-primary w-full text-center"
                                            >
                                                Report Issue
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </header>
    )
}
