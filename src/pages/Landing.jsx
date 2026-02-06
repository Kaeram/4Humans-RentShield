import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Shield, Eye, Users, Gavel, AlertTriangle, BarChart3,
    ArrowRight, CheckCircle, Lock, FileCheck, Vote, Award
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'

const stats = [
    { value: '73%', label: 'of tenants fear landlord retaliation', icon: AlertTriangle },
    { value: '2.3M', label: 'tenant disputes annually in India', icon: BarChart3 },
    { value: '45%', label: 'give up on valid claims', icon: Users },
    { value: '89%', label: 'prefer anonymous reporting', icon: Lock },
]

const features = [
    {
        icon: Lock,
        title: 'Anonymous Reporting',
        description: 'Report issues without revealing your identity. Your privacy is protected by design.'
    },
    {
        icon: FileCheck,
        title: 'AI Verification',
        description: 'Advanced image analysis detects tampering and verifies evidence authenticity.'
    },
    {
        icon: Vote,
        title: 'DAO Arbitration',
        description: 'Decentralized jury of verified community members ensures fair dispute resolution.'
    },
    {
        icon: BarChart3,
        title: 'Community Heatmaps',
        description: 'View issue density across neighborhoods to make informed housing decisions.'
    },
    {
        icon: Award,
        title: 'Landlord Ratings',
        description: 'Aggregated reputation scores help tenants avoid problematic properties.'
    },
    {
        icon: Gavel,
        title: 'Transparent Verdicts',
        description: 'All decisions are recorded on-chain for complete transparency and accountability.'
    }
]

const timeline = [
    {
        step: 1,
        title: 'Report Anonymously',
        description: 'Submit your issue with evidence. Your identity remains completely protected.',
        icon: Eye
    },
    {
        step: 2,
        title: 'AI Verification',
        description: 'Our AI analyzes evidence for authenticity and categorizes the issue.',
        icon: FileCheck
    },
    {
        step: 3,
        title: 'DAO Review',
        description: 'Community jurors review the case and cast their votes.',
        icon: Users
    },
    {
        step: 4,
        title: 'Fair Resolution',
        description: 'Verdict is recorded and landlord reputation is updated accordingly.',
        icon: CheckCircle
    }
]

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
}

export default function Landing() {
    return (
        <div className="relative">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 lg:py-32">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

                <div className="container mx-auto px-4 relative">
                    <motion.div
                        className="max-w-4xl mx-auto text-center"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6"
                        >
                            <Shield className="w-4 h-4" />
                            Protecting Tenant Rights
                        </motion.div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
                            Report{' '}
                            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                Anonymously.
                            </span>
                            <br />
                            Resolve{' '}
                            <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                                Fairly.
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                            The first decentralized platform where tenants can report housing issues anonymously
                            and have disputes resolved fairly through AI verification and community governance.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild size="lg" className="gap-2 text-lg px-8 h-14">
                                <Link to="/report">
                                    Report an Issue
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="text-lg px-8 h-14">
                                <Link to="/dashboard">
                                    View Dashboard
                                </Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-muted/30">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-4 gap-6"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {stats.map((stat, index) => (
                            <motion.div key={index} variants={itemVariants}>
                                <Card className="text-center p-6 bg-background hover:shadow-lg transition-shadow">
                                    <CardContent className="p-0">
                                        <stat.icon className="w-8 h-8 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
                                        <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                                            {stat.value}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {stat.label}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            How RentShield Protects You
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            A comprehensive platform designed to level the playing field between tenants and landlords.
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {features.map((feature, index) => (
                            <motion.div key={index} variants={itemVariants}>
                                <Card className="h-full p-6 hover:shadow-lg transition-all hover:border-blue-200 dark:hover:border-blue-800 group">
                                    <CardContent className="p-0">
                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <feature.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                        <p className="text-muted-foreground">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* How It Works Timeline */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            How It Works
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            From reporting to resolution in four simple steps.
                        </p>
                    </motion.div>

                    <div className="max-w-4xl mx-auto">
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-cyan-500 hidden md:block" />

                            {timeline.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.2 }}
                                    className={`relative flex items-center gap-8 mb-12 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                                        }`}
                                >
                                    {/* Content */}
                                    <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                                        <Card className="p-6 inline-block">
                                            <CardContent className="p-0">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                        <item.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <span className="text-sm font-medium text-muted-foreground">
                                                        Step {item.step}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                                                <p className="text-muted-foreground">{item.description}</p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Circle indicator */}
                                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 items-center justify-center text-white font-bold text-sm shadow-lg">
                                        {item.step}
                                    </div>

                                    {/* Spacer */}
                                    <div className="flex-1 hidden md:block" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 p-12 md:p-16 text-center text-white"
                    >
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

                        <div className="relative">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">
                                Ready to Protect Your Rights?
                            </h2>
                            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10">
                                Join thousands of tenants who are standing up for fair housing.
                                Your voice matters, and your identity is protected.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button asChild size="lg" variant="secondary" className="gap-2 text-lg px-8 h-14">
                                    <Link to="/report">
                                        Report an Issue
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </Button>
                                <Button asChild size="lg" variant="outline" className="text-lg px-8 h-14 bg-transparent border-white text-white hover:bg-white/10">
                                    <Link to="/heatmap">
                                        Explore Heatmap
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
