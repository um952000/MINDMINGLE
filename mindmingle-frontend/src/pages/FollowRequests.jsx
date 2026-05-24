// import { useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useAuth } from '../hooks/useAuth'
// import { friendshipAPI } from '../services/api'

// export default function FollowRequests() {

//     const { user: authUser } = useAuth()
//     const navigate = useNavigate()

//     const [requests, setRequests] = useState([])
//     const [loading, setLoading] = useState(true)

//     useEffect(() => {

//         // NOT LOGGED IN
//         if (!authUser) {
//             navigate('/login')
//             return
//         }

//         const fetchRequests = async () => {
//             try {

//                 const response =
//                     await friendshipAPI.getReceivedRequests()

//                 setRequests(response.data)

//             } catch (error) {
//                 console.error(error)
//             } finally {
//                 setLoading(false)
//             }
//         }

//         fetchRequests()

//     }, [authUser, navigate])

//     if (!authUser) return null

//     if (loading) {
//         return (
//             <div className="text-white p-6">
//                 Loading requests...
//             </div>
//         )
//     }

//     return (
//         <div className="p-6 text-white">
//             <h1 className="text-2xl font-bold mb-6">
//                 Follow Requests
//             </h1>

//             {requests.length > 0 ? (
//                 <div className="space-y-4">

//                     {requests.map((request) => (
//                         <div
//                             key={request.id}
//                             className="bg-slate-800 border border-slate-700 rounded-xl p-4"
//                         >
//                             <div className="flex items-center justify-between">

//                                 <div>
//                                     <div className="font-semibold">
//                                         {request.from_user}
//                                     </div>

//                                     <div className="text-xs text-slate-400">
//                                         wants to follow you
//                                     </div>
//                                 </div>

//                                 <div className="flex gap-2">

//                                     <button
//                                         onClick={async () => {
//                                             await friendshipAPI.acceptRequest(request.id)

//                                             setRequests(prev =>
//                                                 prev.filter(r => r.id !== request.id)
//                                             )
//                                         }}
//                                         className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm"
//                                     >
//                                         Accept
//                                     </button>

//                                     <button
//                                         onClick={async () => {
//                                             await friendshipAPI.rejectRequest(request.id)

//                                             setRequests(prev =>
//                                                 prev.filter(r => r.id !== request.id)
//                                             )
//                                         }}
//                                         className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm"
//                                     >
//                                         Reject
//                                     </button>

//                                 </div>

//                             </div>
//                         </div>
//                     ))}

//                 </div>
//             ) : (
//                 <div className="text-slate-400">
//                     No follow requests
//                 </div>
//             )}
//         </div>
//     )
// }

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { friendshipAPI } from '../services/api'
import { UserCheck, UserX, Users, Clock } from 'lucide-react'

export default function FollowRequests() {
    const { user: authUser } = useAuth()
    const navigate = useNavigate()
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState({})

    useEffect(() => {
        if (!authUser) {
            navigate('/login')
            return
        }

        const fetchRequests = async () => {
            try {
                const response = await friendshipAPI.getReceivedRequests()
                setRequests(response.data)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        fetchRequests()
    }, [authUser, navigate])

    const handleAccept = async (id) => {
        setActionLoading(prev => ({ ...prev, [id]: 'accepting' }))
        try {
            await friendshipAPI.acceptRequest(id)
            setRequests(prev => prev.filter(r => r.id !== id))
        } finally {
            setActionLoading(prev => ({ ...prev, [id]: null }))
        }
    }

    const handleReject = async (id) => {
        setActionLoading(prev => ({ ...prev, [id]: 'rejecting' }))
        try {
            await friendshipAPI.rejectRequest(id)
            setRequests(prev => prev.filter(r => r.id !== id))
        } finally {
            setActionLoading(prev => ({ ...prev, [id]: null }))
        }
    }

    const getInitial = (name) => {
        if (!name) return '?'
        if (typeof name === 'object') return (name.username?.[0] || '?').toUpperCase()
        return String(name)[0].toUpperCase()
    }

    const getUsername = (from_user) => {
        if (!from_user) return 'Unknown'
        if (typeof from_user === 'object') return from_user.username || 'Unknown'
        return String(from_user)
    }

    if (!authUser) return null

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm">Loading requests...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950 py-10 px-4">
            <div className="max-w-xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-violet-500/10 rounded-xl">
                            <Users className="w-5 h-5 text-violet-400" />
                        </div>
                        <h1 className="text-2xl font-black text-white">Follow Requests</h1>
                    </div>
                    <p className="text-slate-500 text-sm ml-12">
                        {requests.length > 0
                            ? `${requests.length} pending request${requests.length > 1 ? 's' : ''}`
                            : 'No pending requests'}
                    </p>
                </div>

                {requests.length > 0 ? (
                    <div className="space-y-3">
                        {requests.map((request) => {
                            const isActing = actionLoading[request.id]
                            const username = getUsername(request.from_user)
                            const initial = getInitial(request.from_user)

                            return (
                                <div
                                    key={request.id}
                                    className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all hover:border-gray-700"
                                >
                                    {/* Avatar + info */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="p-0.5 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex-shrink-0">
                                            <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-violet-400 font-black text-sm">
                                                {initial}
                                            </div>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-white font-semibold text-sm truncate">
                                                {username}
                                            </p>
                                            <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                                                <Clock className="w-3 h-3" />
                                                wants to follow you
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => handleAccept(request.id)}
                                            disabled={!!isActing}
                                            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            {isActing === 'accepting' ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <UserCheck className="w-4 h-4" />
                                            )}
                                            Accept
                                        </button>

                                        <button
                                            onClick={() => handleReject(request.id)}
                                            disabled={!!isActing}
                                            className="flex items-center gap-1.5 bg-gray-800 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-slate-400 border border-gray-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            {isActing === 'rejecting' ? (
                                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <UserX className="w-4 h-4" />
                                            )}
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mb-4">
                            <Users className="w-7 h-7 text-gray-700" />
                        </div>
                        <p className="text-white font-semibold mb-1">All caught up</p>
                        <p className="text-slate-500 text-sm">No pending follow requests right now</p>
                    </div>
                )}
            </div>
        </div>
    )
}