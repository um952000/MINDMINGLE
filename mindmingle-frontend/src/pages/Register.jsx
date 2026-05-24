// import { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { useAuth } from '../hooks/useAuth'
// import { authAPI, extractErrorMessage } from '../services/api'

// export default function Register() {
//     const [formData, setFormData] = useState({
//         username: '',
//         email: '',
//         password: '',
//         password2: ''
//     })
//     const [loading, setLoading] = useState(false)
//     const [error, setError] = useState('')
//     const { login } = useAuth()
//     const navigate = useNavigate()

//     const handleSubmit = async (e) => {
//         e.preventDefault()
//         setLoading(true)
//         setError('')

//         // ✅ check before hitting the API
//         if (formData.password !== formData.password2) {
//             setError('Passwords do not match')
//             setLoading(false)
//             return
//         }

//         try {
//             const response = await authAPI.register(formData)
//             const token = response.data.token.access        // ✅ DRF returns .access
//             localStorage.setItem('token', token)      // set before /me call
//             const meResponse = await authAPI.me()     // fetch user profile
//             login(token, meResponse.data)             // user has username, email, id
//             navigate('/')
//         } catch (err) {
//             console.log('Register 400 error:', err.response?.data)  // 👈 add this
//             setError(extractErrorMessage(err, 'Registration failed'))
//         } finally {
//             setLoading(false)
//         }
//     }

//     return (
//         <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 to-blue-100">
//             <div className="max-w-md w-full space-y-8">
//                 <div>
//                     <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
//                         Create your account
//                     </h2>
//                     <p className="mt-2 text-center text-sm text-gray-600">
//                         Join MIND MINGLE community
//                     </p>
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
//                                 name="username"
//                                 type="text"
//                                 required
//                                 value={formData.username}
//                                 onChange={(e) => setFormData({ ...formData, username: e.target.value })}
//                                 className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//                                 placeholder="Your username"
//                             />
//                         </div>

//                         <div>
//                             <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                                 Email
//                             </label>
//                             <input
//                                 name="email"
//                                 type="email"
//                                 required
//                                 value={formData.email}
//                                 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                                 className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//                                 placeholder="your@email.com"
//                             />
//                         </div>

//                         <div className="grid grid-cols-2 gap-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
//                                 <input
//                                     name="password"
//                                     type="password"
//                                     required
//                                     value={formData.password}
//                                     onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Confirm</label>
//                                 <input
//                                     name="password_confirm"
//                                     type="password"
//                                     required
//                                     value={formData.password2}
//                                     onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
//                                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
//                                 />
//                             </div>
//                         </div>
//                     </div>

//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all"
//                     >
//                         {loading ? 'Creating account...' : 'Create Account'}
//                     </button>

//                     <div className="text-center">
//                         <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
//                             Already have an account? Sign in
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
import { authAPI, extractErrorMessage } from '../services/api'
import { UserPlus, User, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showPassword2, setShowPassword2] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (formData.password !== formData.password2) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        try {
            const response = await authAPI.register(formData)
            const token = response.data.token.access
            localStorage.setItem('token', token)
            const meResponse = await authAPI.me()
            login(token, meResponse.data)
            navigate('/')
        } catch (err) {
            setError(extractErrorMessage(err, 'Registration failed'))
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
                        <UserPlus className="w-7 h-7 text-violet-400" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        Join Mind Mingle
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm">
                        Create your account and start solving doubts
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
                                placeholder="Choose a username"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 text-slate-200 placeholder-slate-600 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                                placeholder="your@email.com"
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
                                placeholder="Create a strong password"
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

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                            <input
                                type={showPassword2 ? 'text' : 'password'}
                                required
                                value={formData.password2}
                                onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
                                className={`w-full bg-gray-800 border text-slate-200 placeholder-slate-600 rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none focus:ring-1 transition-all ${formData.password2 && formData.password !== formData.password2
                                    ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20'
                                    : formData.password2 && formData.password === formData.password2
                                        ? 'border-green-500/50 focus:border-green-500/50 focus:ring-green-500/20'
                                        : 'border-gray-700 focus:border-violet-500/50 focus:ring-violet-500/20'
                                    }`}
                                placeholder="Repeat your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword2(s => !s)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                            >
                                {showPassword2 ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {formData.password2 && formData.password !== formData.password2 && (
                            <p className="text-red-400 text-xs mt-1.5">Passwords do not match</p>
                        )}
                        {formData.password2 && formData.password === formData.password2 && (
                            <p className="text-green-400 text-xs mt-1.5">✓ Passwords match</p>
                        )}
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
                                Creating account...
                            </>
                        ) : (
                            <>
                                <UserPlus size={16} />
                                Create Account
                            </>
                        )}
                    </button>

                    {/* Login link */}
                    <p className="text-center text-sm text-slate-500 pt-2">
                        Already have an account?{' '}
                        <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}