import { Link } from 'react-router-dom'
import { Shield, Mail, MapPin, Twitter, Github, Linkedin } from 'lucide-react'

const footerLinks = {
    product: [
        { name: 'How It Works', href: '/#how-it-works' },
        { name: 'For Tenants', href: '/tenant/dashboard' },
        { name: 'For Landlords', href: '/landlord/dashboard' },
        { name: 'DAO Governance', href: '/dao/dashboard' },
    ],
    resources: [
        { name: 'FAQ', href: '/#faq' },
        { name: 'Documentation', href: '#' },
        { name: 'API Reference', href: '#' },
        { name: 'Community', href: '#' },
    ],
    legal: [
        { name: 'Privacy Policy', href: '#' },
        { name: 'Terms of Service', href: '#' },
        { name: 'Cookie Policy', href: '#' },
    ],
}

const socialLinks = [
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'GitHub', href: '#', icon: Github },
    { name: 'LinkedIn', href: '#', icon: Linkedin },
]

export function Footer() {
    return (
        <footer className="bg-neutral-900 text-neutral-300">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    {/* Brand */}
                    <div className="space-y-8 xl:col-span-1">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-600">
                                <Shield className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-display text-xl font-bold text-white">
                                Rent<span className="text-primary-400">Shield</span>
                            </span>
                        </Link>
                        <p className="text-sm text-neutral-400 max-w-xs">
                            AI-powered tenant protection with community-driven justice.
                            Making housing disputes transparent, verified, and fair.
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-neutral-500" />
                                <a href="mailto:support@rentshield.io" className="hover:text-white transition-colors">
                                    support@rentshield.io
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-neutral-500" />
                            <span>San Francisco, CA</span>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                                    Product
                                </h3>
                                <ul role="list" className="mt-4 space-y-3">
                                    {footerLinks.product.map((item) => (
                                        <li key={item.name}>
                                            <Link
                                                to={item.href}
                                                className="text-sm hover:text-white transition-colors"
                                            >
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-10 md:mt-0">
                                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                                    Resources
                                </h3>
                                <ul role="list" className="mt-4 space-y-3">
                                    {footerLinks.resources.map((item) => (
                                        <li key={item.name}>
                                            <Link
                                                to={item.href}
                                                className="text-sm hover:text-white transition-colors"
                                            >
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                                    Legal
                                </h3>
                                <ul role="list" className="mt-4 space-y-3">
                                    {footerLinks.legal.map((item) => (
                                        <li key={item.name}>
                                            <Link
                                                to={item.href}
                                                className="text-sm hover:text-white transition-colors"
                                            >
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-10 md:mt-0">
                                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                                    Connect
                                </h3>
                                <div className="mt-4 flex gap-4">
                                    {socialLinks.map((item) => (
                                        <a
                                            key={item.name}
                                            href={item.href}
                                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
                                        >
                                            <span className="sr-only">{item.name}</span>
                                            <item.icon className="h-5 w-5" aria-hidden="true" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 border-t border-neutral-800 pt-8">
                    <p className="text-sm text-neutral-500 text-center">
                        &copy; {new Date().getFullYear()} RentShield. All rights reserved.
                        Built with transparency and trust in mind.
                    </p>
                </div>
            </div>
        </footer>
    )
}
