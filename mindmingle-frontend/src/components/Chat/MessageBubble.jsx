import { useAuth } from '../../hooks/useAuth'
import { FileText, Music } from 'lucide-react'

const formatTime = (timestamp) => {
    if (!timestamp) return ''
    return new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    })
}

export default function MessageBubble({ message }) {
    const { user } = useAuth()

    if (!message) return null

    const isMine = user?.id === message.sender

    const bubbleBase = `max-w-xs rounded-2xl text-sm overflow-hidden ${isMine ? 'bg-violet-600 text-white' : 'bg-gray-800 text-slate-200'
        }`

    const timeClass = `text-xs mt-1 text-right ${isMine ? 'text-violet-200' : 'text-slate-400'
        }`

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
                    <video src={message.file} controls className="w-60 rounded-xl" />
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
                        <Music size={14} className={isMine ? 'text-violet-200' : 'text-green-400'} />
                        <span className="text-xs opacity-70">Audio message</span>
                    </div>
                    <audio controls className="w-52 h-8">
                        <source src={message.file} />
                    </audio>
                    <p className={timeClass}>{formatTime(message.created_at)}</p>
                </div>
            )
        }

        if (message.message_type === 'document' && message.file) {
            const fileName = message.file.split('/').pop().split('?')[0]
            const ext = fileName.split('.').pop().toUpperCase()

            return (
                <a
                    href={message.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 hover:opacity-80 transition-opacity"
                >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isMine ? 'bg-violet-500' : 'bg-gray-700'
                        }`}>
                        <FileText size={18} className={isMine ? 'text-white' : 'text-orange-400'} />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate max-w-36 font-medium text-sm">
                            {fileName}
                        </p>
                        <p className={`text-xs ${isMine ? 'text-violet-200' : 'text-slate-400'}`}>
                            {ext} • Tap to open
                        </p>
                    </div>
                </a>
            )
        }

        // default text
        return (
            <div className="px-4 py-2">
                <p className="break-words">{message.content || ''}</p>
                <p className={timeClass}>{formatTime(message.created_at)}</p>
            </div>
        )
    }

    return (
        <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
            <div className={bubbleBase}>
                {renderContent()}
            </div>
        </div>
    )
}