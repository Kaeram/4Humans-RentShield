import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Sun, Moon, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Button } from '../ui/button'

const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/report', label: 'Report Issue' },
    { path: '/heatmap', label: 'Heatmap' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/dao', label: 'DAO Panel' },
]

export default function Navbar() {
    const { theme, toggleTheme } = useApp()
    const location = useLocation()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <motion.div
                            whileHover={{ rotate: 10 }}
                            className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700"
                        >
                            <Shield className="w-6 h-6 text-white" />
                        </motion.div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                            RentShield
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === link.path
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right side actions */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            className="rounded-full"
                        >
                            {theme === 'light' ? (
                                <Moon className="h-5 w-5" />
                            ) : (
                                <Sun className="h-5 w-5" />
                            )}
                        </Button>

                        {/* Mobile menu button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <motion.nav
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="md:hidden py-4 border-t"
                    >
                        <div className="flex flex-col gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === link.path
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </motion.nav>
                )}
            </div>
        </header>
    )
}
