import { ThumbsUp, Heart, Lightbulb, Laugh, X } from 'lucide-react'
import { useState } from 'react'

const reactions = [
    { type: 'like', icon: ThumbsUp, color: 'text-blue-500', label: 'Like' },
    { type: 'love', icon: Heart, color: 'text-red-500', label: 'Love' },
    { type: 'insightful', icon: Lightbulb, color: 'text-yellow-500', label: 'Insightful' },
    { type: 'funny', icon: Laugh, color: 'text-orange-500', label: 'Funny' },
]

export default function ReactionBar({ reactions, onReaction, onClose }) {
    const [hoveredReaction, setHoveredReaction] = useState(null)

    return (
        <div className="absolute bottom-16 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 max-w-sm mx-auto">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            >
                <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Reactions Grid */}
            <div className="flex items-center justify-center gap-4 pb-4 mb-4 border-b border-gray-100">
                {reactions.map(({ type, icon: Icon, color }, index) => (
                    <button
                        key={type}
                        onClick={() => {
                            onReaction(type)
                            onClose()
                        }}
                        className={`p-3 rounded-xl hover:scale-110 transition-all duration-200 flex flex-col items-center gap-1 group ${hoveredReaction === type ? color : 'text-gray-400 hover:text-gray-600'
                            }`}
                        onMouseEnter={() => setHoveredReaction(type)}
                        onMouseLeave={() => setHoveredReaction(null)}
                    >
                        <Icon
                            className={`w-7 h-7 ${hoveredReaction === type ? 'shadow-lg' : ''}`}
                        />
                        <span className="text-xs font-medium group-hover:opacity-100 opacity-0">
                            {reactions[type] || 0}
                        </span>
                    </button>
                ))}
            </div>

            {/* Popular Reactions */}
            <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-900 px-1">Popular</p>
                <div className="flex items-center gap-3 flex-wrap">
                    {Object.entries(reactions)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 4)
                        .map(([type, count]) => {
                            const reaction = reactions.find(r => r.type === type)
                            const Icon = reaction.icon

                            return (
                                <button
                                    key={type}
                                    onClick={() => {
                                        onReaction(type)
                                        onClose()
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg text-sm transition-all"
                                >
                                    <reaction.icon className={`w-5 h-5 ${reaction.color}`} />
                                    <span>{count}</span>
                                </button>
                            )
                        })}
                </div>
            </div>
        </div>
    )
}
