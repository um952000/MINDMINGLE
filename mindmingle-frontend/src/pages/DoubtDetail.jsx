import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { doubtAPI, answerAPI, commentAPI, aiAPI } from '../services/api'
import {
    ArrowUp, ArrowDown, MessageCircle, CheckCircle,
    Eye, Send, Award, ChevronDown, ChevronUp,
    MoreVertical, ArrowLeft, Share2, Bot, Sparkles
} from 'lucide-react'

const REACTIONS = [
    { type: 'like', emoji: '👍', label: 'Like' },
    { type: 'love', emoji: '❤️', label: 'Love' },
    { type: 'insightful', emoji: '💡', label: 'Insightful' },
    { type: 'funny', emoji: '😄', label: 'Funny' },
    { type: 'dislike', emoji: '👎', label: 'Dislike' },
]

function ReactionPicker({ onReact, onClose }) {
    return (
        <div className="absolute bottom-full mb-2 left-0 bg-gray-800 border border-gray-700 rounded-2xl px-3 py-2 flex gap-2 z-50 shadow-xl">
            {REACTIONS.map(r => (
                <button
                    key={r.type}
                    onClick={() => { onReact(r.type); onClose() }}
                    className="flex flex-col items-center gap-1 hover:scale-125 transition-transform p-1"
                    title={r.label}
                >
                    <span className="text-xl">{r.emoji}</span>
                </button>
            ))}
        </div>
    )
}

function ReactionSummary({ reactions }) {
    if (!reactions || Object.keys(reactions).length === 0) return null
    return (
        <div className="flex gap-1.5 flex-wrap">
            {Object.entries(reactions).map(([type, count]) => {
                const r = REACTIONS.find(x => x.type === type)
                if (!r || count === 0) return null
                return (
                    <span key={type} className="flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-full px-2 py-0.5 text-xs text-slate-400">
                        <span>{r.emoji}</span> {count}
                    </span>
                )
            })}
        </div>
    )
}

