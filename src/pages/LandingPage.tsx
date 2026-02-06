import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
    Shield,
    ArrowRight,
    ChevronDown,
    Check,
    Star,
    Users,
    Bot,
    Scale,
    MapPin,
    Play
} from 'lucide-react'
import AnimatedShaderBackground from '@/components/ui/animated-shader-background'
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect'
import { ContainerScroll } from '@/components/ui/container-scroll-animation'
import { HousingHeatmap } from '@/components/ui/housing-heatmap'

const heroWords = [
    { text: "Resolve" },
    { text: "Housing" },
    { text: "Disputes", newLine: true },
    { text: "With", className: "text-lime-400" },
    { text: "Confidence", className: "text-lime-400" },
]

const navItems = [
    { label: 'Platform', hasDropdown: true },
    { label: 'Solutions', hasDropdown: true },
    { label: 'Resources', hasDropdown: true },
    { label: 'Pricing', hasDropdown: false },
]

const features = [
    {
        icon: Bot,
        title: 'AI-Powered Verdicts',
        description: 'Our AI analyzes evidence, photos, and documentation to provide unbiased assessments of tenant-landlord disputes.',
    },
    {
        icon: Scale,
        title: 'DAO Governance',
        description: 'Community jurors review escalated cases through blind voting, ensuring fair and transparent decisions.',
    },
    {
        icon: Shield,
        title: 'Identity Protection',
        description: 'Tenant identities are fully protected. Report issues without fear of retaliation.',
    },
    {
        icon: MapPin,
        title: 'Housing Heatmaps',
        description: 'Visualize issue density across neighborhoods to make informed housing decisions.',
    },
]

const stats = [
    { value: '10,000+', label: 'Issues Resolved' },
    { value: '95%', label: 'User Satisfaction' },
    { value: '48hrs', label: 'Average Resolution' },
    { value: '500+', label: 'DAO Members' },
]

const testimonials = [
    {
        quote: "RentShield helped me document and resolve a mold issue that my landlord had ignored for months. The AI analysis was spot-on.",
        author: "Sarah M.",
        role: "Tenant, San Francisco",
        avatar: "SM",
    },
    {
        quote: "As a landlord, I appreciate the transparency. It helps me address issues quickly and maintain a good reputation.",
        author: "David L.",
        role: "Property Owner",
        avatar: "DL",
    },
    {
        quote: "The DAO voting system is genius. It ensures fair outcomes without bias from either party.",
        author: "Michael R.",
        role: "DAO Member",
        avatar: "MR",
    },
]

export function LandingPage() {
    const [email, setEmail] = useState('')

    return (
        <div className="min-h-screen bg-neutral-900 relative">
            {/* Full Page Aurora Background */}
            <div className="fixed inset-0 z-0">
                <AnimatedShaderBackground />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-900/80 backdrop-blur-md">
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
                                to="/login"
                                className="inline-flex items-center gap-2 rounded-lg bg-lime-400 px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-lime-300 transition-colors"
                            >
                                Sign Up Free
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

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
            <section className="relative z-10 overflow-hidden min-h-[70vh] flex items-center pt-16">
                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
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
                                to="/login"
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
            <section className="relative z-10">
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

            {/* Stats Section */}
            <section className="relative z-10 py-16 bg-neutral-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="text-center"
                            >
                                <p className="font-display text-3xl md:text-4xl font-bold text-violet-600">
                                    {stat.value}
                                </p>
                                <p className="mt-1 text-sm text-neutral-600">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative z-10 py-20 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900">
                            Everything you need for fair housing
                        </h2>
                        <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
                            From AI-powered evidence analysis to decentralized dispute resolution, we've got you covered.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-6 rounded-2xl bg-white border border-neutral-200 hover:border-violet-300 hover:shadow-lg transition-all"
                            >
                                <div className="h-12 w-12 rounded-xl bg-violet-100 flex items-center justify-center mb-4">
                                    <feature.icon className="h-6 w-6 text-violet-600" />
                                </div>
                                <h3 className="font-display text-lg font-semibold text-neutral-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-neutral-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Video Section */}
            <section className="relative z-10 py-20 bg-neutral-900">
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
                            <div className="aspect-video rounded-2xl bg-neutral-800 flex items-center justify-center overflow-hidden">
                                <button className="h-20 w-20 rounded-full bg-lime-400 flex items-center justify-center hover:bg-lime-300 transition-colors">
                                    <Play className="h-8 w-8 text-neutral-900 ml-1" />
                                </button>
                            </div>
                            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-violet-600/20 to-lime-400/20 -z-10 blur-2xl" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="relative z-10 py-20 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900">
                            Trusted by thousands
                        </h2>
                        <p className="mt-4 text-lg text-neutral-600">
                            Join the community making housing fair for everyone.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, idx) => (
                            <motion.div
                                key={testimonial.author}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-6 rounded-2xl bg-violet-50 border border-violet-100"
                            >
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-neutral-700 mb-6">"{testimonial.quote}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-violet-200 flex items-center justify-center text-sm font-medium text-violet-700">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <p className="font-medium text-neutral-900">{testimonial.author}</p>
                                        <p className="text-sm text-neutral-500">{testimonial.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="relative z-10 py-20 bg-gradient-to-br from-violet-900 to-violet-800">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
                        Ready to resolve disputes fairly?
                    </h2>
                    <p className="text-lg text-violet-200 mb-8 max-w-2xl mx-auto">
                        Join thousands of tenants, landlords, and community members building a fairer housing future.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 rounded-lg bg-lime-400 px-8 py-4 text-base font-semibold text-neutral-900 hover:bg-lime-300 transition-colors"
                        >
                            Get Started Free
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                        <Link
                            to="#"
                            className="inline-flex items-center gap-2 rounded-lg border border-violet-500 px-8 py-4 text-base font-semibold text-white hover:bg-violet-800 transition-colors"
                        >
                            <Users className="h-5 w-5" />
                            Talk to Sales
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 bg-neutral-900 py-12">
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
