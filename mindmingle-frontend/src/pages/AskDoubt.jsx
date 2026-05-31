import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { doubtAPI } from '../services/api'
import TagInput from '../components/DoubtCard/TagInput'
import ImageUploader from '../components/DoubtCard/ImageUploader'
import { HelpCircle, FileText, Tag, Image, Send, Pencil } from 'lucide-react'

export default function AskDoubt() {
    const { id } = useParams()
    const isEditMode = Boolean(id)

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        tags: [],
        images: []
    })
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(isEditMode)
    const [error, setError] = useState('')
    const { user } = useAuth()
    const navigate = useNavigate()

    // prefill form in edit mode
    useEffect(() => {
        if (!isEditMode) return

        const loadDoubt = async () => {
            try {
                setFetching(true)
                const res = await doubtAPI.getDoubt(id)
                const doubt = res.data
                setFormData({
                    title: doubt.title || '',
                    content: doubt.content || '',
                    tags: doubt.tags?.map(t => t.name || t) || [],
                    images: []   // existing images handled separately below
                })
            } catch (e) {
                setError('Failed to load doubt')
                console.error(e)
            } finally {
                setFetching(false)
            }
        }

        loadDoubt()
    }, [id, isEditMode])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            if (isEditMode) {
                // EDIT
                await doubtAPI.updateDoubt(id, {
                    title: formData.title,
                    content: formData.content,
                    tag_names: formData.tags
                })

                // upload any new images added during edit
                for (let image of formData.images) {
                    const formDataImage = new FormData()
                    formDataImage.append('image', image)
                    formDataImage.append('doubt', id)

                    await fetch('http://localhost:8000/api/doubts/images/', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: formDataImage
                    })
                }

                navigate(`/doubts/${id}`)

            } else {
                // CREATE
                const response = await doubtAPI.createDoubt({
                    title: formData.title,
                    content: formData.content,
                    tag_names: formData.tags
                })

                const doubtId = response.data.id

                for (let image of formData.images) {
                    const formDataImage = new FormData()
                    formDataImage.append('image', image)
                    formDataImage.append('doubt', doubtId)

                    await fetch('http://localhost:8000/api/doubts/images/', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: formDataImage
                    })
                }

                navigate('/')
            }
        } catch (err) {
            setError(
                err.response?.data?.title?.[0] ||
                err.response?.data?.detail ||
                `Failed to ${isEditMode ? 'update' : 'create'} doubt`
            )
        } finally {
            setLoading(false)
        }
    }

    if (fetching) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-t-violet-400 border-violet-500/20 rounded-full animate-spin" />
                <p className="text-slate-500 text-sm">Loading doubt...</p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-950 py-10 px-4">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-violet-500/10 border border-violet-500/20 rounded-2xl mb-4">
                        {isEditMode
                            ? <Pencil className="w-7 h-7 text-violet-400" />
                            : <HelpCircle className="w-7 h-7 text-violet-400" />
                        }
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        {isEditMode ? 'Edit Doubt' : 'Ask a Doubt'}
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm">
                        {isEditMode
                            ? 'Update your doubt with more details or corrections'
                            : 'Be specific and descriptive to get better answers from the community'
                        }
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Title */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 focus-within:border-violet-500/50 transition-colors">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                            <HelpCircle size={13} className="text-violet-400" />
                            Title <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="What's your doubt? Be specific..."
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-transparent text-slate-100 placeholder-slate-600 text-lg font-medium outline-none"
                            maxLength={300}
                            required
                        />
                        <div className="flex justify-end mt-2">
                            <span className={`text-xs ${formData.title.length > 250 ? 'text-orange-400' : 'text-slate-600'}`}>
                                {formData.title.length}/300
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 focus-within:border-violet-500/50 transition-colors">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                            <FileText size={13} className="text-violet-400" />
                            Description <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            rows={8}
                            placeholder="Describe your problem in detail. Include:&#10;• What you tried&#10;• Error messages&#10;• Code snippets&#10;• Expected vs actual behavior"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full bg-transparent text-slate-300 placeholder-slate-600 text-sm leading-relaxed outline-none resize-none"
                            required
                        />
                    </div>

                    {/* Tags */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 focus-within:border-violet-500/50 transition-colors">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                            <Tag size={13} className="text-violet-400" />
                            Tags
                        </label>
                        <TagInput
                            tags={formData.tags}
                            onTagsChange={(tags) => setFormData({ ...formData, tags })}
                        />
                    </div>

                    {/* Images */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 focus-within:border-violet-500/50 transition-colors">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                            <Image size={13} className="text-violet-400" />
                            {isEditMode ? 'Add More Attachments' : 'Attachments'}
                        </label>
                        <ImageUploader
                            images={formData.images}
                            onImagesChange={(images) => setFormData({ ...formData, images })}
                        />
                        {isEditMode && (
                            <p className="text-xs text-slate-600 mt-2">
                                Existing images are preserved. Upload here to add new ones.
                            </p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        {isEditMode && (
                            <button
                                type="button"
                                onClick={() => navigate(`/doubts/${id}`)}
                                className="flex-1 py-4 rounded-2xl border border-gray-700 text-slate-400 hover:bg-gray-800 hover:text-white font-bold text-base transition-all"
                            >
                                Cancel
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !formData.title || !formData.content}
                            className="flex-1 flex items-center justify-center gap-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-base transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    {isEditMode ? 'Saving changes...' : 'Posting your doubt...'}
                                </>
                            ) : (
                                <>
                                    {isEditMode ? <Pencil className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                                    {isEditMode ? 'Save Changes' : 'Post Doubt'}
                                </>
                            )}
                        </button>
                    </div>

                </form>

                {/* Tips */}
                {!isEditMode && (
                    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">💡 Tips for a great question</p>
                        <ul className="space-y-1.5">
                            {[
                                'Summarize the problem in the title',
                                'Include relevant code or error messages',
                                'Describe what you already tried',
                                'Add relevant tags to reach the right people',
                            ].map((tip, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-slate-500">
                                    <span className="text-violet-400 mt-0.5">→</span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

            </div>
        </div>
    )
}