function CommentSection({ parentId, parentType, comments, onAddComment, isAuthenticated }) {
    const [text, setText] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!text.trim()) return
        setSubmitting(true)
        await onAddComment(text, parentId, parentType)
        setText('')
        setSubmitting(false)
    }

    return (
        <div className="mt-3 pt-3 border-t border-gray-800">
            {/* ✅ scrollable comment list — max 2 visible, scroll for more */}
            {comments.length > 0 && (
                <div
                    className="overflow-y-auto pr-1 mb-3 space-y-2"
                    style={{ maxHeight: comments.length > 2 ? '160px' : 'auto' }}
                >
                    {comments.map(comment => (
                        <div key={comment.id} className="flex gap-2.5">
                            <Link to={`/profile/${comment.author?.id}`} className="flex-shrink-0">
                                <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                    {comment.author?.username?.[0]?.toUpperCase()}
                                </div>
                            </Link>
                            <div className="flex-1">
                                <div className="bg-gray-800 rounded-xl px-3 py-2">
                                    <Link to={`/profile/${comment.author?.id}`}>
                                        <span className="text-xs font-bold text-violet-400 hover:text-violet-300">
                                            {comment.author?.username}
                                        </span>
                                    </Link>
                                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Comment count indicator */}
            {comments.length > 2 && (
                <p className="text-xs text-slate-600 mb-2">
                    {comments.length} comments — scroll to see all
                </p>
            )}

            {/* Input */}
            {isAuthenticated && (
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                        placeholder="Write a comment..."
                        className="flex-1 bg-gray-800 border border-gray-700 text-slate-200 placeholder-slate-600 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-violet-500/50 transition-all"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !text.trim()}
                        className="p-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 rounded-lg transition-all flex-shrink-0"
                    >
                        <Send size={12} className="text-white" />
                    </button>
                </div>
            )}
        </div>
    )
}


// ✅ Collapsible answer component
function AnswerCard({
    answer, isDoubtAuthor, onUpvote, onDownvote,
    onReact, onAccept, onAddComment,
    isAuthenticated, showReactionPicker,
    setShowReactionPicker, timeAgo
}) {
    const [expanded, setExpanded] = useState(true)
    const isLong = answer.content?.length > 300

    return (
        <div className={`bg-gray-900 border rounded-2xl overflow-hidden transition-all ${answer.is_accepted
            ? 'border-green-500/40 shadow-lg shadow-green-500/5'
            : 'border-gray-800'
            }`}>
            {/* Accepted banner */}
            {answer.is_accepted && (
                <div className="bg-green-500/10 border-b border-green-500/20 px-5 py-2 flex items-center gap-2">
                    <Award size={14} className="text-green-400" />
                    <span className="text-green-400 text-xs font-bold">Accepted Answer</span>
                </div>
            )}

            {/* Answer header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <Link to={`/profile/${answer.author?.id}`} className="flex items-center gap-3 group">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {answer.author?.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-slate-200 text-sm group-hover:text-violet-400 transition-colors">
                            {answer.author?.username}
                        </p>
                        <p className="text-xs text-slate-500">{timeAgo(answer.created_at)}</p>
                    </div>
                </Link>

                <div className="flex items-center gap-2">
                    {/* Accept button */}
                    {isDoubtAuthor && !answer.is_accepted && (
                        <button
                            onClick={() => onAccept(answer.id)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-green-400 hover:bg-green-500/10 border border-gray-700 hover:border-green-500/30 px-3 py-1.5 rounded-xl transition-all"
                        >
                            <CheckCircle size={13} /> Accept
                        </button>
                    )}

                    {/* ✅ Collapse/expand toggle */}
                    {isLong && (
                        <button
                            onClick={() => setExpanded(e => !e)}
                            className="p-1.5 hover:bg-gray-800 rounded-lg text-slate-500 hover:text-slate-300 transition-all"
                            title={expanded ? 'Collapse answer' : 'Expand answer'}
                        >
                            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                    )}
                </div>
            </div>

            {/* Answer content — collapsible */}
            <div className="px-5 pt-4">
                <div className={`relative overflow-hidden transition-all duration-300 ${!expanded ? 'max-h-20' : 'max-h-none'
                    }`}>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {answer.content}
                    </p>

                    {/* Fade overlay when collapsed */}
                    {!expanded && (
                        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-gray-900 to-transparent" />
                    )}
                </div>

                {/* Show more / less button */}
                {isLong && (
                    <button
                        onClick={() => setExpanded(e => !e)}
                        className="text-violet-400 hover:text-violet-300 text-xs font-semibold mt-2 mb-1 flex items-center gap-1 transition-colors"
                    >
                        {expanded
                            ? <><ChevronUp size={12} /> Show less</>
                            : <><ChevronDown size={12} /> Read full answer</>
                        }
                    </button>
                )}

                {/* Reaction summary */}
                <div className="mt-2 mb-2">
                    <ReactionSummary reactions={answer.reactions_summary} />
                </div>
            </div>

            {/* Answer actions */}
            <div className="px-5 py-3 border-t border-gray-800 flex items-center gap-2 flex-wrap">
                <button
                    onClick={() => onUpvote(answer.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${answer.user_upvoted
                        ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                        : 'text-slate-500 hover:text-green-400 hover:bg-green-500/10'
                        }`}
                >
                    <ArrowUp size={14} /> {answer.upvotes_count || 0}
                </button>
                <button
                    onClick={() => onDownvote(answer.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${answer.user_downvoted
                        ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                        : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
                        }`}
                >
                    <ArrowDown size={14} /> {answer.downvotes_count || 0}
                </button>

                <div className="relative">
                    <button
                        onClick={() => setShowReactionPicker(p => p === answer.id ? null : answer.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-full text-sm font-medium transition-all"
                    >
                        😊 React
                    </button>
                    {showReactionPicker === answer.id && (
                        <ReactionPicker
                            onReact={(type) => onReact(answer.id, 'answer', type)}
                            onClose={() => setShowReactionPicker(null)}
                        />
                    )}
                </div>
            </div>

            {/* Answer comments */}
            <div className="px-5 pb-4">
                <CommentSection
                    parentId={answer.id}
                    parentType="answer"
                    comments={answer.comments || []}
                    onAddComment={onAddComment}
                    isAuthenticated={isAuthenticated}
                />
            </div>
        </div>
    )
}


export default function DoubtDetail() {
    const { id } = useParams()
    const navigate = useNavigate()

    const location = useLocation()
    const backPath = location.state?.from || '/'
    const { user, isAuthenticated } = useAuth()

    const [doubt, setDoubt] = useState(null)
    const [answers, setAnswers] = useState([])
    const [loading, setLoading] = useState(true)
    const [answerContent, setAnswerContent] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [showReactionPicker, setShowReactionPicker] = useState(null)
    const [copied, setCopied] = useState(false)

    const [aiLoading, setAiLoading] = useState(false)
    const [aiResponse, setAiResponse] = useState(null)
    const [showAIResponse, setShowAIResponse] = useState(false)

    useEffect(() => {

        if (window.location.hash) {

            const element = document.querySelector(window.location.hash)

            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    })
                }, 500)
            }
        }

    }, [answers])

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [doubtRes, answersRes, doubtCommentsRes] = await Promise.all([
                    doubtAPI.getDoubt(id),
                    answerAPI.getAnswersByDoubt(id),
                    commentAPI.getDoubtComments(id),
                ])

                const fetchedAnswers = answersRes.data.results || answersRes.data

                const answersWithComments = await Promise.all(
                    fetchedAnswers.map(async (answer) => {
                        const commentsRes = await commentAPI.getAnswerComments(answer.id)
                        return {
                            ...answer,
                            comments: commentsRes.data.results || commentsRes.data
                        }
                    })
                )

                setDoubt({
                    ...doubtRes.data,
                    comments: doubtCommentsRes.data.results || doubtCommentsRes.data
                })
                setAnswers(answersWithComments)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [id])

    const fetchAnswers = async () => {
        const res = await answerAPI.getAnswersByDoubt(id)
        const fetchedAnswers = res.data.results || res.data
        const answersWithComments = await Promise.all(
            fetchedAnswers.map(async (answer) => {
                const commentsRes = await commentAPI.getAnswerComments(answer.id)
                return { ...answer, comments: commentsRes.data.results || commentsRes.data }
            })
        )
        setAnswers(answersWithComments)
    }

    const handleShare = async () => {
        const url = `${window.location.origin}/doubts/${doubt.id}`
        try {
            if (navigator.share) {
                await navigator.share({
                    title: doubt.title,
                    text: `Check out this doubt on Mind Mingle:\n\n"${doubt.title}"\n\n${url}`,
                })
            } else {
                await navigator.clipboard.writeText(url)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            }
        } catch (e) { console.error(e) }
    }

    const handleUpvoteDoubt = async () => {
        try {
            const res = await doubtAPI.upvoteDoubt(id)
            setDoubt(d => ({
                ...d,
                upvotes_count: res.data.upvotes,
                downvotes_count: res.data.downvotes,
                user_upvoted: res.data.user_upvoted,     // ✅ from server
                user_downvoted: res.data.user_downvoted, // ✅ from server
            }))
        } catch (e) { console.error(e) }
    }

    const handleDownvoteDoubt = async () => {
        try {
            const res = await doubtAPI.downvoteDoubt(id)
            setDoubt(d => ({
                ...d,
                upvotes_count: res.data.upvotes,
                downvotes_count: res.data.downvotes,
                user_upvoted: res.data.user_upvoted,
                user_downvoted: res.data.user_downvoted,
            }))
        } catch (e) { console.error(e) }
    }

    const handleUpvoteAnswer = async (answerId) => {
        try {
            const res = await answerAPI.upvoteAnswer(answerId)
            setAnswers(prev => prev.map(a =>
                a.id === answerId ? {
                    ...a,
                    upvotes_count: res.data.upvotes,
                    downvotes_count: res.data.downvotes,
                    user_upvoted: res.data.user_upvoted,
                    user_downvoted: res.data.user_downvoted,
                } : a
            ))
        } catch (e) { console.error(e) }
    }

    const handleDownvoteAnswer = async (answerId) => {
        try {
            const res = await answerAPI.downvoteAnswer(answerId)
            setAnswers(prev => prev.map(a =>
                a.id === answerId ? {
                    ...a,
                    upvotes_count: res.data.upvotes,
                    downvotes_count: res.data.downvotes,
                    user_upvoted: res.data.user_upvoted,
                    user_downvoted: res.data.user_downvoted,
                } : a
            ))
        } catch (e) { console.error(e) }
    }

    const handleReact = async (targetId, targetType, reactionType) => {
        try {
            if (targetType === 'doubt') {
                await doubtAPI.reactDoubt(targetId, reactionType)
                const res = await doubtAPI.getDoubt(targetId)
                setDoubt(d => ({ ...d, reactions_summary: res.data.reactions_summary }))
            } else {
                await answerAPI.reactAnswer(targetId, reactionType)
                await fetchAnswers()
            }
        } catch (e) { console.error(e) }
        setShowReactionPicker(null)
    }

    const handleAcceptAnswer = async (answerId) => {
        try {
            await answerAPI.acceptAnswer(answerId)
            setAnswers(prev => prev.map(a => ({ ...a, is_accepted: a.id === answerId })))
            setDoubt(d => ({ ...d, is_resolved: true }))
        } catch (e) { console.error(e) }
    }

    const handleAddComment = async (content, parentId, parentType) => {
        try {
            if (parentType === 'doubt') {
                await commentAPI.commentOnDoubt(parentId, content)
                const res = await commentAPI.getDoubtComments(parentId)
                setDoubt(d => ({ ...d, comments: res.data.results || res.data }))
            } else {
                await commentAPI.commentOnAnswer(parentId, content)
                const res = await commentAPI.getAnswerComments(parentId)
                setAnswers(prev => prev.map(a =>
                    a.id === parentId ? { ...a, comments: res.data.results || res.data } : a
                ))
            }
        } catch (e) { console.error('Comment failed:', e) }
    }

    const handleSubmitAnswer = async (e) => {
        e.preventDefault()
        if (!answerContent.trim()) return
        setSubmitting(true)
        setError('')
        try {
            await answerAPI.createAnswer({ doubt: parseInt(id), content: answerContent })
            setAnswerContent('')
            await fetchAnswers()
            setDoubt(d => ({ ...d, answers_count: (d.answers_count || 0) + 1 }))
        } catch (err) {
            console.log(err)
            console.log(err.response?.data)
            setError('Failed to post answer')
        } finally {
            setSubmitting(false)
        }
    }

    const handleAskAI = async () => {

        if (!doubt) return

        try {

            setAiLoading(true)
            setShowAIResponse(true)

            const prompt = `
Title: ${doubt.title}

Content:
${doubt.content}

Please solve this programming doubt in a beginner friendly way.
Explain the issue clearly.
Give corrected code if needed.
`

            const response = await aiAPI.solveDoubt(prompt)

            console.log(response.data)

            // API returns { answer: "..." }
            setAiResponse(response.data)

        } catch (error) {

            console.error(error)

            setAiResponse({
                answer: 'Failed to generate AI response.'
            })

        } finally {

            setAiLoading(false)
        }
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

    if (loading) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-gray-800 border-t-violet-500 rounded-full animate-spin" />
        </div>
    )

    if (!doubt) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center text-slate-500">
            Doubt not found
        </div>
    )

    const isDoubtAuthor = user?.id === doubt.author?.id

    return (
        <div className="min-h-screen bg-gray-950 pb-20">
            <div className="max-w-3xl mx-auto px-4 py-6">

                {/* Back button */}
                <div
                    onClick={() => navigate(backPath)}
                    className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-gray-900 border border-gray-800 rounded-xl text-slate-400 hover:text-white hover:bg-gray-800 transition-all cursor-pointer"
                >
                    <ArrowLeft size={16} />
                    <span className="text-sm font-medium">{backPath.includes('/profile')
                        ? 'Back to Profile'
                        : 'All Doubts'}</span>
                </div>


                {/* ── DOUBT CARD ── */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-6">
                    <div className="p-5 border-b border-gray-800 flex items-center justify-between">
                        <Link to={`/profile/${doubt.author?.id}`} className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {doubt.author?.username?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold text-slate-200 text-sm group-hover:text-violet-400 transition-colors">
                                    {doubt.author?.username}
                                </p>
                                <p className="text-xs text-slate-500">{timeAgo(doubt.created_at)}</p>
                            </div>
                        </Link>
                        {doubt.is_resolved && (
                            <span className="flex items-center gap-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold px-2.5 py-1 rounded-full">
                                <CheckCircle size={12} /> Resolved
                            </span>
                        )}
                    </div>

                    <div className="p-5">
                        <h1 className="text-xl font-black text-white leading-tight mb-3">{doubt.title}</h1>
                        <p className="text-slate-300 text-sm leading-relaxed mb-4">{doubt.content}</p>

                        {doubt.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {doubt.tags.map(tag => (
                                    <span key={tag.id} className="px-2.5 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs rounded-full font-medium">
                                        #{tag.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        {doubt.images?.length > 0 && (
                            <div className={`grid gap-2 mb-4 rounded-xl overflow-hidden ${doubt.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                {doubt.images.map(image => (
                                    <img key={image.id} src={image.image} alt="" className="w-full h-56 object-cover rounded-xl" onError={e => e.target.style.display = 'none'} />
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                            <span className="flex items-center gap-1"><Eye size={12} /> {doubt.views_count || 0} views</span>
                            <span className="flex items-center gap-1"><MessageCircle size={12} /> {doubt.answers_count || 0} answers</span>
                        </div>

                        <ReactionSummary reactions={doubt.reactions_summary} />
                    </div>

                    {/* <div className="px-5 py-3 border-t border-gray-800 flex items-center gap-2 flex-wrap">
                        <button onClick={handleUpvoteDoubt} className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-green-400 hover:bg-green-500/10 rounded-full text-sm font-medium transition-all">
                            <ArrowUp size={15} /> {doubt.upvotes_count || 0}
                        </button>
                        <button onClick={handleDownvoteDoubt} className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-full text-sm font-medium transition-all">
                            <ArrowDown size={15} /> {doubt.downvotes_count || 0}
                        </button> */}
                    <div className="px-5 py-3 border-t border-gray-800 flex items-center gap-2 flex-wrap">
                        <button
                            onClick={handleUpvoteDoubt}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${doubt.user_upvoted
                                ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                                : 'text-slate-500 hover:text-green-400 hover:bg-green-500/10'
                                }`}
                        >
                            <ArrowUp size={15} className={doubt.user_upvoted ? 'fill-green-400' : ''} />
                            {doubt.upvotes_count || 0}
                        </button>
                        <button
                            onClick={handleDownvoteDoubt}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${doubt.user_downvoted
                                ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                                : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
                                }`}
                        >
                            <ArrowDown size={15} className={doubt.user_downvoted ? 'fill-red-400' : ''} />
                            {doubt.downvotes_count || 0}
                        </button>


                        <div className="relative">
                            <button
                                onClick={() => setShowReactionPicker(p => p === 'doubt' ? null : 'doubt')}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-full text-sm font-medium transition-all"
                            >
                                😊 React
                            </button>
                            {showReactionPicker === 'doubt' && (
                                <ReactionPicker
                                    onReact={(type) => handleReact(doubt.id, 'doubt', type)}
                                    onClose={() => setShowReactionPicker(null)}
                                />
                            )}
                        </div>

                        <button
                            onClick={handleShare}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ml-auto ${copied ? 'text-green-400 bg-green-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-gray-800'
                                }`}
                        >
                            {copied ? '✓ Copied!' : <><Share2 size={14} /> Share</>}
                        </button>

                        <button
                            onClick={handleAskAI}
                            disabled={aiLoading}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white text-sm font-semibold transition-all disabled:opacity-50"
                        >
                            {aiLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Thinking...
                                </>
                            ) : (
                                <>
                                    <Bot size={16} />
                                    Solve with AI
                                </>
                            )}
                        </button>

                    </div>

                    <div className="px-5 pb-5">
                        <CommentSection
                            parentId={doubt.id}
                            parentType="doubt"
                            comments={doubt.comments || []}
                            onAddComment={handleAddComment}
                            isAuthenticated={isAuthenticated}
                        />
                    </div>

                    {showAIResponse && (
                        <div className="mx-5 mb-5 bg-gradient-to-br from-violet-950/40 to-fuchsia-950/20 border border-violet-500/20 rounded-2xl overflow-hidden">

                            <div className="flex items-center gap-2 px-5 py-4 border-b border-violet-500/10">
                                <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                                    <Sparkles size={16} className="text-violet-400" />
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-white">
                                        AI Solution
                                    </h3>

                                    <p className="text-xs text-slate-400">
                                        Generated using AI
                                    </p>
                                </div>
                            </div>

                            <div className="p-5">

                                {aiLoading ? (
                                    <div className="flex items-center gap-3 text-slate-400 text-sm">
                                        <div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-400 rounded-full animate-spin" />
                                        AI is analyzing the doubt...
                                    </div>
                                ) : (
                                    <div className="text-sm text-slate-300 leading-7 whitespace-pre-wrap">
                                        {aiResponse?.answer}
                                    </div>
                                )}

                            </div>
                        </div>
                    )}
                </div>

                {/* ── ANSWERS SECTION ── */}
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-black text-white">
                        {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
                    </h2>
                    {doubt.is_resolved && (
                        <span className="text-xs text-green-400 font-semibold flex items-center gap-1">
                            <CheckCircle size={12} /> Resolved
                        </span>
                    )}
                </div>

                <div className="space-y-4 mb-6">
                    {answers.length === 0 && (
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
                            <div className="text-4xl mb-3">💬</div>
                            <p className="text-slate-400 font-semibold text-sm">No answers yet</p>
                            <p className="text-slate-600 text-xs mt-1">Be the first to help!</p>
                        </div>
                    )}

                    {answers.map(answer => (
                        <AnswerCard
                            key={answer.id}
                            answer={answer}
                            isDoubtAuthor={isDoubtAuthor}
                            onUpvote={handleUpvoteAnswer}
                            onDownvote={handleDownvoteAnswer}
                            onReact={handleReact}
                            onAccept={handleAcceptAnswer}
                            onAddComment={handleAddComment}
                            isAuthenticated={isAuthenticated}
                            showReactionPicker={showReactionPicker}
                            setShowReactionPicker={setShowReactionPicker}
                            timeAgo={timeAgo}
                        />
                    ))}
                </div>

                {/* ── POST ANSWER ── */}
                {isAuthenticated ? (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                        <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                            <MessageCircle size={15} className="text-violet-400" />
                            Your Answer
                        </h3>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-sm mb-4">
                                {error}
                            </div>
                        )}

                        <textarea
                            rows={5}
                            value={answerContent}
                            onChange={e => setAnswerContent(e.target.value)}
                            placeholder="Write a clear and helpful answer..."
                            className="w-full bg-gray-800 border border-gray-700 text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all resize-none"
                        />

                        <div className="flex justify-end mt-3">
                            <button
                                onClick={handleSubmitAnswer}
                                disabled={submitting || !answerContent.trim()}
                                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-violet-500/20"
                            >
                                {submitting ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Posting...</>
                                ) : (
                                    <><Send size={14} /> Post Answer</>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
                        <p className="text-slate-400 text-sm mb-4">Sign in to post an answer</p>
                        <Link to="/login" className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all">
                            Sign In
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}