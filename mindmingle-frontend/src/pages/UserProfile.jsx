// src/pages/Profile.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { authAPI, gamificationAPI } from '../services/api'
import {
    MapPin, GraduationCap, Globe, Github, Linkedin,
    Twitter, Edit3, Users, MessageCircle, Award,
    Flame, Star, Calendar, CheckCircle, HelpCircle,
    Zap, ExternalLink
} from 'lucide-react'

const LEVEL_CONFIG = {
    'Beginner': { emoji: '🌱', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' },
    'Intermediate': { emoji: '⚡', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
    'Advanced': { emoji: '🔥', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' },
    'Expert': { emoji: '💎', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
    'Master': { emoji: '👑', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
}

const BADGE_CONFIG = {
    'first_answer': { icon: '🎯', label: 'First Answer', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
    'top_solver': { icon: '🏆', label: 'Top Solver', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
    'helpful': { icon: '🤝', label: 'Helpful', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
    'streak_7': { icon: '🔥', label: '7 Day Streak', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
    'streak_30': { icon: '⚡', label: '30 Day Streak', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
    'first_doubt': { icon: '❓', label: 'Curious Mind', color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
    'accepted_10': { icon: '✅', label: '10 Accepted', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
    'reputation_100': { icon: '⭐', label: 'Rising Star', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
    'reputation_500': { icon: '🌟', label: 'Star Member', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
    'reputation_1000': { icon: '💫', label: 'Legend', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
}

export default function Profile() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user: authUser } = useAuth()
    const [user, setUser] = useState(null)
    const [userLevel, setUserLevel] = useState(null)
    const [badges, setBadges] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('doubts')
    const [isFollowing, setIsFollowing] = useState(false)

    const isOwnProfile = authUser?.id === parseInt(id) || authUser?.user_id === parseInt(id)

    useEffect(() => {
        Promise.all([
            authAPI.getProfile(id),
            gamificationAPI.getMyLevel(),
            gamificationAPI.getUserBadges(id),
        ])
            .then(([userRes, levelRes, badgesRes]) => {
                setUser(userRes.data)
                setUserLevel(levelRes.data)
                setBadges(badgesRes.data)
                setIsFollowing(userRes.data.is_following)
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-2 border-gray-800 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500 text-sm font-mono">Loading profile...</p>
            </div>
        </div>
    )

    if (!user) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-500">
            User not found
        </div>
    )

    const level = LEVEL_CONFIG[userLevel?.level] || LEVEL_CONFIG['Beginner']
    const acceptanceRate = user.total_answers_given > 0
        ? Math.round((user.accepted_answers_count / user.total_answers_given) * 100)
        : 0

    const stats = [
        { icon: <HelpCircle size={18} />, label: 'Doubts', value: user.total_doubts_asked || 0, color: 'text-violet-400' },
        { icon: <MessageCircle size={18} />, label: 'Answers', value: user.total_answers_given || 0, color: 'text-blue-400' },
        { icon: <CheckCircle size={18} />, label: 'Accepted', value: user.accepted_answers_count || 0, color: 'text-green-400' },
        { icon: <Star size={18} />, label: 'Reputation', value: userLevel?.total_reputation || 0, color: 'text-yellow-400' },
        { icon: <Flame size={18} />, label: 'Streak', value: `${userLevel?.streak_days || 0}d`, color: 'text-orange-400' },
        { icon: <Award size={18} />, label: 'Accept Rate', value: `${acceptanceRate}%`, color: 'text-cyan-400' },
    ]

    const tabs = [
        { id: 'doubts', label: 'Doubts', icon: <HelpCircle size={14} /> },
        { id: 'answers', label: 'Answers', icon: <MessageCircle size={14} /> },
        { id: 'badges', label: 'Badges', icon: <Award size={14} /> },
    ]

    return (
        <div className="min-h-screen bg-gray-950 text-slate-200 pb-20">

            {/* Cover */}
            <div className="relative h-52 overflow-hidden bg-gray-900">
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: 'linear-gradient(rgba(139,92,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.4) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                />
                {/* Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-30"
                    style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.6) 0%, transparent 70%)' }}
                />
                {/* Streak badge on cover */}
                {(userLevel?.streak_days || 0) > 0 && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-gray-900/80 border border-orange-500/30 rounded-full px-3 py-1.5 backdrop-blur-sm">
                        <Flame size={14} className="text-orange-400" />
                        <span className="text-orange-400 font-bold text-xs">{userLevel.streak_days} day streak</span>
                    </div>
                )}
            </div>

            <div className="max-w-3xl mx-auto px-4">

                {/* Avatar + Actions */}
                <div className="flex items-end justify-between -mt-14 mb-5 flex-wrap gap-3">
                    {/* Avatar */}
                    <div className="relative">
                        <div className={`p-0.5 rounded-full bg-gradient-to-br from-violet-500 to-blue-500`}>
                            <div className="w-24 h-24 rounded-full bg-gray-900 border-4 border-gray-950 flex items-center justify-center text-3xl font-black text-violet-400 overflow-hidden">
                                {user.avatar
                                    ? <img src={user.avatar.startsWith('http') ? user.avatar : `http://127.0.0.1:8000${user.avatar}`}
                                        alt="" className="w-full h-full object-cover" />
                                    : user.username?.[0]?.toUpperCase()
                                }
                            </div>
                        </div>
                        {/* Level badge */}
                        <div className={`absolute -bottom-1 -right-1 flex items-center gap-1 ${level.bg} ${level.border} border rounded-full px-2 py-0.5`}>
                            <span className="text-xs">{level.emoji}</span>
                            <span className={`text-xs font-bold ${level.color}`}>{userLevel?.level || 'Beginner'}</span>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 pb-2">
                        {isOwnProfile ? (
                            <button
                                onClick={() => navigate('/settings')}
                                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                            >
                                <Edit3 size={14} /> Edit Profile
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsFollowing(f => !f)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isFollowing
                                        ? 'bg-gray-800 border border-violet-500/50 text-violet-400 hover:bg-gray-700'
                                        : 'bg-violet-600 hover:bg-violet-700 text-white'
                                        }`}
                                >
                                    <Users size={14} />
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                                <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-semibold transition-all">
                                    <MessageCircle size={14} /> Message
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Name + Info */}
                <div className="mb-6">
                    <h1 className="text-2xl font-black text-white tracking-tight mb-1">{user.first_name} {user.last_name}</h1>
                    {user.profile?.field_of_study && (
                        <p className="text-violet-400 font-semibold text-sm mb-2">{user.profile.field_of_study}</p>
                    )}
                    {user.bio && (
                        <p className="text-slate-400 text-sm leading-relaxed mb-3 max-w-xl">{user.bio}</p>
                    )}

                    {/* Meta row */}
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                        {user.location && (
                            <span className="flex items-center gap-1.5">
                                <MapPin size={13} className="text-violet-400" /> {user.location}
                            </span>
                        )}
                        {user.profile?.institution && (
                            <span className="flex items-center gap-1.5">
                                <GraduationCap size={13} className="text-violet-400" />
                                {user.profile.institution}
                                {user.profile.grade_or_year && ` · ${user.profile.grade_or_year}`}
                            </span>
                        )}
                        {user.date_joined && (
                            <span className="flex items-center gap-1.5">
                                <Calendar size={13} className="text-violet-400" />
                                Joined {new Date(user.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                        )}
                    </div>

                    {/* Social links */}
                    <div className="flex gap-3 mt-3">
                        {user.profile?.github && (
                            <a href={user.profile.github} target="_blank" rel="noreferrer"
                                className="flex items-center gap-1.5 text-slate-500 hover:text-white text-xs transition-colors">
                                <Github size={14} /> GitHub
                            </a>
                        )}
                        {user.profile?.linkedin && (
                            <a href={user.profile.linkedin} target="_blank" rel="noreferrer"
                                className="flex items-center gap-1.5 text-slate-500 hover:text-blue-400 text-xs transition-colors">
                                <Linkedin size={14} /> LinkedIn
                            </a>
                        )}
                        {user.profile?.twitter && (
                            <a href={user.profile.twitter} target="_blank" rel="noreferrer"
                                className="flex items-center gap-1.5 text-slate-500 hover:text-sky-400 text-xs transition-colors">
                                <Twitter size={14} /> Twitter
                            </a>
                        )}
                        {user.profile?.website && (
                            <a href={user.profile.website} target="_blank" rel="noreferrer"
                                className="flex items-center gap-1.5 text-slate-500 hover:text-violet-400 text-xs transition-colors">
                                <Globe size={14} /> Website
                            </a>
                        )}
                    </div>

                    {/* Followers row */}
                    <div className="flex gap-5 mt-4">
                        <button className="text-sm hover:text-white transition-colors">
                            <span className="font-bold text-white">{user.followers_count || 0}</span>
                            <span className="text-slate-500 ml-1">Followers</span>
                        </button>
                        <button className="text-sm hover:text-white transition-colors">
                            <span className="font-bold text-white">{user.following_count || 0}</span>
                            <span className="text-slate-500 ml-1">Following</span>
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center hover:border-violet-500/30 transition-all">
                            <div className={`flex justify-center mb-2 ${stat.color}`}>{stat.icon}</div>
                            <div className="text-xl font-black text-white">{stat.value}</div>
                            <div className="text-xs text-slate-500 mt-0.5 font-medium">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Streak Banner */}
                {(userLevel?.streak_days || 0) >= 3 && (
                    <div className="bg-gradient-to-r from-orange-950/50 to-yellow-950/50 border border-orange-500/20 rounded-2xl p-4 mb-5 flex items-center gap-4">
                        <div className="text-4xl">🔥</div>
                        <div className="flex-1">
                            <div className="font-bold text-orange-400 text-sm">{userLevel.streak_days} Day Streak!</div>
                            <div className="text-xs text-slate-500 mt-0.5">Keep solving doubts every day to maintain your streak</div>
                        </div>
                        <div className="bg-orange-500/20 border border-orange-500/30 rounded-full px-3 py-1 text-orange-400 font-bold text-xs">
                            +{userLevel.streak_days * 5} XP
                        </div>
                    </div>
                )}

                {/* Skills */}
                {user.skills?.length > 0 && (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-5">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                            <Zap size={13} className="text-violet-400" /> Skills
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {user.skills.map((skill, i) => (
                                <span key={i} className="bg-violet-500/10 border border-violet-500/20 text-violet-300 rounded-lg px-3 py-1 text-xs font-semibold">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-5">
                    <div className="flex border-b border-gray-800">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab.id
                                    ? 'text-violet-400 border-b-2 border-violet-500 bg-violet-500/5'
                                    : 'text-slate-600 hover:text-slate-400'
                                    }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-5">
                        {/* Doubts Tab */}
                        {activeTab === 'doubts' && (
                            <div>
                                {user.total_doubts_asked > 0 ? (
                                    <div className="text-slate-500 text-sm text-center py-8">
                                        Doubts will appear here — connect doubts API to this tab
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <div className="text-4xl mb-3">📚</div>
                                        <div className="text-slate-500 text-sm">No doubts asked yet</div>
                                        <Link to="/ask" className="inline-block mt-3 text-violet-400 text-xs font-semibold hover:text-violet-300">
                                            Ask your first doubt →
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Answers Tab */}
                        {activeTab === 'answers' && (
                            <div className="text-center py-10">
                                <div className="text-4xl mb-3">💬</div>
                                <div className="text-slate-500 text-sm">No answers given yet</div>
                            </div>
                        )}

                        {/* Badges Tab */}
                        {activeTab === 'badges' && (
                            <div>
                                {badges.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {badges.map((ub, i) => {
                                            const config = BADGE_CONFIG[ub.badge?.slug] || { icon: '🏅', label: ub.badge?.name, color: 'text-slate-400', bg: 'bg-slate-800', border: 'border-slate-700' }
                                            return (
                                                <div key={i} className={`flex items-center gap-3 ${config.bg} border ${config.border} rounded-xl p-3`}>
                                                    <span className="text-2xl">{config.icon}</span>
                                                    <div>
                                                        <div className={`text-xs font-bold ${config.color}`}>{config.label || ub.badge?.name}</div>
                                                        <div className="text-xs text-slate-600 mt-0.5">
                                                            {new Date(ub.awarded_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <div className="text-4xl mb-3">🏅</div>
                                        <div className="text-slate-500 text-sm">No badges earned yet</div>
                                        <div className="text-slate-600 text-xs mt-1">Start solving doubts to earn badges</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    )
}