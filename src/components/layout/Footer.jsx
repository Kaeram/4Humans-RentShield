import { Link } from 'react-router-dom'
import { Shield, Github, Twitter } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="border-t bg-muted/30">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold">RentShield</span>
                        </div>
                        <p className="text-muted-foreground text-sm max-w-md">
                            Empowering tenants with anonymous reporting and fair dispute resolution through decentralized governance.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="/report" className="hover:text-foreground transition-colors">Report Issue</Link></li>
                            <li><Link to="/heatmap" className="hover:text-foreground transition-colors">Community Heatmap</Link></li>
                            <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Issues Dashboard</Link></li>
                            <li><Link to="/dao" className="hover:text-foreground transition-colors">DAO Arbitration</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-semibold mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">Tenant Rights</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
                            <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="flex flex-col md:flex-row items-center justify-between mt-12 pt-8 border-t gap-4">
                    <p className="text-sm text-muted-foreground">
                        © 2026 RentShield. Built for fair housing.
                    </p>
                    <div className="flex items-center gap-4">
                        <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                            <Github className="w-5 h-5" />
                        </a>
                        <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                            <Twitter className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
