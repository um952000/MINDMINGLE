import { X } from 'lucide-react'
import { useState } from 'react'

export default function TagInput({ tags, onTagsChange }) {
    const [inputValue, setInputValue] = useState('')
    const [suggestions] = useState([
        'django', 'react', 'python', 'javascript', 'postgres', 'mongodb',
        'api', 'auth', 'celery', 'redis', 'tailwind', 'vite'
    ])

    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault()
            const newTag = inputValue.trim().toLowerCase()
            if (!tags.includes(newTag) && tags.length < 5) {
                onTagsChange([...tags, newTag])
            }
            setInputValue('')
        }
    }

    const removeTag = (index) => {
        onTagsChange(tags.filter((_, i) => i !== index))
    }

    const filteredSuggestions = suggestions.filter(
        s => !tags.includes(s) && s.includes(inputValue.toLowerCase())
    )

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
                Tags (max 5) - Helps others find your question
            </label>

            {/* Current Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center gap-1 bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full font-medium"
                    >
                        {tag}
                        <button
                            onClick={() => removeTag(index)}
                            className="ml-1 hover:bg-primary-200 rounded-full p-0.5 -mr-1"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
            </div>

            {/* Input + Suggestions */}
            <div className="relative">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Press Enter to add tag (e.g., django, react)"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    maxLength={20}
                />

                {inputValue && filteredSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-auto z-10">
                        {filteredSuggestions.slice(0, 5).map((suggestion) => (
                            <button
                                key={suggestion}
                                onClick={() => {
                                    if (!tags.includes(suggestion) && tags.length < 5) {
                                        onTagsChange([...tags, suggestion])
                                        setInputValue('')
                                    }
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-900"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <p className="text-xs text-gray-500 mt-1">
                {tags.length}/5 tags used
            </p>
        </div>
    )
}
