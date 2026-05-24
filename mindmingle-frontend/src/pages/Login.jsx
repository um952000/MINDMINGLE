// import { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { useAuth } from '../hooks/useAuth'
// import { authAPI } from '../services/api'

// import { jwtDecode } from 'jwt-decode'

// export default function Login() {

//     const [formData, setFormData] = useState({ username: '', password: '' })
//     const [loading, setLoading] = useState(false)
//     const [error, setError] = useState('')
//     const { login } = useAuth()
//     const navigate = useNavigate()

//     const handleSubmit = async (e) => {
//         e.preventDefault()
//         setLoading(true)
//         setError('')

//         try {
//             // const response = await authAPI.login(formData)
//             // const token = response.data.access
//             // const decoded = jwtDecode(token)  // decode user info from token
//             // login(token, decoded)             // pass decoded payload as user
//             // navigate('/')
//             const response = await authAPI.login(formData)
//             const token = response.data.access
//             localStorage.setItem('token', token)        // set token first so /me call is authenticated
//             const meResponse = await authAPI.me()       // fetch full user profile
//             login(token, meResponse.data)               // user now has username, email, id
//             navigate('/')

//         } catch (err) {
//             const errData = err.response?.data
//             if (typeof errData === 'object') {
//                 setError(errData?.detail || errData?.error || 'Login failed')
//             } else {
//                 setError(errData || 'Login failed')
//             }
//         } finally {
//             setLoading(false)
//         }
//     }

//     return (
//         <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100">
//             <div className="max-w-md w-full space-y-8">
//                 <div>
//                     <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
//                         Sign in to your account
//                     </h2>
//                 </div>

//                 {error && (
//                     <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
//                         {error}
//                     </div>
//                 )}

//                 <form className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-xl" onSubmit={handleSubmit}>
//                     <div className="space-y-4">
//                         <div>
//                             <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
//                                 Username
//                             </label>
//                             <input
//                                 id="username"
//                                 name="username"
//                                 type="text"
//                                 required
//                                 value={formData.username}
//                                 onChange={(e) => setFormData({ ...formData, username: e.target.value })}
//                                 className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                                 placeholder="Enter username"
//                             />
//                         </div>

//                         <div>
//                             <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//                                 Password
//                             </label>
//                             <input
//                                 id="password"
//                                 name="password"
//                                 type="password"
//                                 required
//                                 value={formData.password}
//                                 onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                                 className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                                 placeholder="Enter password"
//                             />
//                         </div>
//                     </div>

//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
//                     >
//                         {loading ? 'Signing in...' : 'Sign in'}
//                     </button>

//                     <div className="text-center">
//                         <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
//                             Don't have an account? Register
//                         </Link>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     )
// }


import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { authAPI } from '../services/api'
import { LogIn, User, Lock, Eye, EyeOff } from 'lucide-react'

export default function Login() {
    const [formData, setFormData] = useState({ username: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await authAPI.login(formData)
            const token = response.data.access
            localStorage.setItem('token', token)
            const meResponse = await authAPI.me()
            login(token, meResponse.data)
            navigate('/')
        } catch (err) {
            const errData = err.response?.data
            if (typeof errData === 'object') {
                setError(errData?.detail || errData?.error || 'Login failed')
            } else {
                setError(errData || 'Login failed')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-violet-500/10 border border-violet-500/20 rounded-2xl mb-4">
                        <LogIn className="w-7 h-7 text-violet-400" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        Welcome back
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm">
                        Sign in to continue to Mind Mingle
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
                        {error}
                    </div>
                )}

                {/* Form */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-4">

                    {/* Username */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                            Username
                        </label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                            <input
                                type="text"
                                required
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 text-slate-200 placeholder-slate-600 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                                placeholder="Enter your username"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 text-slate-200 placeholder-slate-600 rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(s => !s)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-violet-500/20 mt-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            <>
                                <LogIn size={16} />
                                Sign In
                            </>
                        )}
                    </button>

                    {/* Register link */}
                    <p className="text-center text-sm text-slate-500 pt-2">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                            Create one
                        </Link>
                    </p>
                </div>

                {/* Demo hint */}
                <div className="mt-4 bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                    <p className="text-xs text-slate-600 text-center">
                        🔒 Your data is secure. We use JWT authentication.
                    </p>
                </div>

            </div>
        </div>
    )
}