import { Filter, Flame, Clock, Zap } from 'lucide-react'

export default function FeedFilters({ filter, onFilterChange }) {
    const filters = [
        { id: 'recent', label: 'Recent', icon: Clock },
        { id: 'trending', label: 'Trending', icon: Flame },
        { id: 'unanswered', label: 'Unanswered', icon: Zap },
    ]

    return (
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
            {filters.map(({ id, label, icon: Icon }) => (
                <button
                    key={id}
                    onClick={() => onFilterChange(id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === id
                        ? 'bg-white shadow-sm text-primary-600'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    <Icon className="w-4 h-4" />
                    {label}
                </button>
            ))}
        </div>
    )
}
