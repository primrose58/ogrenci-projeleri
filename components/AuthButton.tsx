"use client";

import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useState } from 'react';
import Button from './ui/Button';

export default function AuthButton({ user }: { user: User | null }) {
    const t = useTranslations('Navigation');
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        await supabase.auth.signOut();
        router.refresh();
        setLoading(false);
    };

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <Link
                    href="/upload"
                    className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/10 backdrop-blur-sm"
                >
                    {t('upload')}
                </Link>
                <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                    {loading ? '...' : t('logout')}
                </button>
            </div>
        );
    }

    return (
        <Link href="/auth" className="text-sm font-medium hover:text-white/80 transition-colors">
            {t('login')}
        </Link>
    );
}
