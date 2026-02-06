import { useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FloatingNav } from '@/components/ui/floating-navbar'
import { ThreeDMarquee } from '@/components/ui/3d-marquee'
import { Link } from 'react-router-dom'
import {
    Shield,
    ArrowRight,
    ChevronDown,
    Check,
    Play,
    Users,
    Home,
    MessageCircle,
    User,
    Lock,
    FileCheck,
    BarChart3,
    Medal,
    Gavel
} from 'lucide-react'
import AnimatedShaderBackground from '@/components/ui/animated-shader-background'
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect'
import { ContainerScroll } from '@/components/ui/container-scroll-animation'
import { HousingHeatmap } from '@/components/ui/housing-heatmap'

const heroWords = [
    { text: "Resolve" },
    { text: "Housing" },
    { text: "Disputes" },
    { text: "With", newLine: true },
    { text: "Confidence.", className: "text-lime-400" },
]

const navItems = [
    { label: "Features", hasDropdown: true },
    { label: "How it Works", hasDropdown: false },
    { label: "Community", hasDropdown: false },
    { label: "Resources", hasDropdown: true },
]



const featureCards = [
    {
        title: "Anonymous Reporting",
        description: "Report issues without revealing your identity. Your privacy is protected by design.",
        icon: <Lock className="w-6 h-6 text-lime-400" />
    },
    {
        title: "AI Verification",
        description: "Advanced image analysis detects tampering and verifies evidence authenticity.",
        icon: <FileCheck className="w-6 h-6 text-lime-400" />
    },
    {
        title: "DAO Arbitration",
        description: "Decentralized jury of verified community members ensures fair dispute resolution.",
        icon: <Users className="w-6 h-6 text-lime-400" />
    },
    {
        title: "Community Heatmaps",
        description: "View issue density across neighborhoods to make informed housing decisions.",
        icon: <BarChart3 className="w-6 h-6 text-lime-400" />
    },
    {
        title: "Landlord Ratings",
        description: "Aggregated reputation scores help tenants avoid problematic properties.",
        icon: <Medal className="w-6 h-6 text-lime-400" />
    },
    {
        title: "Transparent Verdicts",
        description: "All decisions are recorded on-chain for complete transparency and accountability.",
        icon: <Gavel className="w-6 h-6 text-lime-400" />
    }
]

const floatingNavItems = [
    { name: "Home", link: "/", icon: <Home className="h-4 w-4 text-neutral-500 dark:text-white" /> },
    { name: "About", link: "/about", icon: <User className="h-4 w-4 text-neutral-500 dark:text-white" /> },
    { name: "Contact", link: "/contact", icon: <MessageCircle className="h-4 w-4 text-neutral-500 dark:text-white" /> },
]



