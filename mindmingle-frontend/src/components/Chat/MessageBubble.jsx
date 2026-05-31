// import { useAuth } from '../../hooks/useAuth'
// import { FileText, Music } from 'lucide-react'

// const formatTime = (timestamp) => {
//     if (!timestamp) return ''
//     return new Date(timestamp).toLocaleTimeString([], {
//         hour: '2-digit',
//         minute: '2-digit'
//     })
// }

// export default function MessageBubble({ message }) {
//     const { user } = useAuth()

//     if (!message) return null

//     const isMine = user?.id === message.sender

//     const bubbleBase = `max-w-xs rounded-2xl text-sm overflow-hidden ${isMine ? 'bg-violet-600 text-white' : 'bg-gray-800 text-slate-200'
//         }`

//     const timeClass = `text-xs mt-1 text-right ${isMine ? 'text-violet-200' : 'text-slate-400'
//         }`

//     const renderContent = () => {

//         if (message.message_type === 'image' && message.file) {
//             return (
//                 <div>
//                     <img
//                         src={message.file}
//                         alt="sent image"
//                         className="w-60 rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
//                         onClick={() => window.open(message.file, '_blank')}
//                     />
//                     <p className={`${timeClass} px-2 pb-1`}>
//                         {formatTime(message.created_at)}
//                     </p>
//                 </div>
//             )
//         }

//         if (message.message_type === 'video' && message.file) {
//             return (
//                 <div>
//                     <video src={message.file} controls className="w-60 rounded-xl" />
//                     <p className={`${timeClass} px-2 pb-1`}>
//                         {formatTime(message.created_at)}
//                     </p>
//                 </div>
//             )
//         }

//         if (message.message_type === 'audio' && message.file) {
//             return (
//                 <div className="px-3 py-2">
//                     <div className="flex items-center gap-2 mb-2">
//                         <Music size={14} className={isMine ? 'text-violet-200' : 'text-green-400'} />
//                         <span className="text-xs opacity-70">Audio message</span>
//                     </div>
//                     <audio controls className="w-52 h-8">
//                         <source src={message.file} />
//                     </audio>
//                     <p className={timeClass}>{formatTime(message.created_at)}</p>
//                 </div>
//             )
//         }

//         if (message.message_type === 'document' && message.file) {
//             const fileName = message.file.split('/').pop().split('?')[0]
//             const ext = fileName.split('.').pop().toUpperCase()

//             return (
//                 <a
//                     href={message.file}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="flex items-center gap-3 px-4 py-3 hover:opacity-80 transition-opacity"
//                 >
//                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isMine ? 'bg-violet-500' : 'bg-gray-700'
//                         }`}>
//                         <FileText size={18} className={isMine ? 'text-white' : 'text-orange-400'} />
//                     </div>
//                     <div className="min-w-0">
//                         <p className="truncate max-w-36 font-medium text-sm">
//                             {fileName}
//                         </p>
//                         <p className={`text-xs ${isMine ? 'text-violet-200' : 'text-slate-400'}`}>
//                             {ext} • Tap to open
//                         </p>
//                     </div>
//                 </a>
//             )
//         }

//         // default text
//         return (
//             <div className="px-4 py-2">
//                 <p className="break-words">{message.content || ''}</p>
//                 <p className={timeClass}>{formatTime(message.created_at)}</p>
//             </div>
//         )
//     }

//     return (
//         <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
//             <div className={bubbleBase}>
//                 {renderContent()}
//             </div>
//         </div>
//     )
// }



import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import {
    FileText,
    Music,
    MoreVertical,
    Edit,
    Trash2
} from 'lucide-react'

const formatTime = (timestamp) => {
    if (!timestamp) return ''

    return new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    })
}

