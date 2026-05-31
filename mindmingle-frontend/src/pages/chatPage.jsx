// import { useEffect, useState } from 'react'
// import { chatAPI } from '../services/api'

// import ConversationList from '../components/chat/ConversationList'
// import ChatWindow from '../components/chat/ChatWindow'

// export default function ChatPage() {

//     const [conversations, setConversations] = useState([])
//     const [selectedConversation, setSelectedConversation] = useState(null)

//     useEffect(() => {

//         fetchConversations()

//     }, [])

//     const fetchConversations = async () => {

//         try {

//             const res = await chatAPI.getConversations()

//             setConversations(res.data.results || res.data)

//         } catch (error) {

//             console.error(error)
//         }
//     }

//     return (
//         <div className="h-screen bg-gray-950 flex overflow-hidden">

//             {/* LEFT SIDEBAR */}
//             <ConversationList
//                 conversations={conversations}
//                 selectedConversation={selectedConversation}
//                 setSelectedConversation={setSelectedConversation}
//             />

//             {/* RIGHT CHAT WINDOW */}
//             <ChatWindow
//                 conversation={selectedConversation}
//             />

//         </div>
//     )
// }



// import { useEffect, useState } from 'react'
// import { useParams } from 'react-router-dom'

// import { chatAPI } from '../services/api'

// import ConversationList from '../components/chat/ConversationList'
// import ChatWindow from '../components/chat/ChatWindow'

// export default function ChatPage() {

//     const { conversationId } = useParams()

//     const [conversations, setConversations] = useState([])
//     const [selectedConversation, setSelectedConversation] = useState(null)

//     // FETCH ALL CONVERSATIONS
//     useEffect(() => {

//         fetchConversations()

//     }, [])

//     const fetchConversations = async () => {

//         try {

//             const res = await chatAPI.getConversations()

//             const conversationData = res.data.results || res.data

//             setConversations(conversationData)

//         } catch (error) {

//             console.error(error)
//         }
//     }

//     // AUTO SELECT CONVERSATION FROM URL
//     useEffect(() => {

//         if (!conversationId || conversations.length === 0) return

//         const foundConversation = conversations.find(

//             (conversation) =>
//                 conversation.id === parseInt(conversationId)

//         )

//         if (foundConversation) {

//             setSelectedConversation(foundConversation)
//         }

//     }, [conversationId, conversations])

//     return (

//         <div className="h-screen bg-gray-950 flex overflow-hidden">

//             {/* LEFT SIDEBAR */}
//             <ConversationList
//                 conversations={conversations}
//                 selectedConversation={selectedConversation}
//                 setSelectedConversation={setSelectedConversation}
//             />

//             {/* RIGHT CHAT WINDOW */}
//             <ChatWindow
//                 conversation={selectedConversation}
//             />

//         </div>
//     )
// }

// import { useEffect, useState } from 'react'
// import { useLocation } from 'react-router-dom'

// import { chatAPI } from '../services/api'

// import ConversationList from '../components/chat/ConversationList'
// import ChatWindow from '../components/chat/ChatWindow'

// export default function ChatPage() {

//     const [conversations, setConversations] = useState([])
//     const [selectedConversation, setSelectedConversation] = useState(null)

//     const location = useLocation()

//     useEffect(() => {

//         fetchConversations()

//     }, [])

//     useEffect(() => {

//         if (location.state?.selectedConversation) {

//             setSelectedConversation(
//                 location.state.selectedConversation
//             )
//         }

//     }, [location.state])

//     const fetchConversations = async () => {

//         try {

//             const res = await chatAPI.getConversations()

//             const data = res.data.results || res.data

//             setConversations(data)

//             // auto select first conversation
//             if (data.length > 0 && !selectedConversation) {

//                 setSelectedConversation(data[0])
//             }

//         } catch (error) {

//             console.error(error)
//         }
//     }

//     return (

//         <div className="h-screen bg-gray-950 flex overflow-hidden">

//             <ConversationList
//                 conversations={conversations}
//                 selectedConversation={selectedConversation}
//                 setSelectedConversation={setSelectedConversation}
//             />

//             <ChatWindow
//                 conversation={selectedConversation}
//             />

//         </div>
//     )
// }





// import { useEffect, useState } from 'react'
// import { useLocation } from 'react-router-dom'

// import { chatAPI } from '../services/api'

// import ConversationList from '../components/chat/ConversationList'
// import ChatWindow from '../components/chat/ChatWindow'

// export default function ChatPage() {

//     const [conversations, setConversations] = useState([])
//     const [selectedConversation, setSelectedConversation] = useState(null)
//     const [messages, setMessages] = useState([])

//     const location = useLocation()

//     useEffect(() => {
//         fetchConversations()
//     }, [])

