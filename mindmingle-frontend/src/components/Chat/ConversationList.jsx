// export default function ConversationList({
//     conversations,
//     selectedConversation,
//     setSelectedConversation
// }) {

//     return (

//         <div className="w-80 border-r border-gray-800 bg-gray-900 flex flex-col">

//             {/* HEADER */}
//             <div className="p-4 border-b border-gray-800">

//                 <h1 className="text-white font-bold text-xl">
//                     CHATS
//                 </h1>

//             </div>

//             {/* CONVERSATIONS */}
//             <div className="flex-1 overflow-y-auto">

//                 {conversations.map(conversation => (

//                     <button
//                         key={conversation.id}
//                         onClick={() => setSelectedConversation(conversation)}
//                         className={`
//                             w-full
//                             p-4
//                             border-b
//                             border-gray-800
//                             text-left
//                             hover:bg-gray-800
//                             transition-all

//                             ${selectedConversation?.id === conversation.id
//                                 ? 'bg-gray-800'
//                                 : ''
//                             }
//                         `}
//                     >

//                         <div className="flex items-center gap-3">

//                             {/* avatar */}
//                             <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold">

//                                 {conversation.name?.[0]?.toUpperCase() || 'C'}

//                             </div>

//                             <div className="flex-1">

//                                 <h2 className="text-white font-semibold">
//                                     {conversation.name || 'Conversation'}
//                                 </h2>

//                                 <p className="text-slate-500 text-sm truncate">
//                                     Tap to open chat
//                                 </p>

//                             </div>

//                         </div>

//                     </button>
//                 ))}

//             </div>

//         </div>
//     )
// }


import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Trash2, MessageSquareX } from 'lucide-react'

export default function ConversationList({
    conversations,
    selectedConversation,
    setSelectedConversation,
    onDeleteConversation,
    onClearConversation,
}) {
    const [openMenuId, setOpenMenuId] = useState(null)
    const menuRef = useRef(null)

    useEffect(() => {
        if (!openMenuId) return
        const handleClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpenMenuId(null)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [openMenuId])

    return (
        <div className="w-80 border-r border-gray-800 bg-gray-900 flex flex-col">

            {/* HEADER */}
            <div className="p-4 border-b border-gray-800">
                <h1 className="text-white font-bold text-xl">CHATS</h1>
            </div>

            {/* CONVERSATIONS */}
            <div className="flex-1 overflow-y-auto">
                {conversations.map(conversation => (
                    <div
                        key={conversation.id}
                        className={`group relative border-b border-gray-800 transition-all ${selectedConversation?.id === conversation.id
                            ? 'bg-gray-800'
                            : 'hover:bg-gray-800'
                            }`}
                    >
                        {/* Main row — clicking selects the conversation */}
                        <button
                            onClick={() => setSelectedConversation(conversation)}
                            className="w-full p-4 text-left pr-12"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                    {conversation.name?.[0]?.toUpperCase() || 'C'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-white font-semibold truncate">
                                        {conversation.name || 'Conversation'}
                                    </h2>
                                    <p className="text-slate-500 text-sm truncate">
                                        Tap to open chat
                                    </p>
                                </div>
                            </div>
                        </button>

                        {/* ⋮ button — appears on hover */}
                        <div
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                            ref={openMenuId === conversation.id ? menuRef : null}
                        >
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setOpenMenuId(id =>
                                        id === conversation.id ? null : conversation.id
                                    )
                                }}
                                className={`p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-700 transition-all ${openMenuId === conversation.id
                                    ? 'opacity-100 bg-gray-700 text-gray-300'
                                    : 'opacity-0 group-hover:opacity-100'
                                    }`}
                            >
                                <MoreVertical size={16} />
                            </button>

                            {/* Dropdown */}
                            {openMenuId === conversation.id && (
                                <div className="absolute right-0 top-8 z-30 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl py-1 min-w-40 overflow-hidden">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onClearConversation(conversation.id)
                                            setOpenMenuId(null)
                                        }}
                                        className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-slate-300 hover:bg-gray-800 hover:text-white transition-colors"
                                    >
                                        <MessageSquareX size={15} className="text-amber-400" />
                                        Clear chat
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onDeleteConversation(conversation.id)
                                            setOpenMenuId(null)
                                        }}
                                        className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-slate-300 hover:bg-gray-800 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={15} className="text-red-400" />
                                        Delete chat
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}