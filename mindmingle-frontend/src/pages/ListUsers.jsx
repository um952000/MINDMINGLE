// import React from 'react';
// import { useEffect, useState } from 'react'
// import { useNavigate, Link } from 'react-router-dom'
// import { useAuth } from '../hooks/useAuth'
// import { authAPI, friendshipAPI } from '../services/api'
// import { UserCheck, UserX, Users, Clock } from 'lucide-react'

// const ListUsers = () => {
//     const { user: authUser } = useAuth()
//     const navigate = useNavigate()
//     const [users, setUsers] = useState([])
//     const [nextPage, setNextPage] = useState(null);
//     const [previousPage, setPreviousPage] = useState(null);
//     const [loading, setLoading] = useState(true)


//     const fetchUsers = async (url = null) => {

//         try {

//             setLoading(true)

//             const response = url
//                 ? await authAPI.getUsersByUrl(url)
//                 : await authAPI.getAllUsers()

//             setUsers(response.data.results)

//             setNextPage(response.data.next)

//             setPreviousPage(response.data.previous)

//         } catch (error) {

//             console.error(error)

//         } finally {

//             setLoading(false)
//         }
//     }
//     useEffect(() => {
//         if (!authUser) {
//             navigate('/login')
//             return
//         }


//         fetchUsers()
//     }, [authUser, navigate])

//     if (!authUser) return null

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gray-950 flex items-center justify-center">
//                 <div className="flex flex-col items-center gap-4">
//                     <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
//                     <p className="text-slate-400 text-sm">Loading users...</p>
//                 </div>
//             </div>
//         )
//     }

//     return (
//         <div className="min-h-screen bg-gray-950 p-6">
//             <h1 className="text-2xl font-bold text-white mb-6">All Users</h1>
//             {users.length === 0 ? (
//                 <p className="text-slate-400">No users found.</p>
//             ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                     {users.map((user) => (

//                         <div
//                             key={user.id}
//                             className="bg-gray-800 p-4 rounded-lg"
//                         >

//                             {/* USER INFO */}
//                             <Link to={`/profile/${user.id}`}>
//                                 <h2 className="text-lg font-semibold text-white">
//                                     {user.first_name} {user.last_name}
//                                 </h2>

//                                 <p className="text-slate-400">
//                                     @{user.username}
//                                 </p>
//                             </Link>

//                             {/* ACTION BUTTONS */}
//                             <div className="mt-4 flex gap-2">

//                                 {/* FOLLOW */}
//                                 {!user.friendship_status && (
//                                     <button
//                                         onClick={async () => {

//                                             try {

//                                                 const res =
//                                                     await friendshipAPI.sendRequest(
//                                                         user.id,
//                                                         authUser.id
//                                                     )

//                                                 setUsers(prev =>
//                                                     prev.map(u =>
//                                                         u.id === user.id
//                                                             ? {
//                                                                 ...u,
//                                                                 friendship_status:
//                                                                     'pending_sent',
//                                                                 friendship_id: res.data.id
//                                                             }
//                                                             : u
//                                                     )
//                                                 )

//                                             } catch (err) {
//                                                 console.error(err)
//                                             }
//                                         }}
//                                         className="bg-violet-600 text-white px-4 py-2 rounded-lg"
//                                     >
//                                         Follow
//                                     </button>
//                                 )}

//                                 {/* REQUEST SENT */}
//                                 {user.friendship_status === 'pending_sent' && (
//                                     <button
//                                         disabled
//                                         className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg"
//                                     >
//                                         Requested
//                                     </button>
//                                 )}

//                                 {/* ACCEPT / REJECT */}
//                                 {user.friendship_status === 'pending_received' && (
//                                     <>
//                                         <button
//                                             onClick={async () => {

//                                                 try {

//                                                     await friendshipAPI.acceptRequest(
//                                                         user.friendship_id
//                                                     )

//                                                     setUsers(prev =>
//                                                         prev.map(u =>
//                                                             u.id === user.id
//                                                                 ? {
//                                                                     ...u,
//                                                                     friendship_status:
//                                                                         'accepted',
//                                                                     is_following: true
//                                                                 }
//                                                                 : u
//                                                         )
//                                                     )

