import { useState, useRef, useEffect } from 'react'
import { Heart, MessageCircle, Share2, MoreVertical, Bookmark, X, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Pencil, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { doubtAPI } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

export default function DoubtFeedCard({ doubt, onDelete }) {
    const { user: authUser } = useAuth()
    const navigate = useNavigate()

    const [upvotes, setUpvotes] = useState(doubt.upvotes_count || 0)
    const [downvotes, setDownvotes] = useState(doubt.downvotes_count || 0)
    const [upvoted, setUpvoted] = useState(doubt.user_upvoted || false)
    const [downvoted, setDownvoted] = useState(doubt.user_downvoted || false)
    const [saved, setSaved] = useState(false)
    const [lightbox, setLightbox] = useState({ open: false, index: 0 })
    const [copied, setCopied] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const menuRef = useRef(null)

    const isAuthor = authUser?.id === doubt.author?.id ||
        authUser?.user_id === doubt.author?.id

    // close menu on outside click
    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false)
                setDeleteConfirm(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleDelete = async () => {
        if (!deleteConfirm) {
            setDeleteConfirm(true)
            return
        }
        try {
            setDeleting(true)
            await doubtAPI.deleteDoubt(doubt.id)
            setMenuOpen(false)
            onDelete?.(doubt.id)   // let parent remove it from list
        } catch (e) {
            console.error(e)
        } finally {
            setDeleting(false)
            setDeleteConfirm(false)
        }
    }

    const handleUpvote = async () => {
        try {
            const res = await doubtAPI.upvoteDoubt(doubt.id)
            setUpvotes(res.data.upvotes)
            setDownvotes(res.data.downvotes)
            setUpvoted(res.data.user_upvoted)
            setDownvoted(res.data.user_downvoted)
        } catch (e) { console.error(e) }
    }

    const handleDownvote = async () => {
        try {
            const res = await doubtAPI.downvoteDoubt(doubt.id)
            setUpvotes(res.data.upvotes)
            setDownvotes(res.data.downvotes)
            setUpvoted(res.data.user_upvoted)
            setDownvoted(res.data.user_downvoted)
        } catch (e) { console.error(e) }
    }

    const openLightbox = (e, idx) => {
        e.preventDefault()
        e.stopPropagation()
        setLightbox({ open: true, index: idx })
    }
    const closeLightbox = () => setLightbox({ open: false, index: 0 })
    const prevImage = (e) => {
        e.stopPropagation()
        setLightbox(lb => ({ ...lb, index: (lb.index - 1 + doubt.images.length) % doubt.images.length }))
    }
    const nextImage = (e) => {
        e.stopPropagation()
        setLightbox(lb => ({ ...lb, index: (lb.index + 1) % doubt.images.length }))
    }

    const timeAgo = (dateStr) => {
        if (!dateStr) return ''
        const diff = Date.now() - new Date(dateStr)
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return 'just now'
        if (mins < 60) return `${mins}m ago`
        const hrs = Math.floor(mins / 60)
        if (hrs < 24) return `${hrs}h ago`
        return `${Math.floor(hrs / 24)}d ago`
    }

    const handleShare = async () => {
        const url = `${window.location.origin}/doubts/${doubt.id}`
        try {
            if (navigator.share) {
                await navigator.share({ title: doubt.title, text: `Check out this doubt on Mind Mingle: ${doubt.title}`, url })
            } else {
                await navigator.clipboard.writeText(url)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            }
        } catch (e) { console.error(e) }
    }

    return (
        <>
            <article className="bg-gray-900 border border-gray-800 rounded-2xl hover:border-violet-500/30 transition-all duration-200 overflow-hidden">

                {/* Header */}
                <div className="p-5 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                        <Link to={`/profile/${doubt.author?.id}`} className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-500/20">
                                {doubt.author?.username?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold text-slate-200 text-sm group-hover:text-violet-400 transition-colors">
                                    {doubt.author?.username}
                                </p>
                                <p className="text-xs text-slate-500">{timeAgo(doubt.created_at)}</p>
                            </div>
                        </Link>

                        {/* More menu */}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => { setMenuOpen(o => !o); setDeleteConfirm(false) }}
                                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <MoreVertical className="w-4 h-4 text-slate-500" />
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 top-9 w-44 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
                                    {isAuthor ? (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setMenuOpen(false)
                                                    navigate(`/doubts/${doubt.id}/edit`)
                                                }}
                                                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-gray-800 hover:text-violet-400 transition-colors"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                                Edit doubt
                                            </button>

                                            <div className="h-px bg-gray-800" />

                                            <button
                                                onClick={handleDelete}
                                                disabled={deleting}
                                                className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors ${deleteConfirm
                                                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                                    : 'text-slate-300 hover:bg-gray-800 hover:text-red-400'
                                                    }`}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                {deleting ? 'Deleting...' : deleteConfirm ? 'Confirm delete' : 'Delete doubt'}
                                            </button>
                                        </>
                                    ) : (
                                        <button className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-gray-800 transition-colors">
                                            🚩 No actions available
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content — unchanged */}
                <div className="p-5">
                    <Link to={`/doubts/${doubt.id}`} state={{ from: '/' }}>
                        <h2 className="text-base font-bold text-slate-100 mb-2 line-clamp-2 leading-snug hover:text-violet-400 transition-colors">
                            {doubt.title}
                        </h2>
                    </Link>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-3 leading-relaxed">{doubt.content}</p>

                    {doubt.tags && doubt.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {doubt.tags.slice(0, 3).map(tag => (
                                <span key={tag.id} className="px-2.5 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs rounded-full font-medium">
                                    #{tag.name}
                                </span>
                            ))}
                        </div>
                    )}

                    {doubt.images && doubt.images.length > 0 && (
                        <div className={`grid gap-2 mb-4 rounded-xl overflow-hidden ${doubt.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                            {doubt.images.slice(0, 4).map((image, idx) => (
                                <div key={image.id} className="relative cursor-zoom-in" onClick={(e) => openLightbox(e, idx)}>
                                    <img
                                        src={image.image}
                                        alt="doubt attachment"
                                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                    {idx === 3 && doubt.images.length > 4 && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <span className="text-white font-bold text-xl">+{doubt.images.length - 4}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions — unchanged */}
                <div className="px-5 py-3 border-t border-gray-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button onClick={handleUpvote} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${upvoted ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'text-slate-500 hover:text-green-400 hover:bg-green-500/10'}`}>
                                <ArrowUp className="w-4 h-4" />{upvotes}
                            </button>
                            <button onClick={handleDownvote} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${downvoted ? 'bg-red-500/15 text-red-400 border border-red-500/20' : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'}`}>
                                <ArrowDown className="w-4 h-4" />{downvotes}
                            </button>
                            <Link to={`/doubts/${doubt.id}`} state={{ from: '/' }} className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-full text-sm font-medium transition-all">
                                <MessageCircle className="w-4 h-4" />{doubt.answers_count}
                            </Link>
                            <button onClick={handleShare} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${copied ? 'text-green-400 bg-green-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-gray-800'}`}>
                                {copied ? <>✓ Copied!</> : <><Share2 className="w-4 h-4" /> Share</>}
                            </button>
                        </div>
                        <button onClick={() => setSaved(s => !s)} className={`p-2 rounded-full transition-all ${saved ? 'text-violet-400 bg-violet-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-gray-800'}`}>
                            <Bookmark className={`w-4 h-4 ${saved ? 'fill-violet-400' : ''}`} />
                        </button>
                    </div>
                </div>
            </article>

            {/* Lightbox — unchanged */}
            {lightbox.open && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={closeLightbox}>
                    <button onClick={closeLightbox} className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all">
                        <X className="w-6 h-6" />
                    </button>
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm bg-white/10 px-3 py-1 rounded-full">
                        {lightbox.index + 1} / {doubt.images.length}
                    </div>
                    {doubt.images.length > 1 && (
                        <button onClick={prevImage} className="absolute left-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}
                    <img src={doubt.images[lightbox.index].image} alt="full view" className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
                    {doubt.images.length > 1 && (
                        <button onClick={nextImage} className="absolute right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all">
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    )}
                </div>
            )}
        </>
    )
}

