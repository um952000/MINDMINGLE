// import { useState, useEffect, useCallback, useRef } from 'react'
// import { useInView } from 'react-intersection-observer'
// import { useAuth } from '../hooks/useAuth'
// import { doubtAPI } from '../services/api'
// import DoubtFeedCard from '../components/DoubtCard/DoubtFeedcard'
// import FeedFilters from '../components/DoubtCard/FeedFilters'

// export default function Home() {
//     const { user } = useAuth()
//     const [doubts, setDoubts] = useState([])
//     const [loading, setLoading] = useState(false)
//     const [hasMore, setHasMore] = useState(true)
//     const [filter, setFilter] = useState('recent')
//     const [page, setPage] = useState(1)
//     const loadRef = useRef()
//     const { ref, inView } = useInView()

//     // Load initial doubts
//     useEffect(() => {
//         setDoubts([])
//         setPage(1)
//         setHasMore(true)
//         loadMoreDoubts(true)
//     }, [filter])

//     // Infinite scroll trigger
//     useEffect(() => {
//         if (inView && hasMore && !loading) {
//             loadMoreDoubts()
//         }
//     }, [inView, hasMore, loading])

//     const loadMoreDoubts = useCallback(async (initial = false) => {
//         if (loading) return

//         setLoading(true)
//         try {
//             const params = {
//                 sort: filter,
//                 page: initial ? 1 : page + 1,
//                 page_size: 10
//             }

//             const response = await doubtAPI.getDoubts(params)
//             const newDoubts = response.data.results || response.data

//             setDoubts(initial ? newDoubts : [...doubts, ...newDoubts])
//             setPage(initial ? 1 : page + 1)

//             if (!response.data.next) {
//                 setHasMore(false)
//             }
//         } catch (error) {
//             console.error('Failed to load doubts:', error)
//         } finally {
//             setLoading(false)
//         }
//     }, [filter, page, doubts, loading])

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
//             {/* Sticky Header */}
//             {/* <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
//                 <div className="max-w-2xl mx-auto px-4 py-4">
//                     <div className="flex items-center justify-between mb-4">
//                         <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
//                             MIND MINGLE
//                         </h1>
//                         <FeedFilters filter={filter} onFilterChange={setFilter} />
//                     </div>
//                 </div>
//             </div> */}

//             {/* Infinite Feed */}
//             <div className="max-w-2xl mx-auto px-4 py-8 space-y-4 pb-24">
//                 {doubts.map((doubt) => (
//                     <DoubtFeedCard key={doubt.id} doubt={doubt} />
//                 ))}

//                 {/* Loading Spinner */}
//                 {loading && (
//                     <div className="flex justify-center py-12">
//                         <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
//                     </div>
//                 )}

//                 {/* End of Feed */}
//                 {doubts.length > 0 && !hasMore && (
//                     <div className="text-center py-12 text-gray-500">
//                         🎉 You've caught up!
//                     </div>
//                 )}

//                 {/* Intersection Observer */}
//                 <div ref={ref} className="h-20"></div>
//             </div>
//         </div>
//     )
// }


import { useState, useEffect, useCallback } from 'react'
import { useInView } from 'react-intersection-observer'
import { useAuth } from '../hooks/useAuth'
import { doubtAPI } from '../services/api'
import DoubtFeedCard from '../components/DoubtCard/DoubtFeedcard'
import { Clock, TrendingUp, HelpCircle, PenSquare } from 'lucide-react'
import { Link } from 'react-router-dom'

const TABS = [
    { id: 'recent', label: 'Recent', icon: <Clock size={14} /> },
    { id: 'trending', label: 'Trending', icon: <TrendingUp size={14} /> },
    { id: 'unanswered', label: 'Unanswered', icon: <HelpCircle size={14} /> },
]

export default function Home() {
    const { user, isAuthenticated } = useAuth()
    const [doubts, setDoubts] = useState([])
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [filter, setFilter] = useState('recent')
    const [page, setPage] = useState(1)
    const { ref, inView } = useInView()

    useEffect(() => {
        setDoubts([])
        setPage(1)
        setHasMore(true)
        loadDoubts(1, true)
    }, [filter])

    useEffect(() => {
        if (inView && hasMore && !loading) {
            loadDoubts(page + 1)
        }
    }, [inView])

    const loadDoubts = useCallback(async (pageNum = 1, reset = false) => {
        if (loading) return
        setLoading(true)
        try {
            const response = await doubtAPI.getDoubts({
                sort: filter,
                page: pageNum,
                page_size: 10
            })
            const newDoubts = response.data.results || response.data
            setDoubts(prev => reset ? newDoubts : [...prev, ...newDoubts])
            setPage(pageNum)
            if (!response.data.next) setHasMore(false)
        } catch (error) {
            console.error('Failed to load doubts:', error)
        } finally {
            setLoading(false)
        }
    }, [filter, loading])

    return (
        <div className="min-h-screen bg-gray-950">
            <div className="max-w-2xl mx-auto px-4 py-6 pb-24">

                {/* Quick ask bar */}
                {isAuthenticated && (
                    <Link
                        to="/ask"
                        className="flex items-center gap-3 bg-gray-900 border border-gray-800 hover:border-violet-500/40 rounded-2xl px-5 py-4 mb-6 transition-all group"
                    >
                        <div className="w-9 h-9 bg-violet-500/10 border border-violet-500/20 rounded-full flex items-center justify-center text-violet-400 font-bold text-sm flex-shrink-0">
                            {user?.username?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-slate-500 text-sm group-hover:text-slate-400 transition-colors flex-1">
                            What's your doubt today?
                        </span>
                        <div className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl">
                            <PenSquare size={12} />
                            Ask
                        </div>
                    </Link>
                )}

                {/* Tabs */}
                <div className="flex bg-gray-900 border border-gray-800 rounded-2xl p-1 mb-6">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${filter === tab.id
                                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Feed */}
                <div className="space-y-4">
                    {doubts.map(doubt => (
                        <DoubtFeedCard key={doubt.id} doubt={doubt} />
                    ))}
                </div>

                {/* Loading spinner */}
                {loading && (
                    <div className="flex justify-center py-10">
                        <div className="w-8 h-8 border-2 border-gray-800 border-t-violet-500 rounded-full animate-spin" />
                    </div>
                )}

                {/* Empty state */}
                {!loading && doubts.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4">🤔</div>
                        <div className="text-slate-400 font-semibold">No doubts yet</div>
                        <div className="text-slate-600 text-sm mt-1">Be the first to ask something!</div>
                        <Link to="/ask" className="inline-block mt-4 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all">
                            Ask a doubt
                        </Link>
                    </div>
                )}

                {/* End of feed */}
                {doubts.length > 0 && !hasMore && !loading && (
                    <div className="text-center py-10 text-slate-600 text-sm">
                        🎉 You've caught up!
                    </div>
                )}

                {/* Intersection observer trigger */}
                <div ref={ref} className="h-10" />
            </div>
        </div>
    )
}