//                                                 } catch (err) {
//                                                     console.error(err)
//                                                 }
//                                             }}
//                                             className="bg-green-600 text-white px-4 py-2 rounded-lg"
//                                         >
//                                             Accept
//                                         </button>

//                                         <button
//                                             onClick={async () => {

//                                                 try {

//                                                     await friendshipAPI.rejectRequest(
//                                                         user.friendship_id
//                                                     )

//                                                     setUsers(prev =>
//                                                         prev.map(u =>
//                                                             u.id === user.id
//                                                                 ? {
//                                                                     ...u,
//                                                                     friendship_status: null,
//                                                                     friendship_id: null
//                                                                 }
//                                                                 : u
//                                                         )
//                                                     )

//                                                 } catch (err) {
//                                                     console.error(err)
//                                                 }
//                                             }}
//                                             className="bg-red-600 text-white px-4 py-2 rounded-lg"
//                                         >
//                                             Reject
//                                         </button>
//                                     </>
//                                 )}

//                                 {/* UNFOLLOW */}
//                                 {user.friendship_status === 'accepted' && (
//                                     <button
//                                         onClick={async () => {

//                                             try {

//                                                 await friendshipAPI.removeFriendship(
//                                                     user.friendship_id
//                                                 )

//                                                 setUsers(prev =>
//                                                     prev.map(u =>
//                                                         u.id === user.id
//                                                             ? {
//                                                                 ...u,
//                                                                 friendship_status: null,
//                                                                 friendship_id: null,
//                                                                 is_following: false
//                                                             }
//                                                             : u
//                                                     )
//                                                 )

//                                             } catch (err) {
//                                                 console.error(err)
//                                             }
//                                         }}
//                                         className="bg-red-600 text-white px-4 py-2 rounded-lg"
//                                     >
//                                         Remove
//                                     </button>
//                                 )}

//                             </div>

//                         </div>
//                     ))}
//                     <div style={{ marginTop: "20px", color: "white" }}>

//                         <button
//                             disabled={!previousPage}
//                             onClick={() => fetchUsers(previousPage)}
//                             style={{ marginRight: "10px", color: "white" }}
//                         >
//                             Previous
//                         </button>

//                         <button
//                             disabled={!nextPage}
//                             onClick={() => fetchUsers(nextPage)}
//                             style={{ marginLeft: "10px", color: "white" }}
//                         >
//                             Next
//                         </button>

//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ListUsers;




// import React, { useEffect, useState } from 'react'
// import { useNavigate, Link } from 'react-router-dom'
// import { useAuth } from '../hooks/useAuth'
// import { authAPI, friendshipAPI } from '../services/api'
// import {
//     UserCheck,
//     UserX,
//     Users,
//     Clock,
//     UserPlus
// } from 'lucide-react'

// const ListUsers = () => {

//     const { user: authUser } = useAuth()
//     const navigate = useNavigate()

//     const [users, setUsers] = useState([])
//     const [nextPage, setNextPage] = useState(null)
//     const [previousPage, setPreviousPage] = useState(null)

//     const [loading, setLoading] = useState(true)

//     // loading state for buttons
//     const [actionLoading, setActionLoading] = useState({})

//     // =========================================
//     // FETCH USERS
//     // =========================================

//     const fetchUsers = async (url = null) => {

//         try {

//             setLoading(true)

//             const response = url
//                 ? await authAPI.getUsersByUrl(url)
//                 : await authAPI.getAllUsers()

//             setUsers(response.data.results)

//             setNextPage(response.data.next)

//             setPreviousPage(response.data.previous)

//         } catch (error) {

//             console.error(error)

//         } finally {

//             setLoading(false)
//         }
//     }

//     useEffect(() => {

//         if (!authUser) {

//             navigate('/login')
//             return
//         }



//         fetchUsers()

//     }, [authUser, navigate])

//     // =========================================
//     // FOLLOW / UNFOLLOW / ACCEPT / REJECT
//     // =========================================

