"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import LanguageSwitcher from './LanguageSwitcher';
import AuthButton from './AuthButton';
import { User } from '@supabase/supabase-js';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ user }: { user: User | null }) {
    const t = useTranslations('Navigation');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <nav className="w-full bg-black/50 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="text-xl font-bold tracking-tight text-white hover:text-white/80 transition-colors">
                            StudentProjects
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <div className="flex gap-6 text-sm font-medium">
                            <Link href="/" className="text-gray-300 hover:text-white transition-colors">{t('home')}</Link>
                            <Link href="/guide" className="text-gray-300 hover:text-white transition-colors">{t('guide')}</Link>
                            <Link href={user ? "/dashboard" : "/projects"} className="text-gray-300 hover:text-white transition-colors">{t('projects')}</Link>
                        </div>

                        <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                            {user && (
                                <div className="hidden lg:flex flex-col items-end">
                                    <span className="text-sm font-medium text-white">
                                        {user.user_metadata.full_name}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {user.user_metadata.student_number}
                                        {user.user_metadata.department && ` • ${user.user_metadata.department}`}
                                    </span>
                                </div>
                            )}
                            <AuthButton user={user} />
                            <LanguageSwitcher />
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-4 md:hidden">
                        <LanguageSwitcher />
                        <button
                            onClick={toggleMenu}
                            className="text-gray-300 hover:text-white p-2 rounded-md focus:outline-none"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl"
                    >
                        <div className="px-4 pt-2 pb-6 flex flex-col gap-4">
                            <Link
                                href="/"
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-md"
                            >
                                {t('home')}
                            </Link>
                            <Link
                                href="/guide"
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-md"
                            >
                                {t('guide')}
                            </Link>
                            <Link
                                href={user ? "/dashboard" : "/projects"}
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-md"
                            >
                                {t('projects')}
                            </Link>

                            <div className="border-t border-white/10 pt-4 mt-2">
                                {user && (
                                    <div className="px-3 py-2 mb-2">
                                        <div className="text-sm font-medium text-white">{user.user_metadata.full_name}</div>
                                        <div className="text-xs text-gray-500">{user.user_metadata.student_number}</div>
                                    </div>
                                )}
                                <div className="px-3">
                                    <AuthButton user={user} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
