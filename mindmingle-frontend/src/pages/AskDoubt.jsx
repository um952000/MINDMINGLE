// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useAuth } from '../hooks/useAuth'
// import { doubtAPI } from '../services/api'
// import TagInput from '../components/DoubtCard/TagInput'
// import ImageUploader from '../components/DoubtCard/ImageUploader'

// export default function AskDoubt() {
//     const [formData, setFormData] = useState({
//         title: '',
//         content: '',
//         tags: [],
//         images: []
//     })
//     const [loading, setLoading] = useState(false)
//     const [error, setError] = useState('')
//     const { user } = useAuth()
//     const navigate = useNavigate()

//     const handleSubmit = async (e) => {
//         e.preventDefault()
//         setLoading(true)
//         setError('')

//         try {
//             // Step 1: Create doubt
//             const response = await doubtAPI.createDoubt({
//                 title: formData.title,
//                 content: formData.content,
//                 tag_names: formData.tags
//             })

//             const doubtId = response.data.id

//             // Step 2: Upload images
//             for (let image of formData.images) {
//                 const formDataImage = new FormData()
//                 formDataImage.append('image', image)
//                 formDataImage.append('doubt', doubtId)

//                 await fetch('http://localhost:8000/api/doubts/images/', {
//                     method: 'POST',
//                     headers: {
//                         'Authorization': `Bearer ${localStorage.getItem('token')}`
//                     },
//                     body: formDataImage
//                 })
//             }

//             navigate(`/`)
//         } catch (err) {
//             setError(err.response?.data?.title?.[0] || 'Failed to create doubt')
//         } finally {
//             setLoading(false)
//         }
//     }

//     return (
//         <div className="max-w-4xl mx-auto space-y-8">
//             {/* Header */}
//             <div className="text-center">
//                 <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
//                     Ask a new doubt
//                 </h1>
//                 <p className="text-lg text-gray-600 mt-2">
//                     Be specific and descriptive to get better answers
//                 </p>
//             </div>

//             {error && (
//                 <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl">
//                     {error}
//                 </div>
//             )}

//             {/* Form */}
//             <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-xl">
//                 {/* Title */}
//                 <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Title <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                         type="text"
//                         placeholder="What's your programming doubt?"
//                         value={formData.title}
//                         onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                         className="w-full px-6 py-4 border border-gray-200 rounded-xl text-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
//                         maxLength={300}
//                         required
//                     />
//                     <p className="text-xs text-gray-500 mt-1">
//                         {formData.title.length}/300 characters
//                     </p>
//                 </div>

//                 {/* Content */}
//                 <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Describe your problem <span className="text-red-500">*</span>
//                     </label>
//                     <textarea
//                         rows={8}
//                         placeholder="Include code snippets, error messages, what you've tried..."
//                         value={formData.content}
//                         onChange={(e) => setFormData({ ...formData, content: e.target.value })}
//                         className="w-full px-6 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical"
//                         required
//                     />
//                 </div>

//                 {/* Tags */}
//                 <TagInput
//                     tags={formData.tags}
//                     onTagsChange={(tags) => setFormData({ ...formData, tags })}
//                 />

//                 {/* Images */}
//                 <ImageUploader
//                     images={formData.images}
//                     onImagesChange={(images) => setFormData({ ...formData, images })}
//                 />

//                 {/* Submit */}
//                 <button
//                     type="submit"
//                     disabled={loading || !formData.title || !formData.content}
//                     className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-4 px-8 rounded-xl text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                     {loading ? (
//                         <span className="flex items-center gap-2 justify-center">
//                             <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                             Posting your doubt...
//                         </span>
//                     ) : (
//                         'Post Doubt'
//                     )}
//                 </button>
//             </form>
//         </div>
//     )
// }


import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { doubtAPI } from '../services/api'
import TagInput from '../components/DoubtCard/TagInput'
import ImageUploader from '../components/DoubtCard/ImageUploader'
import { HelpCircle, FileText, Tag, Image, Send } from 'lucide-react'

export default function AskDoubt() {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        tags: [],
        images: []
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const { user } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
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
        } catch (err) {
            setError(err.response?.data?.title?.[0] || 'Failed to create doubt')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 py-10 px-4">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-violet-500/10 border border-violet-500/20 rounded-2xl mb-4">
                        <HelpCircle className="w-7 h-7 text-violet-400" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        Ask a Doubt
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm">
                        Be specific and descriptive to get better answers from the community
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
                            Attachments
                        </label>
                        <ImageUploader
                            images={formData.images}
                            onImagesChange={(images) => setFormData({ ...formData, images })}
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading || !formData.title || !formData.content}
                        className="w-full flex items-center justify-center gap-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-base transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Posting your doubt...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Post Doubt
                            </>
                        )}
                    </button>

                </form>

                {/* Tips */}
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

            </div>
        </div>
    )
}