//     const handleAction = async (user) => {

//         try {

//             setActionLoading(prev => ({
//                 ...prev,
//                 [user.id]: true
//             }))

//             // =====================================
//             // UNFOLLOW
//             // =====================================

//             if (
//                 user.friendship_status === 'accepted' &&
//                 user.friendship_id
//             ) {

//                 await friendshipAPI.removeFriendship(
//                     user.friendship_id
//                 )

//                 setUsers(prev =>
//                     prev.map(u =>
//                         u.id === user.id
//                             ? {
//                                 ...u,
//                                 is_following: false,
//                                 friendship_status: null,
//                                 friendship_id: null
//                             }
//                             : u
//                     )
//                 )

//                 return
//             }

//             // =====================================
//             // ACCEPT REQUEST
//             // =====================================

//             if (
//                 user.friendship_status === 'pending_received' &&
//                 user.friendship_id
//             ) {

//                 await friendshipAPI.acceptRequest(
//                     user.friendship_id
//                 )

//                 setUsers(prev =>
//                     prev.map(u =>
//                         u.id === user.id
//                             ? {
//                                 ...u,
//                                 is_following: true,
//                                 friendship_status: 'accepted'
//                             }
//                             : u
//                     )
//                 )

//                 return
//             }

//             // =====================================
//             // REJECT REQUEST
//             // =====================================

//             if (
//                 user.friendship_status === 'pending_received' &&
//                 user.friendship_id
//             ) {

//                 await friendshipAPI.rejectRequest(
//                     user.friendship_id
//                 )

//                 setUsers(prev =>
//                     prev.map(u =>
//                         u.id === user.id
//                             ? {
//                                 ...u,
//                                 friendship_status: null,
//                                 friendship_id: null
//                             }
//                             : u
//                     )
//                 )

//                 return
//             }

//             // =====================================
//             // SEND FOLLOW REQUEST
//             // =====================================

//             const res = await friendshipAPI.sendRequest(user.id)

//             setUsers(prev =>
//                 prev.map(u =>
//                     u.id === user.id
//                         ? {
//                             ...u,
//                             friendship_status: res.data.status,
//                             friendship_id: res.data.id,
//                             is_following:
//                                 res.data.status === 'accepted'
//                         }
//                         : u
//                 )
//             )

//         } catch (err) {

//             console.error(err)

//         } finally {

//             setActionLoading(prev => ({
//                 ...prev,
//                 [user.id]: false
//             }))
//         }
//     }

//     // =========================================
//     // UI
//     // =========================================

//     if (!authUser) return null

//     if (loading) {

//         return (
//             <div className="min-h-screen bg-gray-950 flex items-center justify-center">
//                 <div className="flex flex-col items-center gap-4">
//                     <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
//                     <p className="text-slate-400 text-sm">
//                         Loading users...
//                     </p>
//                 </div>
//             </div>
//         )
//     }

//     return (
//         <div className="min-h-screen bg-gray-950 p-6">

//             {/* Header */}
//             <div className="flex items-center gap-3 mb-8">
//                 <div className="p-2 bg-violet-500/10 rounded-xl">
//                     <Users className="w-5 h-5 text-violet-400" />
//                 </div>

//                 <div>
//                     <h1 className="text-2xl font-bold text-white">
//                         All Users
//                     </h1>

//                     <p className="text-slate-500 text-sm">
//                         Discover and connect with users
//                     </p>
//                 </div>
//             </div>

//             {/* Users */}
//             {users.length === 0 ? (

//                 <p className="text-slate-400">
//                     No users found.
//                 </p>

//             ) : (

//                 <>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

//                         {users.map((user) => {

//                             const isLoading = actionLoading[user.id]

//                             return (

//                                 <div
//                                     key={user.id}
//                                     className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all"
//                                 >

//                                     {/* User info */}
//                                     <Link to={`/profile/${user.id}`}>

//                                         <div className="flex items-center gap-3 mb-4">

//                                             <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 font-bold text-lg">
//                                                 {user.username?.[0]?.toUpperCase()}
//                                             </div>

