import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/services/api'

const navigation = [
    { name: 'Home', href: '/' },
]

interface NavbarProps {
    theme?: 'light' | 'dark'
}

export function Navbar({ theme = 'light' }: NavbarProps = {}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const location = useLocation()
    const currentUser = api.auth.getCurrentUser()

    const isActive = (href: string) => {
        if (href === '/') return location.pathname === '/'
        return location.pathname.startsWith(href)
    }

    const isDark = theme === 'dark'

    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-50",
            isDark
                ? "bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800"
                : "glass border-b border-neutral-200/50"
        )}>
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-xl shadow-md transition-transform group-hover:scale-105",
                                isDark ? "bg-lime-400" : "bg-gradient-to-br from-primary-500 to-accent-600"
                            )}>
                                <Shield className={cn("h-5 w-5", isDark ? "text-neutral-900" : "text-white")} />
                            </div>
                            <span className={cn(
                                "font-display text-xl font-bold",
                                isDark ? "text-white" : "text-neutral-900"
                            )}>
                                Rent<span className={isDark ? "text-lime-400" : "text-primary-600"}>Shield</span>
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
                                    isDark
                                        ? isActive(item.href)
                                            ? 'text-lime-400'
                                            : 'text-neutral-300 hover:text-white'
                                        : isActive(item.href)
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
                                <button
                                    onClick={() => {
                                        api.auth.logout()
                                        window.location.href = '/'
                                    }}
                                    className={cn(
                                        "text-sm py-2 px-4 rounded-lg font-medium transition-colors",
                                        isDark
                                            ? "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white border border-neutral-700"
                                            : "btn-secondary"
                                    )}
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className={cn(
                                        "text-sm font-semibold transition-colors",
                                        isDark
                                            ? "text-neutral-300 hover:text-white"
                                            : "text-neutral-700 hover:text-neutral-900"
                                    )}
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/tenant/report"
                                    className={cn(
                                        "text-sm py-2.5 px-5 rounded-lg font-semibold transition-colors",
                                        isDark
                                            ? "bg-lime-400 text-neutral-900 hover:bg-lime-300"
                                            : "btn-primary"
                                    )}
                                >
                                    Report Issue
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex md:hidden">
                        <button
                            type="button"
                            className={cn(
                                "inline-flex items-center justify-center rounded-lg p-2 transition-colors",
                                isDark
                                    ? "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                            )}
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
                                            isDark
                                                ? isActive(item.href)
                                                    ? 'bg-lime-400/10 text-lime-400 border border-lime-400/20'
                                                    : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                                                : isActive(item.href)
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
                                            <button
                                                onClick={() => {
                                                    api.auth.logout()
                                                    setMobileMenuOpen(false)
                                                    window.location.href = '/'
                                                }}
                                                className={cn(
                                                    "w-full rounded-lg py-2 px-4 font-medium transition-colors",
                                                    isDark
                                                        ? "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white border border-neutral-700"
                                                        : "btn-secondary"
                                                )}
                                            >
                                                Sign Out
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                to="/login"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className={cn(
                                                    "w-full text-center rounded-lg py-2 px-4 font-medium transition-colors",
                                                    isDark
                                                        ? "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white border border-neutral-700"
                                                        : "btn-secondary"
                                                )}
                                            >
                                                Sign In
                                            </Link>
                                            <Link
                                                to="/tenant/report"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className={cn(
                                                    "w-full text-center rounded-lg py-2 px-4 font-semibold transition-colors",
                                                    isDark
                                                        ? "bg-lime-400 text-neutral-900 hover:bg-lime-300"
                                                        : "btn-primary"
                                                )}
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
