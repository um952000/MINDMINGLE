import { useState, useRef } from 'react'
import { Send, Mic, X, Paperclip, Image, Video, FileText, Music } from 'lucide-react'
import { chatAPI } from '../../services/api'

export default function MessageInput({ onSend, conversationId, socketRef }) {

    const [text, setText] = useState('')
    const [preview, setPreview] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [mediaMenuOpen, setMediaMenuOpen] = useState(false)

    const imageRef = useRef()
    const videoRef = useRef()
    const audioRef = useRef()
    const documentRef = useRef()

    const handleFileSelect = (e, type) => {
        const file = e.target.files[0]
        if (!file) return
        const url = URL.createObjectURL(file)
        setPreview({ file, type, url })
        setMediaMenuOpen(false)
        e.target.value = ''
    }

    const handleCancelPreview = () => {
        if (preview?.url) URL.revokeObjectURL(preview.url)
        setPreview(null)
    }

    const handleUpload = async () => {
        if (!preview) return
        setUploading(true)
        try {
            const res = await chatAPI.uploadFile(
                conversationId,
                preview.file,
                preview.type
            )
            const uploadedMessage = res.data
            onSend(null, uploadedMessage)

            // ✅ broadcast via WebSocket so other user sees it in real time
            if (socketRef?.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({
                    message_type: uploadedMessage.message_type,
                    message_id: uploadedMessage.id,
                }))
            }

            handleCancelPreview()
        } catch (err) {
            console.error('Upload failed:', err)
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = () => {
        if (!text.trim()) return
        onSend(text)
        setText('')
    }

    const mediaOptions = [
        {
            label: 'Image',
            icon: <Image size={16} className="text-blue-400" />,
            bg: 'bg-blue-500/10',
            ref: imageRef,
            accept: 'image/*',
            type: 'image'
        },
        {
            label: 'Video',
            icon: <Video size={16} className="text-purple-400" />,
            bg: 'bg-purple-500/10',
            ref: videoRef,
            accept: 'video/*',
            type: 'video'
        },
        {
            label: 'Audio',
            icon: <Music size={16} className="text-green-400" />,
            bg: 'bg-green-500/10',
            ref: audioRef,
            accept: 'audio/*',
            type: 'audio'
        },
        {
            label: 'Document',
            icon: <FileText size={16} className="text-orange-400" />,
            bg: 'bg-orange-500/10',
            ref: documentRef,
            accept: '.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx',
            type: 'document'
        },
    ]

    return (
        <div className="border-t border-gray-800 bg-gray-900">

            {/* Hidden file inputs */}
            {mediaOptions.map(opt => (
                <input
                    key={opt.type}
                    ref={opt.ref}
                    type="file"
                    accept={opt.accept}
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, opt.type)}
                />
            ))}

            {/* ✅ File preview bar */}
            {preview && (
                <div className="px-4 pt-3 flex items-center gap-3">
                    <div className="relative">
                        {preview.type === 'image' && (
                            <img
                                src={preview.url}
                                className="h-20 w-20 object-cover rounded-xl border border-gray-700"
                            />
                        )}
                        {preview.type === 'video' && (
                            <video
                                src={preview.url}
                                className="h-20 w-28 object-cover rounded-xl border border-gray-700"
                            />
                        )}
                        {(preview.type === 'audio' || preview.type === 'document') && (
                            <div className="h-12 px-4 flex items-center gap-2 bg-gray-800 rounded-xl border border-gray-700">
                                {preview.type === 'audio'
                                    ? <Music size={16} className="text-green-400" />
                                    : <FileText size={16} className="text-orange-400" />
                                }
                                <span className="text-slate-300 text-sm truncate max-w-40">
                                    {preview.file.name}
                                </span>
                            </div>
                        )}
                        <button
                            onClick={handleCancelPreview}
                            className="absolute -top-2 -right-2 bg-gray-700 hover:bg-red-600 rounded-full p-0.5 transition-colors"
                        >
                            <X size={12} className="text-white" />
                        </button>
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    >
                        {uploading
                            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <Send size={14} />
                        }
                        {uploading ? 'Sending...' : 'Send'}
                    </button>
                </div>
            )}

            {/* ✅ Input row */}
            <div className="p-4 flex gap-3 items-center relative">

                {/* ✅ Single media button with popup menu */}
                <div className="relative">
                    <button
                        onClick={() => setMediaMenuOpen(o => !o)}
                        className={`p-2 rounded-xl transition-colors ${mediaMenuOpen
                            ? 'bg-violet-600 text-white'
                            : 'hover:bg-gray-800 text-gray-400 hover:text-violet-400'
                            }`}
                        title="Attach media"
                    >
                        <Paperclip size={20} />
                    </button>

                    {/* ✅ Popup menu */}
                    {mediaMenuOpen && (
                        <>
                            {/* backdrop to close */}
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setMediaMenuOpen(false)}
                            />
                            <div className="absolute bottom-12 left-0 z-20 bg-gray-900 border border-gray-700 rounded-2xl p-2 shadow-2xl flex flex-col gap-1 min-w-36">
                                {mediaOptions.map(opt => (
                                    <button
                                        key={opt.type}
                                        onClick={() => opt.ref.current.click()}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white ${opt.bg} hover:brightness-110 transition-all text-left`}
                                    >
                                        {opt.icon}
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Text input */}
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-violet-500"
                />

                <button
                    onClick={handleSubmit}
                    className="bg-violet-600 hover:bg-violet-700 px-4 py-3 rounded-xl transition-all"
                >
                    <Send size={18} className="text-white" />
                </button>
            </div>
        </div>
    )
}