//                                             <div>
//                                                 <h2 className="text-white font-semibold">
//                                                     {user.first_name} {user.last_name}
//                                                 </h2>

//                                                 <p className="text-slate-400 text-sm">
//                                                     @{user.username}
//                                                 </p>
//                                             </div>

//                                         </div>

//                                     </Link>

//                                     {/* FOLLOW BUTTONS */}

//                                     {/* ACCEPT / REJECT */}
//                                     {user.friendship_status === 'pending_received' ? (

//                                         <div className="flex gap-2">

//                                             <button
//                                                 onClick={() => handleAction(user)}
//                                                 disabled={isLoading}
//                                                 className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-sm font-semibold"
//                                             >
//                                                 <UserCheck className="w-4 h-4" />
//                                                 Accept
//                                             </button>

//                                             <button
//                                                 onClick={() =>
//                                                     friendshipAPI
//                                                         .rejectRequest(user.friendship_id)
//                                                         .then(() => {
//                                                             setUsers(prev =>
//                                                                 prev.map(u =>
//                                                                     u.id === user.id
//                                                                         ? {
//                                                                             ...u,
//                                                                             friendship_status: null,
//                                                                             friendship_id: null
//                                                                         }
//                                                                         : u
//                                                                 )
//                                                             )
//                                                         })
//                                                 }
//                                                 className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl text-sm font-semibold"
//                                             >
//                                                 <UserX className="w-4 h-4" />
//                                                 Reject
//                                             </button>

//                                         </div>

//                                     ) : user.friendship_status === 'accepted' ? (

//                                         // UNFOLLOW
//                                         <button
//                                             onClick={() => handleAction(user)}
//                                             disabled={isLoading}
//                                             className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl text-sm font-semibold"
//                                         >
//                                             <UserX className="w-4 h-4" />

//                                             Remove
//                                         </button>

//                                     ) : user.friendship_status === 'pending' ? (

//                                         // REQUEST SENT
//                                         <button
//                                             disabled
//                                             className="w-full flex items-center justify-center gap-2 bg-gray-800 text-slate-400 px-4 py-2 rounded-xl text-sm font-semibold cursor-not-allowed"
//                                         >
//                                             <Clock className="w-4 h-4" />

//                                             Request Sent
//                                         </button>

//                                     ) : (

//                                         // FOLLOW
//                                         <button
//                                             onClick={() => handleAction(user)}
//                                             disabled={isLoading}
//                                             className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-sm font-semibold"
//                                         >
//                                             <UserPlus className="w-4 h-4" />

//                                             Follow
//                                         </button>

//                                     )}

//                                 </div>
//                             )
//                         })}
//                     </div>

//                     {/* Pagination */}
//                     <div className="flex justify-center gap-4 mt-8">

//                         <button
//                             disabled={!previousPage}
//                             onClick={() => fetchUsers(previousPage)}
//                             className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl"
//                         >
//                             Previous
//                         </button>

//                         <button
//                             disabled={!nextPage}
//                             onClick={() => fetchUsers(nextPage)}
//                             className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl"
//                         >
//                             Next
//                         </button>

//                     </div>
//                 </>
//             )}
//         </div>
//     )
// }

// export default ListUsers




// import React, { useEffect, useState } from 'react'
// import { useNavigate, Link } from 'react-router-dom'
// import { useAuth } from '../hooks/useAuth'
// import { authAPI } from '../services/api'
// import { Users } from 'lucide-react'

// const ListUsers = () => {

//     const { user: authUser } = useAuth()
//     const navigate = useNavigate()

//     const [users, setUsers] = useState([])
//     const [nextPage, setNextPage] = useState(null)
//     const [previousPage, setPreviousPage] = useState(null)
//     const [loading, setLoading] = useState(true)

//     const fetchUsers = async (url = null) => {
//         try {
//             setLoading(true)
//             const response = url
//                 ? await authAPI.getUsersByUrl(url)
//                 : await authAPI.getAllUsers()
//             setUsers(response.data.results)
//             setNextPage(response.data.next)
//             setPreviousPage(response.data.previous)
//         } catch (error) {
//             console.error(error)
//         } finally {
//             setLoading(false)
//         }
//     }

