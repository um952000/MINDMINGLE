import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { User, Search, Bell, LogOut, ChevronDown, Settings, UserCircle, Users, MessageCircle, Home, X, Menu } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.jsx'

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
    const { user, logout, isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [search, setSearch] = useState('')
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        setSearch(params.get('search') || '')
    }, [location.search])

    const handleSearch = (value) => {
        setSearch(value)
        const params = new URLSearchParams()
        if (value.trim()) params.set('search', value.trim())
        // always navigate to home when searching
        navigate(`/?${params.toString()}`)
    }

    const handleLogout = () => {
        setDropdownOpen(false)
        logout()
        navigate('/')
    }

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <>
            <nav className="bg-gray-950 border-b border-gray-800 relative z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">

                        <div className="flex items-center gap-3">
                            {/* ✅ Sidebar toggle button */}
                            {isAuthenticated && (
                                <button
                                    onClick={() => setSidebarOpen(o => !o)}
                                    className="p-2 hover:bg-gray-800 rounded-xl transition-colors text-gray-400 hover:text-white"
                                >
                                    {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                                </button>
                            )}

                            {/* Logo */}
                            <Link to="/" className="text-2xl font-black tracking-tight">
                                <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                                    MIND MINGLE
                                </span>
                            </Link>
                        </div>

                        {/* Search */}
                        <div className="flex-1 max-w-md mx-8">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search doubts..."
                                    value={search}
                                    onChange={e => handleSearch(e.target.value)}
                                    className="w-full pl-10 pr-8 py-2 bg-gray-900 border border-gray-800 text-slate-200 placeholder-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none text-sm transition-all"
                                />
                                {search && (
                                    <button
                                        onClick={() => handleSearch('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                        <X className="w-3.5 h-3.5 text-gray-500 hover:text-gray-300 transition-colors" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            {isAuthenticated ? (
                                <>
                                    <button className="relative p-2 hover:bg-gray-800 rounded-xl transition-colors">
                                        <Bell className="w-5 h-5 text-gray-400" />
                                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                                    </button>

                                    {/* Avatar dropdown */}
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            onClick={() => setDropdownOpen(o => !o)}
                                            className="flex items-center gap-2 hover:bg-gray-800 rounded-xl px-2 py-1.5 transition-all"
                                        >
                                            <div className="p-0.5 rounded-full bg-gradient-to-br from-violet-500 to-blue-500">
                                                <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-violet-400 font-black text-sm">
                                                    {user?.username?.[0]?.toUpperCase()}
                                                </div>
                                            </div>
                                            <span className="text-sm font-semibold text-slate-300 max-w-24 truncate">
                                                {user?.username}
                                            </span>
                                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {dropdownOpen && (
                                            <div className="absolute right-0 mt-2 w-56 bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 z-[999] overflow-hidden" style={{ top: '100%' }}>
                                                <div className="px-4 py-3 bg-gray-950 border-b border-gray-800">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-0.5 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex-shrink-0">
                                                            <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-violet-400 font-black text-sm">
                                                                {user?.username?.[0]?.toUpperCase()}
                                                            </div>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-white truncate">{user?.username}</p>
                                                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="py-1">
                                                    <Link
                                                        to={`/profile/${user?.id}`}
                                                        onClick={() => setDropdownOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-violet-500/10 hover:text-violet-400 transition-colors w-full"
                                                    >
                                                        <UserCircle className="w-4 h-4 flex-shrink-0" />
                                                        View Profile
                                                    </Link>
                                                </div>

                                                <div className="border-t border-gray-800 py-1">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors w-full"
                                                    >
                                                        <LogOut className="w-4 h-4 flex-shrink-0" />
                                                        Logout
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                                >
                                    <User className="w-4 h-4" />
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* ✅ Sliding Sidebar */}
            <>
                {/* Backdrop */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar panel */}
                <div className={`
                    fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800
                    z-50 transform transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    {/* Sidebar header */}
                    <div className="h-16 flex items-center justify-between px-5 border-b border-gray-800">
                        <span className="text-white font-bold text-lg">Menu</span>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Sidebar links */}
                    <div className="p-4 space-y-1">
                        <Link
                            to="/"
                            onClick={() => setSidebarOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-violet-500/10 hover:text-violet-400 transition-colors text-sm font-medium"
                        >
                            <Home className="w-5 h-5" />
                            Home
                        </Link>

                        <Link
                            to="/chat"
                            onClick={() => setSidebarOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-violet-500/10 hover:text-violet-400 transition-colors text-sm font-medium"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Messages
                        </Link>

                        <Link
                            to="/users"
                            onClick={() => setSidebarOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-violet-500/10 hover:text-violet-400 transition-colors text-sm font-medium"
                        >
                            <Users className="w-5 h-5" />
                            All Users
                        </Link>

                        <Link
                            to="/follow-requests"
                            onClick={() => setSidebarOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-violet-500/10 hover:text-violet-400 transition-colors text-sm font-medium"
                        >
                            <Users className="w-5 h-5" />
                            Follow Requests
                        </Link>

                        {/* <Link
                            to={`/profile/${user?.id}`}
                            onClick={() => setSidebarOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-violet-500/10 hover:text-violet-400 transition-colors text-sm font-medium"
                        >
                            <UserCircle className="w-5 h-5" />
                            My Profile
                        </Link> */}

                        {/* <Link
                            to="/settings"
                            onClick={() => setSidebarOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-violet-500/10 hover:text-violet-400 transition-colors text-sm font-medium"
                        >
                            <Settings className="w-5 h-5" />
                            Settings
                        </Link> */}
                    </div>

                    {/* User info at bottom */}
                    {isAuthenticated && (
                        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="p-0.5 rounded-full bg-gradient-to-br from-violet-500 to-blue-500">
                                    <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-violet-400 font-black text-sm">
                                        {user?.username?.[0]?.toUpperCase()}
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{user?.username}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </>
        </>
    )
}