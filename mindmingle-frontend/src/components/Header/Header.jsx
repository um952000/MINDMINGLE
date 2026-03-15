
// import { useState, useRef, useEffect } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { User, Search, Bell, LogOut, ChevronDown, Settings, UserCircle } from 'lucide-react'
// import { useAuth } from '../../hooks/useAuth.jsx'

// export default function Navbar() {
//     const { user, logout, isAuthenticated } = useAuth()
//     const navigate = useNavigate()
//     const [dropdownOpen, setDropdownOpen] = useState(false)
//     const dropdownRef = useRef(null)

//     const handleLogout = () => {
//         setDropdownOpen(false)
//         logout()
//         navigate('/')
//     }

//     useEffect(() => {
//         const handleClickOutside = (e) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//                 setDropdownOpen(false)
//             }
//         }
//         document.addEventListener('mousedown', handleClickOutside)
//         return () => document.removeEventListener('mousedown', handleClickOutside)
//     }, [])

//     return (
//         <nav className="bg-white shadow-sm border-b border-gray-100 relative z-50">
//             <div className="max-w-7xl mx-auto px-6 py-4">
//                 <div className="flex items-center justify-between">

//                     {/* Logo */}
//                     <Link to="/" className="text-2xl font-bold text-indigo-600">
//                         MIND MINGLE
//                     </Link>

//                     {/* Search */}
//                     <div className="flex-1 max-w-md mx-8">
//                         <div className="relative">
//                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
//                             <input
//                                 type="text"
//                                 placeholder="Search doubts..."
//                                 className="w-full pl-11 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
//                             />
//                         </div>
//                     </div>

//                     {/* Actions */}
//                     <div className="flex items-center gap-3">

//                         {/* Ask Doubt */}
//                         <Link
//                             to={isAuthenticated ? "/ask" : "/login"}
//                             className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
//                         >
//                             {isAuthenticated && (
//                                 <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
//                             )}
//                             Ask Doubt
//                         </Link>

//                         {isAuthenticated ? (
//                             <>
//                                 {/* Bell */}
//                                 <button className="p-2 hover:bg-gray-100 rounded-lg relative">
//                                     <Bell className="w-5 h-5 text-gray-600" />
//                                     <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
//                                 </button>

//                                 {/* Avatar dropdown */}
//                                 <div className="relative" ref={dropdownRef}>
//                                     <button
//                                         onClick={() => setDropdownOpen(o => !o)}
//                                         className="flex items-center gap-2 hover:bg-gray-50 rounded-xl px-2 py-1.5 transition-all"
//                                     >
//                                         <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
//                                             {user?.username?.[0]?.toUpperCase()}
//                                         </div>
//                                         <span className="text-sm font-semibold text-gray-700 max-w-24 truncate">
//                                             {user?.username}
//                                         </span>
//                                         <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
//                                     </button>

//                                     {/* Dropdown */}
//                                     {dropdownOpen && (
//                                         <div
//                                             className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[999]"
//                                             style={{ top: '100%' }}
//                                         >
//                                             {/* Header */}
//                                             <div className="px-4 py-3 bg-gray-50 rounded-t-2xl border-b border-gray-100">
//                                                 <p className="text-sm font-bold text-gray-900 truncate">{user?.username}</p>
//                                                 <p className="text-xs text-gray-500 truncate">{user?.email}</p>
//                                             </div>

//                                             {/* Links */}
//                                             <div className="py-2">
//                                                 <Link
//                                                     to={`/profile/${user?.id}`}
//                                                     onClick={() => setDropdownOpen(false)}
//                                                     className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors w-full"
//                                                 >
//                                                     <UserCircle className="w-4 h-4 flex-shrink-0" />
//                                                     View Profile
//                                                 </Link>

//                                                 <Link
//                                                     to="/settings"
//                                                     onClick={() => setDropdownOpen(false)}
//                                                     className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors w-full"
//                                                 >
//                                                     <Settings className="w-4 h-4 flex-shrink-0" />
//                                                     Settings
//                                                 </Link>
//                                             </div>

//                                             {/* Logout */}
//                                             <div className="border-t border-gray-100 py-2">
//                                                 <button
//                                                     onClick={handleLogout}
//                                                     className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full"
//                                                 >
//                                                     <LogOut className="w-4 h-4 flex-shrink-0" />
//                                                     Logout
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     )}
//                                 </div>
//                             </>
//                         ) : (
//                             <Link
//                                 to="/login"
//                                 className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
//                             >
//                                 <User className="w-4 h-4" />
//                                 Login
//                             </Link>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </nav>
//     )
// }

import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Search, Bell, LogOut, ChevronDown, Settings, UserCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.jsx'

export default function Navbar() {
    const { user, logout, isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)

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
        <nav className="bg-gray-950 border-b border-gray-800 relative z-50">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">

                    {/* Logo */}
                    <Link to="/" className="text-2xl font-black tracking-tight">
                        <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                            MIND MINGLE
                        </span>
                    </Link>

                    {/* Search */}
                    <div className="flex-1 max-w-md mx-8">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search doubts..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 text-slate-200 placeholder-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none text-sm transition-all"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">

                        {/* Ask Doubt */}
                        <Link
                            to={isAuthenticated ? "/ask" : "/login"}
                            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-500/20"
                        >
                            {isAuthenticated && (
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            )}
                            Ask Doubt
                        </Link>

                        {isAuthenticated ? (
                            <>
                                {/* Bell */}
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
                                        {/* Avatar with gradient ring */}
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

                                    {/* Dropdown */}
                                    {dropdownOpen && (
                                        <div
                                            className="absolute right-0 mt-2 w-56 bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 z-[999] overflow-hidden"
                                            style={{ top: '100%' }}
                                        >
                                            {/* Header */}
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

                                            {/* Links */}
                                            <div className="py-1">
                                                <Link
                                                    to={`/profile/${user?.id}`}
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-violet-500/10 hover:text-violet-400 transition-colors w-full"
                                                >
                                                    <UserCircle className="w-4 h-4 flex-shrink-0" />
                                                    View Profile
                                                </Link>

                                                <Link
                                                    to="/settings"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-violet-500/10 hover:text-violet-400 transition-colors w-full"
                                                >
                                                    <Settings className="w-4 h-4 flex-shrink-0" />
                                                    Settings
                                                </Link>
                                            </div>

                                            {/* Logout */}
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
    )
}