// import { createContext, useContext, useState, useEffect } from 'react'

// const AuthContext = createContext()

// import { jwtDecode } from 'jwt-decode'

// export function AuthProvider({ children }) {
//     const [user, setUser] = useState(null)
//     const [loading, setLoading] = useState(true)

//     useEffect(() => {
//         const token = localStorage.getItem('token')
//         const userData = localStorage.getItem('user')

//         if (token && userData) {
//             try {
//                 setUser(JSON.parse(userData))  // ✅ wrapped in try/catch
//             } catch (e) {
//                 // corrupted data in localStorage, clear it
//                 localStorage.removeItem('token')
//                 localStorage.removeItem('user')
//             }
//         }
//         setLoading(false)
//     }, [])

//     const login = (token, userData) => {
//         localStorage.setItem('token', token)  // stores the access token
//         localStorage.setItem('user', JSON.stringify(userData))
//         setUser(userData)
//     }

//     const logout = () => {
//         localStorage.removeItem('token')
//         localStorage.removeItem('user')
//         setUser(null)
//     }

//     const value = {
//         user,
//         login,
//         logout,
//         isAuthenticated: !!user,
//     }

//     return (
//         <AuthContext.Provider value={value}>
//             {!loading && children}
//         </AuthContext.Provider>
//     )
// }

// export const useAuth = () => {
//     const context = useContext(AuthContext)
//     if (!context) {
//         throw new Error('useAuth must be used within AuthProvider')
//     }
//     return context
// }

import { createContext, useContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')

        if (token && userData) {
            try {
                const decoded = jwtDecode(token)
                const isExpired = decoded.exp * 1000 < Date.now()

                if (isExpired) {
                    // token expired, clear everything
                    localStorage.removeItem('token')
                    localStorage.removeItem('user')
                } else {
                    setUser(JSON.parse(userData))
                }
            } catch (e) {
                // corrupted token or user data, clear everything
                localStorage.removeItem('token')
                localStorage.removeItem('user')
            }
        }
        setLoading(false)
    }, [])

    const login = (token, userData) => {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
    }

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}