export function LandingPage() {
    const [email, setEmail] = useState('')
    const { scrollY } = useScroll();

    // Hide main navbar when scrolling down (opacity 0 when scrollY > 100)
    const navbarOpacity = useTransform(scrollY, [0, 100], [1, 0]);
    const navbarPointerEvents = useTransform(scrollY, [0, 100], ['auto', 'none']);

    return (
        <div className="min-h-screen bg-neutral-900 relative">
            {/* Full Page Aurora Background */}
            <div className="fixed inset-0 z-0">
                <AnimatedShaderBackground />
            </div>

            {/* Floating Navbar */}
            <FloatingNav navItems={floatingNavItems} />

            {/* Main Navbar */}
            <motion.nav
                style={{ opacity: navbarOpacity, pointerEvents: navbarPointerEvents as any }}
                className="fixed top-0 left-0 right-0 z-50 bg-neutral-900/80 backdrop-blur-md"
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-400">
                                <Shield className="h-5 w-5 text-neutral-900" />
                            </div>
                            <span className="font-display text-xl font-bold text-white">
                                RentShield
                            </span>
                        </Link>

                        {/* Nav Links */}
                        <div className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => (
                                <button
                                    key={item.label}
                                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
                                >
                                    {item.label}
                                    {item.hasDropdown && <ChevronDown className="h-4 w-4" />}
                                </button>
                            ))}
                        </div>

                        {/* Auth Buttons */}
                        <div className="flex items-center gap-3">
                            <Link
                                to="/login"
                                className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
                            >
                                Log in
                            </Link>
                            <Link
                                to="/signup"
                                className="inline-flex items-center gap-2 rounded-lg bg-lime-400 px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-lime-300 transition-colors"
                            >
                                Sign Up Free
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Announcement Banner */}
            <div className="pt-16 bg-lime-100">
                <div className="py-2 text-center text-sm">
                    <span className="text-neutral-600">
                        Introducing AI Evidence Analysis: verify photos instantly.{' '}
                    </span>
                    <Link to="#" className="font-medium text-violet-600 hover:text-violet-700">
                        Learn more →
                    </Link>
                </div>
            </div>

            {/* Hero Section */}
            <section className="relative z-10 overflow-hidden min-h-[40vh] flex items-center pt-8 pb-0">
                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center flex flex-col items-center">
                        <TypewriterEffectSmooth
                            words={heroWords}
                            className="font-display"
                        />

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="mx-auto mt-6 max-w-2xl text-lg text-violet-200"
                        >
                            AI-powered dispute resolution, transparent DAO governance, and identity protection—all with one simple platform.
                        </motion.p>

                        {/* Email CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
                        >
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Work email"
                                className="w-full sm:w-80 px-5 py-3 rounded-lg border border-violet-600 bg-violet-800/50 text-white placeholder-violet-300 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                            />
                            <Link
                                to="/signup"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-lime-400 px-6 py-3 text-sm font-semibold text-neutral-900 hover:bg-lime-300 transition-colors"
                            >
                                Start my trial
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </motion.div>

                        {/* Trust Indicators */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mt-8 flex items-center justify-center gap-6 text-sm text-violet-300"
                        >
                            <span className="flex items-center gap-1">
                                <Check className="h-4 w-4 text-lime-400" />
                                No credit card required
                            </span>
                            <span className="flex items-center gap-1">
                                <Check className="h-4 w-4 text-lime-400" />
                                Free forever plan
                            </span>
                            <span className="flex items-center gap-1">
                                <Check className="h-4 w-4 text-lime-400" />
                                Privacy protected
                            </span>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Housing Heatmap Section with Scroll Animation */}
            <section className="relative z-10 -mt-24">
                <ContainerScroll
                    titleComponent={
                        <>
                            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
                                Explore Housing Issues in Your Area
                            </h2>
                            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
                                Our interactive heatmap shows real-time housing issues reported across neighborhoods.
                                <span className="text-lime-400 font-medium"> Make informed decisions</span> before you rent.
                            </p>
                        </>
                    }
                >
                    <HousingHeatmap />
                </ContainerScroll>
            </section>

            {/* Features Section with 3D Marquee */}
            <section className="relative z-10 pt-0 pb-20 -mt-20 overflow-hidden">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        How RentShield <span className="text-lime-400">Protects You</span>
                    </h2>
                    <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
                        A comprehensive platform designed to level the playing field between tenants and landlords.
                    </p>
                </div>

                <ThreeDMarquee items={featureCards.map((card, idx) => (
                    <div key={idx} className="group/card bg-neutral-900/50 backdrop-blur-md border border-neutral-800 p-6 rounded-xl flex flex-col gap-4 hover:border-lime-500/50 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-lime-500/10 hover:bg-neutral-800/80 cursor-pointer h-full relative hover:z-20 group-hover/strip:blur-[2px] group-hover/strip:opacity-40 hover:!blur-none hover:!opacity-100">
                        <div className="w-12 h-12 rounded-lg bg-lime-500/10 flex items-center justify-center group-hover/card:bg-lime-500/20 transition-all duration-300">
                            <div className="text-lime-400 transition-colors">
                                {card.icon}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-2 text-lg">{card.title}</h3>
                            <p className="text-sm text-neutral-400 leading-relaxed">{card.description}</p>
                        </div>
                    </div>
                ))} />
            </section>

            {/* Video Section */}
            <section className="relative z-10 py-20 bg-transparent">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
                                See RentShield in action
                            </h2>
                            <p className="text-lg text-neutral-400 mb-8">
                                Watch how tenants report issues, AI analyzes evidence, and disputes get resolved fairly through our DAO governance system.
                            </p>
                            <ul className="space-y-4">
                                {['Report issues in minutes', 'AI provides instant analysis', 'Transparent voting process', 'Fair resolutions for all'].map((item) => (
                                    <li key={item} className="flex items-center gap-3 text-neutral-300">
                                        <div className="h-5 w-5 rounded-full bg-lime-400/20 flex items-center justify-center">
                                            <Check className="h-3 w-3 text-lime-400" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative">
                            <div className="aspect-video rounded-2xl bg-neutral-800/80 backdrop-blur-sm border border-neutral-700 flex items-center justify-center overflow-hidden">
                                <button className="h-20 w-20 rounded-full bg-lime-400 flex items-center justify-center hover:bg-lime-300 transition-colors">
                                    <Play className="h-8 w-8 text-neutral-900 ml-1" />
                                </button>
                            </div>
                            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-violet-600/20 to-lime-400/20 -z-10 blur-2xl" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="relative z-10 py-20 bg-transparent">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-neutral-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 text-center shadow-2xl">
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
                            Ready to resolve disputes fairly?
                        </h2>
                        <p className="text-lg text-neutral-300 mb-8 max-w-2xl mx-auto">
                            Join thousands of tenants, landlords, and community members building a fairer housing future.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/signup"
                                className="inline-flex items-center gap-2 rounded-lg bg-lime-400 px-8 py-4 text-base font-semibold text-neutral-900 hover:bg-lime-300 transition-colors"
                            >
                                Get Started Free
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                            <Link
                                to="#"
                                className="inline-flex items-center gap-2 rounded-lg border border-neutral-600 px-8 py-4 text-base font-semibold text-white hover:bg-neutral-800 hover:border-neutral-500 transition-all bg-black/20"
                            >
                                <Users className="h-5 w-5" />
                                Talk to Sales
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 bg-black/40 backdrop-blur-md border-t border-white/10 py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-400">
                                <Shield className="h-5 w-5 text-neutral-900" />
                            </div>
                            <span className="font-display text-xl font-bold text-white">
                                RentShield
                            </span>
                        </div>
                        <div className="flex items-center gap-8 text-sm text-neutral-400">
                            <Link to="#" className="hover:text-white transition-colors">Privacy</Link>
                            <Link to="#" className="hover:text-white transition-colors">Terms</Link>
                            <Link to="#" className="hover:text-white transition-colors">Contact</Link>
                        </div>
                        <p className="text-sm text-neutral-500">
                            © 2026 RentShield. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
