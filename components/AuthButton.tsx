"use client";

import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

export default function AuthButton({ user }: { user: User | null }) {
    const t = useTranslations('Navigation');
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(user);

    // Sync with server state if it changes
    useEffect(() => {
        setCurrentUser(user);
    }, [user]);

    // Listen for client-side auth changes
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                setCurrentUser(session?.user ?? null);
                router.refresh();
            } else if (event === 'SIGNED_OUT') {
                setCurrentUser(null);
                router.refresh();
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, router]);

    const handleLogout = async () => {
        setLoading(true);
        await supabase.auth.signOut();
        setLoading(false);
    };

    if (currentUser) {
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
                    className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
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
