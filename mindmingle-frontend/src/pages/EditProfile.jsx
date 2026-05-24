// src/pages/EditProfile.jsx

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { authAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'

export default function EditProfile() {

    const navigate = useNavigate()
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        bio: '',
        location: '',
        skills: '',
        is_private: false,

        profile: {
            date_of_birth: '',
            phone: '',
            website: '',
            qualifications: '',
            github: '',
            linkedin: '',
            twitter: '',
        }
    })

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const res = await authAPI.getProfile(user.id)

            setFormData({
                username: res.data.username || '',
                email: res.data.email || '',
                first_name: res.data.first_name || '',
                last_name: res.data.last_name || '',
                bio: res.data.bio || '',
                location: res.data.location || '',
                skills: res.data.skills?.join(', ') || '',
                is_private: res.data.is_private || false,

                profile: {
                    date_of_birth: res.data.profile?.date_of_birth || '',
                    phone: res.data.profile?.phone || '',
                    website: res.data.profile?.website || '',
                    qualifications: res.data.profile?.qualifications || '',
                    github: res.data.profile?.github || '',
                    linkedin: res.data.profile?.linkedin || '',
                    twitter: res.data.profile?.twitter || '',
                }
            })

        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleProfileChange = (e) => {
        const { name, value } = e.target

        setFormData(prev => ({
            ...prev,
            profile: {
                ...prev.profile,
                [name]: value
            }
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const payload = {
            ...formData,
            skills: formData.skills
                .split(',')
                .map(skill => skill.trim())
        }

        try {
            setSaving(true)

            const res = await authAPI.updateProfile(payload)

            navigate(`/profile/${user.id}`)

        } catch (error) {
            console.log(error.response?.data)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white pb-20">

            <div className="max-w-3xl mx-auto px-4 py-6">

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">

                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-800 transition-all"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div>
                        <h1 className="text-2xl font-black">
                            Edit Profile
                        </h1>

                        <p className="text-slate-500 text-sm mt-1">
                            Update your personal information
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Basic Info */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">

                        <h2 className="text-sm font-bold text-violet-400 uppercase tracking-wider mb-5">
                            Basic Information
                        </h2>

                        <div className="grid md:grid-cols-2 gap-4">

                            <Input
                                label="Username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                            />

                            <Input
                                label="Email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />

                            <Input
                                label="First Name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                            />

                            <Input
                                label="Last Name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                            />

                        </div>

                        <div className="mt-4">

                            <label className="text-sm text-slate-400 block mb-2">
                                Bio
                            </label>

                            <textarea
                                rows={4}
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500"
                            />

                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mt-4">

                            <Input
                                label="Location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                            />

                            <Input
                                label="Skills (comma separated)"
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                            />

                        </div>

                        <div className="mt-5 flex items-center gap-3">

                            <input
                                type="checkbox"
                                name="is_private"
                                checked={formData.is_private}
                                onChange={handleChange}
                                className="w-4 h-4"
                            />

                            <label className="text-sm text-slate-400">
                                Private Profile
                            </label>

                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">

                        <h2 className="text-sm font-bold text-violet-400 uppercase tracking-wider mb-5">
                            Profile Details
                        </h2>

                        <div className="grid md:grid-cols-2 gap-4">

                            <Input
                                label="Date of Birth"
                                type="date"
                                name="date_of_birth"
                                value={formData.profile.date_of_birth}
                                onChange={handleProfileChange}
                            />

                            <Input
                                label="Phone"
                                name="phone"
                                value={formData.profile.phone}
                                onChange={handleProfileChange}
                            />

                            <Input
                                label="Website"
                                name="website"
                                value={formData.profile.website}
                                onChange={handleProfileChange}
                            />

                            <Input
                                label="Qualifications"
                                name="qualifications"
                                value={formData.profile.qualifications}
                                onChange={handleProfileChange}
                            />

                            <Input
                                label="GitHub"
                                name="github"
                                value={formData.profile.github}
                                onChange={handleProfileChange}
                            />

                            <Input
                                label="LinkedIn"
                                name="linkedin"
                                value={formData.profile.linkedin}
                                onChange={handleProfileChange}
                            />

                            <Input
                                label="Twitter"
                                name="twitter"
                                value={formData.profile.twitter}
                                onChange={handleProfileChange}
                            />

                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                Save Changes
                            </>
                        )}
                    </button>

                </form>
            </div>
        </div>
    )
}

function Input({
    label,
    ...props
}) {
    return (
        <div>
            <label className="text-sm text-slate-400 block mb-2">
                {label}
            </label>

            <input
                {...props}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500"
            />
        </div>
    )
}
