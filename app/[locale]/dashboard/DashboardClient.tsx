
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
        avatar_url: userProfile?.avatar_url || user.user_metadata?.avatar_url || '',
        social_links: (userProfile?.social_links || []) as string[]
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
                    avatar_url: profileForm.avatar_url,
                    social_links: profileForm.social_links.filter(l => l.trim() !== ''),
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (profileError) throw profileError;

            // 2. Update auth metadata (optional but good for consistency)
            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    full_name: profileForm.full_name,
                    avatar_url: profileForm.avatar_url
                }
            });

            if (authError) throw authError;

            router.refresh(); // Refresh to see changes
            toast.success("Profil başarıyla güncellendi!");
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Profil güncellenirken bir hata oluştu veya yetkiniz yok.');
        } finally {
            setIsSaving(false);
            setIsEditProfileOpen(false);
        }
    };

    // Helper to add a new empty link
    const addSocialLink = () => {
        setProfileForm(prev => ({
            ...prev,
            social_links: [...prev.social_links, '']
        }));
    };

    // Helper to update a link at index
    const updateSocialLink = (index: number, val: string) => {
        const newLinks = [...profileForm.social_links];
        newLinks[index] = val;
        setProfileForm(prev => ({ ...prev, social_links: newLinks }));
    };

    // Helper to remove a link
    const removeSocialLink = (index: number) => {
        const newLinks = [...profileForm.social_links];
        newLinks.splice(index, 1);
        setProfileForm(prev => ({ ...prev, social_links: newLinks }));
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
                                {profileForm.avatar_url ? (
                                    <img src={profileForm.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                                        {profileForm.full_name?.charAt(0) || '?'}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Edit2 size={16} className="text-white" />
                                </div>
                            </button>

                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {t('welcome', { name: profileForm.full_name || user.email })}
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
                                        {profileForm.social_links.map((link, i) => (
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

            {/* Edit Profile Modal */}
            {isEditProfileOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-xl max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setIsEditProfileOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Profili Düzenle</h2>

                        <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
                            {/* Avatar Upload */}
                            <div className="flex flex-col items-center gap-3 mb-2">
                                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 group">
                                    {profileForm.avatar_url ? (
                                        <img
                                            src={profileForm.avatar_url}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400">
                                            <span className="text-3xl">{profileForm.full_name?.charAt(0) || '?'}</span>
                                        </div>
                                    )}
                                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                                        <span className="text-xs text-white font-medium">Değiştir</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                // Optimistic preview
                                                const objectUrl = URL.createObjectURL(file);
                                                setProfileForm(prev => ({ ...prev, avatar_url: objectUrl }));

                                                // Upload immediately
                                                try {
                                                    const supabase = createClient();
                                                    const fileExt = file.name.split('.').pop();
                                                    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
                                                    const filePath = `${fileName}`;

                                                    const { error: uploadError } = await supabase.storage
                                                        .from('avatars')
                                                        .upload(filePath, file);

                                                    if (uploadError) throw uploadError;

                                                    const { data: { publicUrl } } = supabase.storage
                                                        .from('avatars')
                                                        .getPublicUrl(filePath);

                                                    setProfileForm(prev => ({ ...prev, avatar_url: publicUrl }));
                                                } catch (error) {
                                                    console.error('Avatar upload error:', error);
                                                    toast.error('Avatar yüklenirken hata oluştu.');
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                                <div className="flex gap-2">
                                    <label className="text-xs text-blue-500 hover:text-blue-600 cursor-pointer font-medium">
                                        Fotoğraf Seç
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                // Same upload logic as above (duplicated for reliability)
                                                // Ideally refactor to handler function
                                                const objectUrl = URL.createObjectURL(file);
                                                setProfileForm(prev => ({ ...prev, avatar_url: objectUrl }));
                                                try {
                                                    const supabase = createClient();
                                                    const fileExt = file.name.split('.').pop();
                                                    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
                                                    const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
                                                    if (uploadError) throw uploadError;
                                                    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
                                                    setProfileForm(prev => ({ ...prev, avatar_url: publicUrl }));
                                                } catch (error) {
                                                    console.error('Avatar upload error:', error);
                                                    toast.error('Avatar yüklenirken hata oluştu.');
                                                }
                                            }}
                                        />
                                    </label>
                                    <span className="text-gray-300">|</span>
                                    {profileForm.avatar_url && (
                                        <button
                                            type="button"
                                            onClick={() => setProfileForm(prev => ({ ...prev, avatar_url: '' }))}
                                            className="text-xs text-red-500 hover:underline"
                                        >
                                            Kaldır
                                        </button>
                                    )}
                                </div>
                            </div>

                            <Input
                                label="Ad Soyad"
                                value={profileForm.full_name}
                                onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                                placeholder="Adınız Soyadınız"
                            />

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-400">Sosyal Medya Linkleri</label>
                                <p className="text-xs text-gray-500 mb-2">
                                    Instagram, GitHub, LinkedIn profil linklerinizi veya E-posta adresinizi ekleyebilirsiniz. İkonlar otomatik algılanır.
                                </p>

                                <div className="space-y-3">
                                    {profileForm.social_links.map((link, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <div className="relative flex-1">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                                    {link ? <SocialIcon url={link} size={16} /> : <LinkIcon size={16} />}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={link}
                                                    onChange={(e) => updateSocialLink(index, e.target.value)}
                                                    placeholder="https://..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:ring-2 focus:ring-purple-500 outline-none placeholder-gray-600"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeSocialLink(index)}
                                                className="p-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={addSocialLink}
                                        className="text-sm text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 mt-1"
                                    >
                                        + Link Ekle
                                    </button>
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
