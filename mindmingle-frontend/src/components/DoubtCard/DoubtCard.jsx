// // import { Link } from 'react-router-dom'
// // import { ArrowUp, MessageCircle, Eye } from 'lucide-react'

// // export default function DoubtCard({ doubt }) {
// //     return (
// //         <Link to={`/doubts/${doubt.id}`} className="card group">
// //             {/* Header */}
// //             <div className="flex items-center gap-2 mb-3">
// //                 {doubt.tags.slice(0, 2).map((tag, i) => (
// //                     <span
// //                         key={i}
// //                         className="px-3 py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-medium"
// //                     >
// //                         {tag}
// //                     </span>
// //                 ))}
// //                 {doubt.tags.length > 2 && (
// //                     <span className="text-gray-500 text-xs">+{doubt.tags.length - 2}</span>
// //                 )}
// //             </div>

// //             {/* Title */}
// //             <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
// //                 {doubt.title}
// //             </h3>

// //             {/* Stats */}
// //             <div className="flex items-center justify-between text-sm text-gray-500">
// //                 <div className="flex items-center gap-6">
// //                     <div className="flex items-center gap-1">
// //                         <ArrowUp className="w-4 h-4 text-green-500" />
// //                         <span>{doubt.upvotes}</span>
// //                     </div>
// //                     <div className="flex items-center gap-1">
// //                         <MessageCircle className="w-4 h-4" />
// //                         <span>{doubt.answers}</span>
// //                     </div>
// //                 </div>
// //                 <div className="flex items-center gap-1">
// //                     <Eye className="w-4 h-4" />
// //                     <span>{doubt.views || 0}</span>
// //                 </div>
// //             </div>
// //         </Link>
// //     )
// // }


// import { Link } from 'react-router-dom'
// import { ArrowUp, MessageCircle, Eye } from 'lucide-react'

// export default function DoubtCard({ doubt }) {
//     return (
//         <Link
//             to={`/doubts/${doubt.id}`}
//             className="block bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group"
//         >

//             {/* User Info */}
//             <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center gap-3">
//                     <img
//                         src={doubt.authorAvatar || "https://i.pravatar.cc/40"}
//                         alt="user"
//                         className="w-10 h-10 rounded-full"
//                     />
//                     <div>
//                         <p className="text-sm font-semibold text-gray-800">
//                             {doubt.author || "Anonymous"}
//                         </p>
//                         <p className="text-xs text-gray-500">
//                             {doubt.createdAt || "Just now"}
//                         </p>
//                     </div>
//                 </div>

//                 {/* Tags */}
//                 <div className="flex gap-2">
//                     {doubt.tags.slice(0, 2).map((tag, i) => (
//                         <span
//                             key={i}
//                             className="px-3 py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-medium"
//                         >
//                             {tag}
//                         </span>
//                     ))}
//                 </div>
//             </div>

//             {/* Title */}
//             <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
//                 {doubt.title}
//             </h3>

//             {/* Description Preview */}
//             <p className="text-gray-600 text-sm mb-4 line-clamp-2">
//                 {doubt.description || "Click to read full question..."}
//             </p>

//             {/* Interaction Stats */}
//             <div className="flex items-center justify-between pt-3 border-t text-gray-500 text-sm">

//                 <div className="flex items-center gap-6">

//                     {/* Upvotes */}
//                     <div className="flex items-center gap-1 hover:text-green-600 transition">
//                         <ArrowUp className="w-4 h-4" />
//                         <span>{doubt.upvotes}</span>
//                     </div>

//                     {/* Answers */}
//                     <div className="flex items-center gap-1 hover:text-blue-600 transition">
//                         <MessageCircle className="w-4 h-4" />
//                         <span>{doubt.answers}</span>
//                     </div>

//                     {/* Views */}
//                     <div className="flex items-center gap-1 hover:text-purple-600 transition">
//                         <Eye className="w-4 h-4" />
//                         <span>{doubt.views || 0}</span>
//                     </div>

//                 </div>

//             </div>

//         </Link>
//     )
// }

// src/components/doubt/DoubtCard.jsx
// import { Link } from 'react-router-dom'
// import { ArrowUp, MessageCircle, Eye } from 'lucide-react'
// import { doubtAPI } from '../../services/api'

// export default function DoubtCard({ doubt }) {
//     const handleUpvote = async () => {
//         try {
//             await doubtAPI.upvoteDoubt(doubt.id)
//             // Optimistic update will be handled by parent refetch
//         } catch (error) {
//             console.error('Upvote failed:', error)
//         }
//     }

//     return (
//         <Link to={`/doubts/${doubt.id}`} className="card group">
//             {/* Tags */}
//             <div className="flex items-center gap-2 mb-3 flex-wrap">
//                 {doubt.tags.map(tag => (
//                     <span
//                         key={tag.id}
//                         className="px-3 py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-medium"
//                     >
//                         {tag.name}
//                     </span>
//                 ))}
//             </div>

//             {/* Title */}
//             <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
//                 {doubt.title}
//             </h3>

