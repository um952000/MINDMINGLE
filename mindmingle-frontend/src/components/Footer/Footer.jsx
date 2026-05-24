// src/components/Footer/Footer.jsx
import { Link } from 'react-router-dom'
import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-10">

                {/* Top section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

                    {/* Brand */}
                    <div className="md:col-span-2">
                        <h2 className="text-xl font-black text-white tracking-tight mb-2">
                            Mind Mingle
                        </h2>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                            A social learning platform where students solve doubts, get AI assistance, and connect with 1-on-1 mentors and much more.
                        </p>
                        {/* Social links */}
                        <div className="flex gap-3 mt-4">
                            <a href="https://github.com" target="_blank" rel="noreferrer"
                                className="w-8 h-8 bg-gray-800 hover:bg-violet-500/20 border border-gray-700 hover:border-violet-500/40 rounded-lg flex items-center justify-center text-slate-400 hover:text-violet-400 transition-all">
                                <Github size={14} />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noreferrer"
                                className="w-8 h-8 bg-gray-800 hover:bg-violet-500/20 border border-gray-700 hover:border-violet-500/40 rounded-lg flex items-center justify-center text-slate-400 hover:text-violet-400 transition-all">
                                <Twitter size={14} />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noreferrer"
                                className="w-8 h-8 bg-gray-800 hover:bg-violet-500/20 border border-gray-700 hover:border-violet-500/40 rounded-lg flex items-center justify-center text-slate-400 hover:text-violet-400 transition-all">
                                <Linkedin size={14} />
                            </a>
                            <a href="mailto:contact@mindmingle.com"
                                className="w-8 h-8 bg-gray-800 hover:bg-violet-500/20 border border-gray-700 hover:border-violet-500/40 rounded-lg flex items-center justify-center text-slate-400 hover:text-violet-400 transition-all">
                                <Mail size={14} />
                            </a>
                        </div>
                    </div>

                    {/* Platform links */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                            Platform
                        </h3>
                        <ul className="space-y-2.5">
                            {[
                                { label: 'Home', to: '/' },
                                { label: 'Ask a Doubt', to: '/ask' },
                                { label: 'Leaderboard', to: '/leaderboard' },
                                { label: 'Profile', to: '/profile' },
                            ].map(link => (
                                <li key={link.to}>
                                    <Link to={link.to}
                                        className="text-slate-400 hover:text-violet-400 text-sm transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company links */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                            Company
                        </h3>
                        <ul className="space-y-2.5">
                            {[
                                { label: 'About', to: '/about' },
                                { label: 'Blog', to: '/blog' },
                                { label: 'Privacy', to: '/privacy' },
                                { label: 'Terms', to: '/terms' },
                                { label: 'Contact', to: '/contact' },
                            ].map(link => (
                                <li key={link.to}>
                                    <Link to={link.to}
                                        className="text-slate-400 hover:text-violet-400 text-sm transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Coming soon banner */}
                <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl px-5 py-3 mb-8 flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <span className="text-violet-400 font-semibold text-sm">Coming soon</span>
                        <span className="text-slate-500 text-sm ml-2">
                            Live chat · 1-on-1 mentoring · AI assistant · Premium membership
                        </span>
                    </div>
                    <Link to="/register"
                        className="text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white px-4 py-1.5 rounded-lg transition-all">
                        Join waitlist
                    </Link>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-gray-800 pt-4 flex items-center justify-center gap-2">
                    <span className="text-slate-500 text-sm">
                        &copy; {currentYear} Mind Mingle. All rights reserved.
                    </span>
                    <Heart size={14} className="text-red-500" />
                </div>
            </div>
        </footer>
    )
}