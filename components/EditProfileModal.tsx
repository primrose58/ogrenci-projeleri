"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Input from '@/components/ui/Input';
import { SocialIcon } from '@/lib/utils/social';
import { X, Link as LinkIcon } from 'lucide-react';
import { toast } from "sonner";
import { useRouter } from '@/i18n/routing';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any; // User object or similar structure with id
    initialProfile: {
        full_name: string;
        avatar_url: string;
        social_links: string[];
    };
    onSuccess?: () => void;
}

export default function EditProfileModal({ isOpen, onClose, user, initialProfile, onSuccess }: EditProfileModalProps) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [profileForm, setProfileForm] = useState(initialProfile);

    // Helpers
    const addSocialLink = () => {
        setProfileForm(prev => ({
            ...prev,
            social_links: [...prev.social_links, '']
        }));
    };

    const updateSocialLink = (index: number, val: string) => {
        const newLinks = [...profileForm.social_links];
        newLinks[index] = val;
        setProfileForm(prev => ({ ...prev, social_links: newLinks }));
    };

    const removeSocialLink = (index: number) => {
        const newLinks = [...profileForm.social_links];
        newLinks.splice(index, 1);
        setProfileForm(prev => ({ ...prev, social_links: newLinks }));
    };

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

            // 2. Update auth metadata
            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    full_name: profileForm.full_name,
                    avatar_url: profileForm.avatar_url
                }
            });

            if (authError) throw authError;

            router.refresh();
            toast.success("Profil başarıyla güncellendi!");
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Profil güncellenirken bir hata oluştu veya yetkiniz yok.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-xl max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
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

                                        const objectUrl = URL.createObjectURL(file);
                                        setProfileForm(prev => ({ ...prev, avatar_url: objectUrl }));

                                        try {
                                            const supabase = createClient();
                                            const fileExt = file.name.split('.').pop();
                                            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
                                            const { error: uploadError } = await supabase.storage
                                                .from('avatars')
                                                .upload(fileName, file);

                                            if (uploadError) throw uploadError;

                                            const { data: { publicUrl } } = supabase.storage
                                                .from('avatars')
                                                .getPublicUrl(fileName);

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
                            Instagram, GitHub, LinkedIn profil linklerinizi veya E-posta adresinizi ekleyebilirsiniz.
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
    );
}
