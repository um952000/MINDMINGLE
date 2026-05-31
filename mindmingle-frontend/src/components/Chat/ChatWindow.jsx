import { useEffect, useRef, useState } from 'react'
import { chatAPI } from '../../services/api'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'

// ✅ Helpers for date separator
const formatDateLabel = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

    return date.toLocaleDateString([], {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
}

const isSameDay = (a, b) => {
    if (!a || !b) return false
    return new Date(a).toDateString() === new Date(b).toDateString()
}

export default function ChatWindow({ conversation, messages, setMessages }) {

    // const [messages, setMessages] = useState([])
    const [visibleDate, setVisibleDate] = useState('')

    const [editingMessage, setEditingMessage] = useState(null)

    const socketRef = useRef(null)
    const scrollRef = useRef(null)
    const messageRefs = useRef({})

    useEffect(() => {
        if (conversation) {
            setMessages([])          // ✅ clear stale messages first
            fetchMessages()          // ✅ fetch fresh — respects cleared_at on backend
            connectWebSocket()
        }
        return () => {
            if (socketRef.current) socketRef.current.close()
        }
    }, [conversation?.id])

    // ✅ Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    // ✅ IntersectionObserver to update sticky date as user scrolls
    useEffect(() => {
        if (messages.length === 0) return

        const observer = new IntersectionObserver(
            (entries) => {
                // Find the topmost visible message
                const visible = entries
                    .filter(e => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

                if (visible.length > 0) {
                    const msgId = visible[0].target.dataset.msgid
                    const msg = messages.find(m => String(m.id) === msgId)
                    if (msg) setVisibleDate(formatDateLabel(msg.created_at))
                }
            },
            {
                root: scrollRef.current,
                threshold: 0.1,
            }
        )

        Object.values(messageRefs.current).forEach(el => {
            if (el) observer.observe(el)
        })

        return () => observer.disconnect()
    }, [messages])

    const fetchMessages = async () => {
        try {
            const res = await chatAPI.getMessages(conversation.id)
            setMessages(res.data)  // ✅ res.data is now a plain array, no .results
        } catch (error) {
            console.error(error)
        }
    }

    const connectWebSocket = () => {
        if (!conversation) return
        if (socketRef.current) socketRef.current.close()

        const token = localStorage.getItem('token')
        if (!token) return

        const ws = new WebSocket(
            `ws://127.0.0.1:8000/ws/chat/${conversation.id}/?token=${token}`
        )
        socketRef.current = ws

        ws.onopen = () => console.log('WebSocket Connected')

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)
            setMessages(prev => {
                const exists = prev.find(msg => msg.id === data.id)
                if (exists) return prev
                return [...prev, data]
            })
        }

        ws.onclose = () => console.log('WebSocket Disconnected')
        ws.onerror = (error) => console.error('WebSocket Error:', error)
    }

    // ✅ handles both text (from WebSocket) and media (from upload API)
    const handleSendMessage = (content, uploadedMessage = null) => {

        // media upload — already saved by REST API, just add to list
        if (uploadedMessage) {
            setMessages(prev => {
                const exists = prev.find(m => m.id === uploadedMessage.id)
                if (exists) return prev
                return [...prev, uploadedMessage]
            })
            return
        }

        // text — send via WebSocket as before
        if (
            socketRef.current &&
            socketRef.current.readyState === WebSocket.OPEN
        ) {
            socketRef.current.send(JSON.stringify({ content }))
        }
    }

    if (!conversation) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-950 text-slate-500">
                Select a conversation
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col bg-gray-950">

            {/* HEADER */}
            <div className="h-16 border-b border-gray-800 flex items-center px-6 bg-gray-900">
                <h2 className="text-white font-bold text-lg">
                    {conversation.name || conversation.other_user?.username || 'Conversation'}
                </h2>
            </div>

            {/* MESSAGES */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-3 relative">

                {/* ✅ Sticky floating date bar */}
                {visibleDate && (
                    <div className="sticky top-2 z-10 flex justify-center pointer-events-none">
                        <span className="bg-gray-800 text-slate-400 text-xs px-3 py-1 rounded-full shadow">
                            {visibleDate}
                        </span>
                    </div>
                )}

                {messages.map((message, index) => {
                    const prevMessage = messages[index - 1]
                    const showDateSeparator = !isSameDay(
                        prevMessage?.created_at,
                        message.created_at
                    )

                    return (
                        <div
                            key={message.id}
                            data-msgid={String(message.id)}
                            ref={el => messageRefs.current[message.id] = el}
                        >
                            {/* ✅ Date separator between messages from different days */}
                            {showDateSeparator && (
                                <div className="flex justify-center my-3">
                                    <span className="bg-gray-800 text-slate-400 text-xs px-3 py-1 rounded-full">
                                        {formatDateLabel(message.created_at)}
                                    </span>
                                </div>
                            )}
                            <MessageBubble
                                message={message}
                                onEdit={(msg) => setEditingMessage(msg)}
                                onDelete={async (msg) => {
                                    try {
                                        await chatAPI.deleteMessage(
                                            conversation.id,
                                            msg.id
                                        )

                                        setMessages(prev =>
                                            prev.filter(m => m.id !== msg.id)
                                        )
                                    } catch (err) {
                                        console.error(err)
                                    }
                                }}
                            />
                        </div>
                    )
                })}
            </div>

            {/* INPUT */}
            {/* <MessageInput
                onSend={handleSendMessage}
                conversationId={conversation.id}  // ✅ add this
                socketRef={socketRef}
                editingMessage={editingMessage}
                setEditingMessage={setEditingMessage}
            /> */}

            <MessageInput
                onSend={handleSendMessage}
                conversationId={conversation.id}
                socketRef={socketRef}
                editingMessage={editingMessage}
                setEditingMessage={setEditingMessage}
                onMessageUpdated={(updatedMessage) => {
                    setMessages(prev =>
                        prev.map(msg =>
                            msg.id === updatedMessage.id
                                ? updatedMessage
                                : msg
                        )
                    )
                }}
            />
        </div>
    )
}