//     useEffect(() => {
//         if (!authUser) {
//             navigate('/login')
//             return
//         }
//         fetchUsers()
//     }, [authUser, navigate])

//     if (!authUser) return null

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gray-950 flex items-center justify-center">
//                 <div className="flex flex-col items-center gap-4">
//                     <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
//                     <p className="text-slate-400 text-sm">Loading users...</p>
//                 </div>
//             </div>
//         )
//     }

//     return (
//         <div className="min-h-screen bg-gray-950 p-6">

//             {/* Header */}
//             <div className="flex items-center gap-3 mb-8">
//                 <div className="p-2 bg-violet-500/10 rounded-xl">
//                     <Users className="w-5 h-5 text-violet-400" />
//                 </div>
//                 <div>
//                     <h1 className="text-2xl font-bold text-white">All Users</h1>
//                     <p className="text-slate-500 text-sm">Discover and connect with users</p>
//                 </div>
//             </div>

//             {/* Users */}
//             {users.length === 0 ? (

//                 <p className="text-slate-400">No users found.</p>

//             ) : (
//                 <>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                         {users.map((user) => (
//                             <div
//                                 key={user.id}
//                                 className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all flex items-center justify-between"
//                             >
//                                 {/* User Info */}
//                                 <div className="flex items-center gap-3">
//                                     <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 font-bold text-lg">
//                                         {user.username?.[0]?.toUpperCase()}
//                                     </div>
//                                     <div>
//                                         <h2 className="text-white font-semibold">
//                                             {user.first_name} {user.last_name}
//                                         </h2>
//                                         <p className="text-slate-400 text-sm">@{user.username}</p>
//                                     </div>
//                                 </div>

//                                 {/* View Profile Button */}
//                                 <Link to={`/profile/${user.id}`}>
//                                     <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
//                                         View Profile
//                                     </button>
//                                 </Link>
//                             </div>
//                         ))}
//                     </div>

//                     {/* Pagination */}
//                     <div className="flex justify-center gap-4 mt-8">
//                         <button
//                             disabled={!previousPage}
//                             onClick={() => fetchUsers(previousPage)}
//                             className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl"
//                         >
//                             Previous
//                         </button>
//                         <button
//                             disabled={!nextPage}
//                             onClick={() => fetchUsers(nextPage)}
//                             className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl"
//                         >
//                             Next
//                         </button>
//                     </div>
//                 </>
//             )}
//         </div>
//     )
// }

// export default ListUsers
import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { authAPI } from '../services/api'
import { Users, Search, ArrowRight, ChevronLeft, ChevronRight, X } from 'lucide-react'

const AVATAR_COLORS = [
    { bg: 'bg-violet-900', text: 'text-violet-300' },
    { bg: 'bg-teal-900', text: 'text-teal-300' },
    { bg: 'bg-indigo-900', text: 'text-indigo-300' },
    { bg: 'bg-rose-900', text: 'text-rose-300' },
    { bg: 'bg-amber-900', text: 'text-amber-300' },
]

const avatarColor = (username = '') =>
    AVATAR_COLORS[(username.charCodeAt(0) || 0) % AVATAR_COLORS.length]