//     useEffect(() => {
//         if (location.state?.selectedConversation) {
//             setSelectedConversation(location.state.selectedConversation)
//         }
//     }, [location.state])

//     const fetchConversations = async () => {
//         try {
//             const res = await chatAPI.getConversations()
//             const data = res.data.results || res.data
//             setConversations(data)
//             if (data.length > 0 && !selectedConversation) {
//                 setSelectedConversation(data[0])
//             }
//         } catch (error) {
//             console.error(error)
//         }
//     }

//     const handleClearConversation = async (conversationId) => {
//         try {
//             await chatAPI.clearConversation(conversationId)
//             if (selectedConversation?.id === conversationId) {
//                 setMessages([])
//             }
//         } catch (error) {
//             console.error(error)
//         }
//     }

//     const handleDeleteConversation = async (conversationId) => {
//         try {
//             await chatAPI.deleteConversation(conversationId)
//             setConversations(prev => prev.filter(c => c.id !== conversationId))
//             if (selectedConversation?.id === conversationId) {
//                 setSelectedConversation(null)
//                 setMessages([])
//             }
//         } catch (error) {
//             console.error(error)
//         }
//     }

//     return (
//         <div className="h-screen bg-gray-950 flex overflow-hidden">

//             <ConversationList
//                 conversations={conversations}
//                 selectedConversation={selectedConversation}
//                 setSelectedConversation={setSelectedConversation}
//                 onClearConversation={handleClearConversation}
//                 onDeleteConversation={handleDeleteConversation}
//             />

//             <ChatWindow
//                 conversation={selectedConversation}
//                 messages={messages}
//                 setMessages={setMessages}
//             />

//         </div>
//     )
// }




import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { chatAPI } from '../services/api'

import ConversationList from '../components/chat/ConversationList'
import ChatWindow from '../components/chat/ChatWindow'

export default function ChatPage() {

    const [conversations, setConversations] = useState([])
    const [selectedConversation, setSelectedConversation] = useState(null)
    const [messages, setMessages] = useState([])

    const location = useLocation()

    useEffect(() => {
        fetchConversations()
    }, [])

    useEffect(() => {
        if (location.state?.selectedConversation) {
            setSelectedConversation(location.state.selectedConversation)
        }
    }, [location.state])

    // ✅ notification socket — listens for new conversations from other users
    // ✅ notification socket — listens for new conversations from other users
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) return

        const ws = new WebSocket(`ws://127.0.0.1:8000/ws/notifications/?token=${token}`)

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)
            if (data.type === 'new_conversation') {
                setConversations(prev => {
                    const exists = prev.find(c => c.id === data.conversation.id)
                    if (exists) return prev
                    return [data.conversation, ...prev]   // ✅ restore to top of list
                })
            }
        }

        ws.onerror = (err) => console.error('Notification WS error:', err)
        return () => ws.close()
    }, [])


    const fetchConversations = async () => {
        try {
            const res = await chatAPI.getConversations()
            const data = res.data.results || res.data
            setConversations(data)
            if (data.length > 0 && !selectedConversation) {
                setSelectedConversation(data[0])
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleClearConversation = async (conversationId) => {
        try {
            await chatAPI.clearConversation(conversationId)
            if (selectedConversation?.id === conversationId) {
                setMessages([])
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleDeleteConversation = async (conversationId) => {
        try {
            await chatAPI.deleteConversation(conversationId)
            setConversations(prev => prev.filter(c => c.id !== conversationId))
            if (selectedConversation?.id === conversationId) {
                setSelectedConversation(null)
                setMessages([])
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="h-screen bg-gray-950 flex overflow-hidden">

            <ConversationList
                conversations={conversations}
                selectedConversation={selectedConversation}
                setSelectedConversation={setSelectedConversation}
                onClearConversation={handleClearConversation}
                onDeleteConversation={handleDeleteConversation}
            />

            <ChatWindow
                conversation={selectedConversation}
                messages={messages}
                setMessages={setMessages}
            />

        </div>
    )
}














































// import { useEffect } from "react"

// export default function ChatPage() {

//     useEffect(() => {

//         const socket = new WebSocket(
//             "ws://127.0.0.1:8000/ws/chat/1/"
//         )

//         socket.onopen = () => {
//             console.log("Connected")

//             socket.send(JSON.stringify({
//                 message: "Hello from React"
//             }))
//         }

//         socket.onmessage = (event) => {
//             console.log("Message:", event.data)
//         }

//         socket.onclose = () => {
//             console.log("Disconnected")
//         }

//         return () => {
//             socket.close()
//         }

//     }, [])

//     return (
//         <div className="min-h-screen bg-gray-950 text-white p-10">
//             <h1 className="text-2xl font-bold">
//                 Chat Test
//             </h1>
//         </div>
//     )
// }