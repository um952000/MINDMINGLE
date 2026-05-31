import { useState, useEffect, useCallback } from 'react'
import { useInView } from 'react-intersection-observer'
import { useAuth } from '../hooks/useAuth'
import { doubtAPI } from '../services/api'
import DoubtFeedCard from '../components/DoubtCard/DoubtFeedcard'
import { Clock, TrendingUp, HelpCircle, PenSquare, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

const TABS = [
    { id: 'recent', label: 'Recent', icon: <Clock size={14} /> },
    { id: 'trending', label: 'Trending', icon: <TrendingUp size={14} /> },
    { id: 'unanswered', label: 'Unanswered', icon: <HelpCircle size={14} /> },
]

export default function Home() {
    const { user, isAuthenticated } = useAuth()
    const location = useLocation()
    const [doubts, setDoubts] = useState([])
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [filter, setFilter] = useState('recent')
    const [page, setPage] = useState(1)
    const { ref, inView } = useInView()
    // read search query from URL
    const searchQuery = new URLSearchParams(location.search).get('search') || ''

    // reset + reload whenever filter OR search changes
    useEffect(() => {
        setDoubts([])
        setPage(1)
        setHasMore(true)
        loadDoubts(1, true, searchQuery)
    }, [filter, searchQuery])

    useEffect(() => {
        if (inView && hasMore && !loading) {
            loadDoubts(page + 1, false, searchQuery)
        }
    }, [inView])

    const loadDoubts = useCallback(async (pageNum = 1, reset = false, search = '') => {
        if (loading) return
        setLoading(true)
        try {
            const response = await doubtAPI.getDoubts({
                sort: filter,
                page: pageNum,
                page_size: 10,
                ...(search ? { search } : {})   // only add if non-empty
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


                {/* Search context banner — shows when searching */}
                {searchQuery && (
                    <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                        <Search className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                        <p className="text-sm text-violet-300 flex-1">
                            Results for <span className="font-semibold">"{searchQuery}"</span>
                        </p>
                    </div>
                )}

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