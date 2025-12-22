"use client";

import { useState } from 'react';
import { Edit2 } from 'lucide-react';
import EditProfileModal from './EditProfileModal';

interface ProfileEditButtonProps {
    user: any;
    profile: any;
}

export default function ProfileEditButton({ user, profile }: ProfileEditButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Prepare initial profile data structure
    const initialProfile = {
        full_name: profile.full_name || '',
        avatar_url: profile.avatar_url || '',
        social_links: Array.isArray(profile.social_links) ? profile.social_links : [],
        birth_date: profile.birth_date
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium hover:bg-blue-500/20 transition-colors"
                title="Profili Düzenle"
            >
                <Edit2 size={16} />
                <span>Düzenle</span>
            </button>

            <EditProfileModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                user={user}
                initialProfile={initialProfile}
                onSuccess={() => window.location.reload()}
            />
        </>
    );
}
