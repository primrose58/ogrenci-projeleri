
"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import RealtimeFeed from '@/components/RealtimeFeed';
import { Project } from '@/types/project';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import Input from '@/components/ui/Input';
import { SocialIcon } from '@/lib/utils/social';
import { LayoutGrid, List, Edit2, X, Link as LinkIcon } from 'lucide-react';
import { toast } from "sonner";
import EditProfileModal from '@/components/EditProfileModal';

export default function DashboardClient({
    user,
    userProfile,
    myProjects,
    allProjects
}: {
    user: User,
    userProfile: any,
    myProjects: Project[],
    allProjects: Project[]
}) {
    const t = useTranslations('Dashboard');
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

    // Derived state for display from props
    const displayName = userProfile?.full_name || user.user_metadata?.full_name || user.email;
    const avatarUrl = userProfile?.avatar_url || user.user_metadata?.avatar_url;
    const socialLinks = (userProfile?.social_links || []) as string[];

    const userInfo = user.user_metadata || {};

    // Initial profile data to pass to the modal
    const initialProfile = {
        full_name: userProfile?.full_name || user.user_metadata?.full_name || '',
        avatar_url: avatarUrl || '',
        social_links: socialLinks,
        birth_date: userProfile?.birth_date || user.user_metadata?.birth_date
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4 pt-8">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-4">
                            {/* Clickable Avatar Trigger */}
                            <button
                                onClick={() => setIsEditProfileOpen(true)}
                                className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white dark:border-white/10 shadow-lg group transition-transform hover:scale-105"
                                title="Edit Avatar"
                            >
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                                        {displayName?.charAt(0) || '?'}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Edit2 size={16} className="text-white" />
                                </div>
                            </button>

                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {t('welcome', { name: displayName })}
                                    </h1>
                                    <button
                                        onClick={() => setIsEditProfileOpen(true)}
                                        className="p-1.5 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 rounded-full transition-colors text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                                        title="Profili Düzenle"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-gray-600 dark:text-gray-400 mt-1">
                                    <span className="bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-sm font-medium">{userInfo.student_number}</span>
                                    {userInfo.department && (
                                        <span className="bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 px-2 py-1 rounded text-sm border border-purple-200 dark:border-purple-500/20">
                                            {userInfo.department}
                                        </span>
                                    )}

                                    {/* Social Icons Display */}
                                    <div className="flex items-center gap-2 ml-2 border-l border-gray-300 dark:border-white/10 pl-3">
                                        {socialLinks.map((link, i) => (
                                            link.trim() !== '' && (
                                                <SocialIcon key={i} url={link} size={18} />
                                            )
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 ml-1">
                            {t('subTitle')}
                        </p>
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg border border-gray-200 dark:border-white/10">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            <List size={20} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-gray-200 dark:border-white/10">
                    <button
                        onClick={() => setActiveTab('my')}
                        className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'my' ? 'text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white/80'
                            } `}
                    >
                        {t('myProjects')}
                        {activeTab === 'my' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'all' ? 'text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white/80'
                            } `}
                    >
                        {t('community')}
                        {activeTab === 'all' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 rounded-t-full" />
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="min-h-[50vh]">
                    {activeTab === 'my' ? (
                        <>
                            {myProjects.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <p className="text-gray-500">{t('noProjects')}</p>
                                    <Link href="/upload" className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium hover:opacity-90 transition-opacity">
                                        {t('uploadFirst')}
                                    </Link>
                                </div>
                            ) : (
                                <RealtimeFeed serverProjects={myProjects} userId={user.id} viewMode={viewMode} currentUserId={user.id} />
                            )}
                        </>
                    ) : (
                        <RealtimeFeed serverProjects={allProjects} viewMode={viewMode} currentUserId={user.id} />
                    )}
                </div>
            </div>

            {/* Edit Profile Modal Shared Component */}
            <EditProfileModal
                isOpen={isEditProfileOpen}
                onClose={() => setIsEditProfileOpen(false)}
                user={user}
                initialProfile={initialProfile}
                onSuccess={() => {
                    router.refresh();
                    toast.success("Profil başarıyla güncellendi!");
                }}
            />
        </div>
    );
}
