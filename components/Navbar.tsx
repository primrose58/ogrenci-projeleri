import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import LanguageSwitcher from './LanguageSwitcher';
import AuthButton from './AuthButton';
import { User } from '@supabase/supabase-js';

export default function Navbar({ user }: { user: User | null }) {
    const t = useTranslations('Navigation');

    return (
        <nav className="w-full flex justify-between items-center p-4 bg-black/50 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
            <Link href="/" className="text-xl font-bold tracking-tight text-white hover:text-white/80 transition-colors">
                StudentProjects
            </Link>
            <div className="flex items-center gap-6">
                <div className="hidden md:flex gap-4 text-sm font-medium">
                    <Link href="/" className="hover:text-white/80 transition-colors">{t('home')}</Link>
                    <Link href="/projects" className="hover:text-white/80 transition-colors">{t('projects')}</Link>
                </div>
                <div className="flex items-center gap-4">
                    {user && (
                        <div className="hidden lg:flex flex-col items-end mr-2">
                            <span className="text-sm font-medium text-white">
                                {user.user_metadata.full_name}
                            </span>
                            <span className="text-xs text-gray-400">
                                {user.user_metadata.student_number}
                            </span>
                        </div>
                    )}
                    <AuthButton user={user} />
                    <LanguageSwitcher />
                </div>
            </div>
        </nav>
    );
}
