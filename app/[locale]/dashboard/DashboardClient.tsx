"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import RealtimeFeed from '@/components/RealtimeFeed';
import { Project } from '@/types/project';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import Input from '@/components/ui/Input';

import { LayoutGrid, List, Edit2, X, Github, Linkedin, Globe, Instagram } from 'lucide-react';

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
    const [isSaving, setIsSaving] = useState(false);

    // Initial state from profile or metadata
    const [profileForm, setProfileForm] = useState({
        full_name: userProfile?.full_name || user.user_metadata?.full_name || '',
        linkedin_url: userProfile?.linkedin_url || '',
        github_url: userProfile?.github_url || '',
        website_url: userProfile?.website_url || '',
        instagram_url: userProfile?.instagram_url || ''
    });

    const userInfo = user.user_metadata || {};

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const supabase = createClient();

            // 1. Update profiles table
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: profileForm.full_name,
                    linkedin_url: profileForm.linkedin_url,
                    github_url: profileForm.github_url,
                    website_url: profileForm.website_url,
                    instagram_url: profileForm.instagram_url,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (profileError) throw profileError;

            // 2. Update auth metadata (optional but good for consistency)
            const { error: authError } = await supabase.auth.updateUser({
                data: { full_name: profileForm.full_name }
            });

            if (authError) throw authError;

            setIsEditProfileOpen(false);
            router.refresh(); // Refresh to see changes
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Profil güncellenirken bir hata oluştu.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4 pt-8">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-white">
                                {t('welcome', { name: profileForm.full_name || user.email })}
                            </h1>
                            <button
                                onClick={() => setIsEditProfileOpen(true)}
                                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-gray-300 hover:text-white"
                                title="Profili Düzenle"
                            >
                                <Edit2 size={16} />
                            </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-gray-400">
                            <span className="bg-white/10 px-2 py-1 rounded text-sm">{userInfo.student_number}</span>
                            {userInfo.department && (
                                <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-sm border border-purple-500/20">
                                    {userInfo.department}
                                </span>
                            )}

                            {/* Social Icons */}
                            <div className="flex items-center gap-2 ml-2 border-l border-white/10 pl-3">
                                {profileForm.github_url && (
                                    <a href={profileForm.github_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                        <Github size={18} />
                                    </a>
                                )}
                                {profileForm.linkedin_url && (
                                    <a href={profileForm.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                                        <Linkedin size={18} />
                                    </a>
                                )}
                                {profileForm.website_url && (
                                    <a href={profileForm.website_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-400 transition-colors">
                                        <Globe size={18} />
                                    </a>
                                )}
                                {profileForm.instagram_url && (
                                    <a href={profileForm.instagram_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-400 transition-colors">
                                        <Instagram size={18} />
                                    </a>
                                )}
                            </div>
                        </div>
                        <p className="text-gray-400 mt-1">
                            {t('subTitle')}
                        </p>
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <List size={20} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('my')}
                        className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'my' ? 'text-white' : 'text-gray-400 hover:text-white/80'
                            }`}
                    >
                        {t('myProjects')}
                        {activeTab === 'my' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'all' ? 'text-white' : 'text-gray-400 hover:text-white/80'
                            }`}
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

            {/* Edit Profile Modal */}
            {isEditProfileOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-xl">
                        <button
                            onClick={() => setIsEditProfileOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-xl font-bold text-white mb-6">Profili Düzenle</h2>

                        <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
                            <Input
                                label="Ad Soyad"
                                value={profileForm.full_name}
                                onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                                placeholder="Adınız Soyadınız"
                            />

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-400">Sosyal Medya Linkleri</label>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                            <Github size={16} />
                                        </div>
                                        <input
                                            type="url"
                                            value={profileForm.github_url}
                                            onChange={(e) => setProfileForm(prev => ({ ...prev, github_url: e.target.value }))}
                                            placeholder="GitHub Profil URL"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none placeholder-gray-600"
                                        />
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                            <Linkedin size={16} />
                                        </div>
                                        <input
                                            type="url"
                                            value={profileForm.linkedin_url}
                                            onChange={(e) => setProfileForm(prev => ({ ...prev, linkedin_url: e.target.value }))}
                                            placeholder="LinkedIn Profil URL"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none placeholder-gray-600"
                                        />
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                            <Instagram size={16} />
                                        </div>
                                        <input
                                            type="url"
                                            value={profileForm.instagram_url}
                                            onChange={(e) => setProfileForm(prev => ({ ...prev, instagram_url: e.target.value }))}
                                            placeholder="Instagram Profil URL"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none placeholder-gray-600"
                                        />
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                            <Globe size={16} />
                                        </div>
                                        <input
                                            type="url"
                                            value={profileForm.website_url}
                                            onChange={(e) => setProfileForm(prev => ({ ...prev, website_url: e.target.value }))}
                                            placeholder="Kişisel Web Sitesi URL"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none placeholder-gray-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="mt-2 w-full py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