//             {/* Stats */}
//             <div className="flex items-center justify-between text-sm text-gray-500">
//                 <div className="flex items-center gap-6">
//                     <div className="flex items-center gap-1 cursor-pointer hover:text-green-600" onClick={(e) => { e.preventDefault(); handleUpvote() }}>
//                         <ArrowUp className="w-4 h-4" />
//                         <span>{doubt.upvotes_count}</span>
//                     </div>
//                     <div className="flex items-center gap-1">
//                         <MessageCircle className="w-4 h-4" />
//                         <span>{doubt.answers_count}</span>
//                     </div>
//                 </div>
//                 <div className="flex items-center gap-1">
//                     <Eye className="w-4 h-4" />
//                     <span>{doubt.views_count}</span>
//                 </div>
//             </div>
//         </Link>
//     )
// }

// src/components/doubt/DoubtCard.jsx
import { Link } from 'react-router-dom'
import { ArrowUp, MessageCircle, Eye, Tag } from 'lucide-react'
import { doubtAPI } from '../../services/api'

export default function DoubtCard({ doubt }) {
    const handleUpvote = async (e) => {
        e.preventDefault()
        try {
            await doubtAPI.upvoteDoubt(doubt.id)
        } catch (error) {
            console.error('Upvote failed:', error)
        }
    }

    const timeAgo = (dateStr) => {
        if (!dateStr) return ''
        const diff = Date.now() - new Date(dateStr)
        const mins = Math.floor(diff / 60000)
        if (mins < 60) return `${mins}m ago`
        const hrs = Math.floor(mins / 60)
        if (hrs < 24) return `${hrs}h ago`
        return `${Math.floor(hrs / 24)}d ago`
    }

    return (
        <Link
            to={`/doubts/${doubt.id}`}
            className="group block w-full"
            style={{ textDecoration: 'none' }}
        >
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px 28px',
                marginBottom: '12px',
                border: '1.5px solid #f0f0f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                position: 'relative',
                overflow: 'hidden',
            }}
                onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.10)'
                    e.currentTarget.style.borderColor = '#c7d2fe'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'
                    e.currentTarget.style.borderColor = '#f0f0f0'
                    e.currentTarget.style.transform = 'translateY(0)'
                }}
            >
                {/* Accent bar */}
                <div style={{
                    position: 'absolute', top: 0, left: 0,
                    width: '4px', height: '100%',
                    background: 'linear-gradient(180deg, #6366f1, #818cf8)',
                    borderRadius: '16px 0 0 16px',
                    opacity: 0.7,
                }} />

                {/* Top row: author + time */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '34px', height: '34px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1, #a5b4fc)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: '700', fontSize: '13px',
                            flexShrink: 0,
                        }}>
                            {doubt.author?.username?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '13px', color: '#374151' }}>
                                {doubt.author?.username || 'Anonymous'}
                            </div>
                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                                {timeAgo(doubt.created_at)}
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {doubt.tags?.slice(0, 2).map(tag => (
                            <span key={tag.id} style={{
                                padding: '3px 10px',
                                background: '#eef2ff',
                                color: '#6366f1',
                                borderRadius: '999px',
                                fontSize: '11px',
                                fontWeight: '600',
                                letterSpacing: '0.02em',
                            }}>
                                {tag.name}
                            </span>
                        ))}
                        {doubt.tags?.length > 2 && (
                            <span style={{
                                padding: '3px 10px', background: '#f3f4f6',
                                color: '#6b7280', borderRadius: '999px',
                                fontSize: '11px', fontWeight: '600',
                            }}>
                                +{doubt.tags.length - 2}
                            </span>
                        )}
                    </div>
                </div>

                {/* Title */}
                <h3 style={{
                    fontSize: '17px', fontWeight: '700',
                    color: '#111827', lineHeight: '1.5',
                    margin: 0, paddingLeft: '4px',
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                    {doubt.title}
                </h3>

                {/* Divider */}
                <div style={{ height: '1px', background: '#f3f4f6', margin: '0 4px' }} />

                {/* Stats row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingLeft: '4px' }}>
                    <button
                        onClick={handleUpvote}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            color: '#6b7280', background: 'none', border: 'none',
                            cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                            padding: '4px 10px', borderRadius: '8px',
                            transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = '#f0fdf4'
                            e.currentTarget.style.color = '#16a34a'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'none'
                            e.currentTarget.style.color = '#6b7280'
                        }}
                    >
                        <ArrowUp size={15} />
                        {doubt.upvotes_count ?? 0}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#6b7280', fontSize: '13px', fontWeight: '600' }}>
                        <MessageCircle size={15} />
                        {doubt.answers_count ?? 0}
                        <span style={{ color: '#d1d5db', fontSize: '11px' }}>answers</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#6b7280', fontSize: '13px', fontWeight: '600', marginLeft: 'auto' }}>
                        <Eye size={15} />
                        {doubt.views_count ?? 0}
                    </div>
                </div>
            </div>
        </Link>
    )
}