export default function MessageBubble({
    message,
    onEdit,
    onDelete
}) {

    const { user } = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)

    if (!message) return null

    const isMine = user?.id === message.sender

    // const bubbleBase = `
    //     max-w-xs rounded-2xl text-sm overflow-hidden
    //     ${isMine
    //         ? 'bg-violet-600 text-white'
    //         : 'bg-gray-800 text-slate-200'
    //     }
    // `

    const bubbleBase = `
    max-w-xs
    rounded-2xl
    text-sm
    overflow-hidden
    relative
    ${isMine
            ? 'bg-violet-600 text-white'
            : 'bg-gray-800 text-slate-200'
        }
`

    const timeClass = `
        text-xs mt-1 text-right
        ${isMine
            ? 'text-violet-200'
            : 'text-slate-400'
        }
    `

    const renderContent = () => {

        if (message.message_type === 'image' && message.file) {
            return (
                <div>
                    <img
                        src={message.file}
                        alt="sent image"
                        className="w-60 rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(message.file, '_blank')}
                    />
                    <p className={`${timeClass} px-2 pb-1`}>
                        {formatTime(message.created_at)}
                    </p>
                </div>
            )
        }

        if (message.message_type === 'video' && message.file) {
            return (
                <div>
                    <video
                        src={message.file}
                        controls
                        className="w-60 rounded-xl"
                    />
                    <p className={`${timeClass} px-2 pb-1`}>
                        {formatTime(message.created_at)}
                    </p>
                </div>
            )
        }

        if (message.message_type === 'audio' && message.file) {
            return (
                <div className="px-3 py-2">

                    <div className="flex items-center gap-2 mb-2">
                        <Music
                            size={14}
                            className={
                                isMine
                                    ? 'text-violet-200'
                                    : 'text-green-400'
                            }
                        />
                        <span className="text-xs opacity-70">
                            Audio message
                        </span>
                    </div>

                    <audio controls className="w-52 h-8">
                        <source src={message.file} />
                    </audio>

                    <p className={timeClass}>
                        {formatTime(message.created_at)}
                    </p>

                </div>
            )
        }

        if (message.message_type === 'document' && message.file) {

            const fileName = message.file
                .split('/')
                .pop()
                .split('?')[0]

            const ext = fileName
                .split('.')
                .pop()
                .toUpperCase()

            return (
                <a
                    href={message.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 hover:opacity-80 transition-opacity"
                >

                    <div
                        className={`
                            w-10 h-10 rounded-xl
                            flex items-center justify-center
                            flex-shrink-0
                            ${isMine
                                ? 'bg-violet-500'
                                : 'bg-gray-700'
                            }
                        `}
                    >
                        <FileText
                            size={18}
                            className={
                                isMine
                                    ? 'text-white'
                                    : 'text-orange-400'
                            }
                        />
                    </div>

                    <div className="min-w-0">
                        <p className="truncate max-w-36 font-medium text-sm">
                            {fileName}
                        </p>

                        <p
                            className={`
                                text-xs
                                ${isMine
                                    ? 'text-violet-200'
                                    : 'text-slate-400'
                                }
                            `}
                        >
                            {ext} • Tap to open
                        </p>
                    </div>

                </a>
            )
        }

        return (
            <div className="px-4 py-2">
                <p className="break-words">
                    {message.content || ''}
                </p>

                <p className={timeClass}>
                    {formatTime(message.created_at)}
                </p>
            </div>
        )
    }

    // return (
    //     <div
    //         className={`flex ${isMine
    //             ? 'justify-end'
    //             : 'justify-start'
    //             }`}
    //     >

    //         <div className="relative">

    //             {isMine && (
    //                 <>
    //                     <button
    //                         onClick={() => setMenuOpen(prev => !prev)}
    //                         className="
    //                             absolute
    //                             top-2
    //                             right-2
    //                             z-20
    //                             p-1
    //                             rounded-full
    //                             bg-black/20
    //                             hover:bg-black/40
    //                             text-white
    //                         "
    //                     >
    //                         <MoreVertical size={14} />
    //                     </button>

    //                     {menuOpen && (
    //                         <>
    //                             <div
    //                                 className="fixed inset-0 z-40"
    //                                 onClick={() => setMenuOpen(false)}
    //                             />

    //                             <div className="absolute right-0 top-8 z-50 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden min-w-32">

    //                                 {message.message_type === 'text' && (
    //                                     <button
    //                                         onClick={() => {
    //                                             onEdit(message)
    //                                             setMenuOpen(false)
    //                                         }}
    //                                         className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-gray-800"
    //                                     >
    //                                         <Edit size={14} />
    //                                         Edit
    //                                     </button>
    //                                 )}

    //                                 <button
    //                                     onClick={() => {
    //                                         onDelete(message)
    //                                         setMenuOpen(false)
    //                                     }}
    //                                     className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-800"
    //                                 >
    //                                     <Trash2 size={14} />
    //                                     Delete
    //                                 </button>

    //                             </div>
    //                         </>)}
    //                 </>
    //             )}

    //             <div className={bubbleBase}>
    //                 {renderContent()}
    //             </div>

    //         </div>

    //     </div>
    // )
    return (
        <div
            className={`flex ${isMine
                ? 'justify-end'
                : 'justify-start'
                }`}
        >

            <div className="relative group">

                {isMine && (
                    <>
                        <button
                            onClick={() => setMenuOpen(prev => !prev)}
                            className={`
                            absolute
                            -left-10
                            top-1/2
                            -translate-y-1/2
                            z-20
                            p-1.5
                            rounded-full
                            text-gray-400
                            hover:text-white
                            hover:bg-gray-800
                            transition-all
                            ${menuOpen
                                    ? 'opacity-100'
                                    : 'opacity-0 group-hover:opacity-100'
                                }
                        `}
                        >
                            <MoreVertical size={16} />
                        </button>

                        {menuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setMenuOpen(false)}
                                />

                                <div
                                    className="
                                    absolute
                                    right-full
                                    mr-2
                                    top-1/2
                                    -translate-y-1/2
                                    z-50
                                    bg-gray-900
                                    border
                                    border-gray-700
                                    rounded-xl
                                    shadow-xl
                                    overflow-hidden
                                    min-w-32
                                "
                                >

                                    {message.message_type === 'text' && (
                                        <button
                                            onClick={() => {
                                                onEdit(message)
                                                setMenuOpen(false)
                                            }}
                                            className="
                                            w-full
                                            flex
                                            items-center
                                            gap-2
                                            px-3
                                            py-2
                                            text-sm
                                            text-slate-300
                                            hover:bg-gray-800
                                        "
                                        >
                                            <Edit size={14} />
                                            Edit
                                        </button>
                                    )}

                                    <button
                                        onClick={() => {
                                            onDelete(message)
                                            setMenuOpen(false)
                                        }}
                                        className="
                                        w-full
                                        flex
                                        items-center
                                        gap-2
                                        px-3
                                        py-2
                                        text-sm
                                        text-red-400
                                        hover:bg-gray-800
                                    "
                                    >
                                        <Trash2 size={14} />
                                        Delete
                                    </button>

                                </div>
                            </>
                        )}
                    </>
                )}

                <div className={bubbleBase}>
                    {renderContent()}
                </div>

            </div>

        </div>
    )
}