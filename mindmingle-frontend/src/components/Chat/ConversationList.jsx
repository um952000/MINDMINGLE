export default function ConversationList({
    conversations,
    selectedConversation,
    setSelectedConversation
}) {

    return (

        <div className="w-80 border-r border-gray-800 bg-gray-900 flex flex-col">

            {/* HEADER */}
            <div className="p-4 border-b border-gray-800">

                <h1 className="text-white font-bold text-xl">
                    Chats
                </h1>

            </div>

            {/* CONVERSATIONS */}
            <div className="flex-1 overflow-y-auto">

                {conversations.map(conversation => (

                    <button
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`
                            w-full
                            p-4
                            border-b
                            border-gray-800
                            text-left
                            hover:bg-gray-800
                            transition-all

                            ${selectedConversation?.id === conversation.id
                                ? 'bg-gray-800'
                                : ''
                            }
                        `}
                    >

                        <div className="flex items-center gap-3">

                            {/* avatar */}
                            <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold">

                                {conversation.name?.[0]?.toUpperCase() || 'C'}

                            </div>

                            <div className="flex-1">

                                <h2 className="text-white font-semibold">
                                    {conversation.name || 'Conversation'}
                                </h2>

                                <p className="text-slate-500 text-sm truncate">
                                    Tap to open chat
                                </p>

                            </div>

                        </div>

                    </button>
                ))}

            </div>

        </div>
    )
}