const ListUsers = () => {
    const { user: authUser } = useAuth()
    const navigate = useNavigate()
    const searchRef = useRef(null)

    const [users, setUsers] = useState([])
    const [nextPage, setNextPage] = useState(null)
    const [previousPage, setPreviousPage] = useState(null)
    const [loading, setLoading] = useState(true)       // initial load only
    const [fetching, setFetching] = useState(false)    // background refetches
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)

    const fetchUsers = async (url = null, query = '', background = false) => {
        try {
            background ? setFetching(true) : setLoading(true)
            const response = url
                ? await authAPI.getUsersByUrl(url)
                : await authAPI.getAllUsers(query)
            setUsers(response.data.results)
            setNextPage(response.data.next)
            setPreviousPage(response.data.previous)
        } catch (e) {
            console.error(e)
        } finally {
            background ? setFetching(false) : setLoading(false)
        }
    }

    // initial load
    useEffect(() => {
        if (!authUser) { navigate('/login'); return }
        fetchUsers()
    }, [authUser, navigate])

    // debounced search — background fetch, cursor stays intact
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1)
            fetchUsers(null, search, true)
        }, 400)
        return () => clearTimeout(timer)
    }, [search])

    // filter client-side: match username OR full name
    const filtered = users.filter(u => {
        const q = search.toLowerCase()
        const fullName = [u.first_name, u.last_name].filter(Boolean).join(' ').toLowerCase()
        const username = (u.username || '').toLowerCase()
        return username.includes(q) || fullName.includes(q)
    })

    if (!authUser) return null

    if (loading) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 rounded-full border-2 border-t-violet-400 border-violet-500/20 animate-spin" />
                <p className="text-slate-500 text-sm">Loading users...</p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-950">
            <div className="max-w-3xl mx-auto px-6 py-10">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                            <Users className="w-4 h-4 text-violet-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white leading-tight">All Users</h1>
                            <p className="text-slate-500 text-xs">{filtered.length} members</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                        <input
                            ref={searchRef}
                            type="text"
                            placeholder="Search by name or username..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-gray-900 border border-gray-800 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 text-white text-sm placeholder-slate-600 rounded-lg pl-8 pr-8 py-2 w-64 outline-none transition-all"
                        />

                        {/* right side: spinner while fetching, X to clear when has value */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {fetching ? (
                                <div className="w-3.5 h-3.5 border-2 border-t-violet-400 border-violet-500/20 rounded-full animate-spin" />
                            ) : search ? (
                                <button onClick={() => { setSearch(''); searchRef.current?.focus() }}>
                                    <X className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 transition-colors" />
                                </button>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-2xl border border-gray-800 overflow-hidden">

                    {/* Column headers */}
                    <div className="grid grid-cols-[1fr_auto] items-center px-4 py-2.5 bg-gray-900 border-b border-gray-800">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">User</span>
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Action</span>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 bg-gray-900/40">
                            <Users className="w-8 h-8 text-slate-700" />
                            <p className="text-slate-500 text-sm">
                                {search ? `No results for "${search}"` : 'No users found'}
                            </p>
                            {search && (
                                <button
                                    onClick={() => { setSearch(''); searchRef.current?.focus() }}
                                    className="text-violet-400 text-xs hover:text-violet-300 transition-colors"
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    ) : (
                        filtered.map((user, i) => {
                            const color = avatarColor(user.username)
                            const initials = user.first_name && user.last_name
                                ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
                                : user.username?.[0]?.toUpperCase()
                            const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username

                            return (
                                <div
                                    key={user.id}
                                    className={`group flex items-center gap-4 px-4 py-3.5 hover:bg-gray-900/60 transition-colors ${i !== filtered.length - 1 ? 'border-b border-gray-800/70' : ''
                                        }`}
                                >
                                    <div className={`w-9 h-9 rounded-full ${color.bg} ${color.text} flex items-center justify-center text-sm font-semibold flex-shrink-0`}>
                                        {initials}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm font-medium truncate">{fullName}</p>
                                        <p className="text-slate-500 text-xs truncate">@{user.username}</p>
                                    </div>

                                    <Link to={`/profile/${user.id}`}>
                                        <button className="flex items-center gap-1.5 text-xs font-semibold text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                            View profile
                                            <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </Link>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Pagination */}
                {(previousPage || nextPage) && (
                    <div className="flex items-center justify-between mt-6">
                        <button
                            disabled={!previousPage}
                            onClick={() => { fetchUsers(previousPage, search); setPage(p => p - 1) }}
                            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </button>

                        <span className="text-xs text-slate-600">Page {page}</span>

                        <button
                            disabled={!nextPage}
                            onClick={() => { fetchUsers(nextPage, search); setPage(p => p + 1) }}
                            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

            </div>
        </div>
    )
}

export default ListUsers