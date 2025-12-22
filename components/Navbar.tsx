"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import LanguageSwitcher from './LanguageSwitcher';
import AuthButton from './AuthButton';
import { User } from '@supabase/supabase-js';
import { Menu, X, Network } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import ThemeToggle from './ThemeToggle';

export default function Navbar({ user }: { user: User | null }) {
    const t = useTranslations('Navigation');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <nav className="w-full bg-white/95 dark:bg-black/50 backdrop-blur-md border-b border-gray-200 dark:border-white/10 sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg group-hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] transition-all duration-300">
                                <Network size={24} className="text-white" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 group-hover:from-purple-600 group-hover:to-pink-600 dark:group-hover:from-purple-400 dark:group-hover:to-pink-400 transition-all duration-300 hidden sm:block">
                                {t('brand')}
                            </span>
                            <span className="text-xl font-bold text-gray-900 dark:text-white sm:hidden">SPN</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <div className="flex gap-6 text-sm font-medium">
                            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">{t('home')}</Link>
                            <Link href="/guide" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">{t('guide')}</Link>
                            <Link href={user ? "/dashboard" : "/projects"} className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">{t('projects')}</Link>
                        </div>

                        <div className="flex items-center gap-4 pl-6 border-l border-gray-200 dark:border-white/10">
                            {user && (
                                <div className="hidden lg:flex flex-col items-end">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {user.user_metadata.full_name}
                                    </span>
                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-400">
                                        {user.user_metadata.student_number}
                                        {user.user_metadata.department && ` • ${user.user_metadata.department}`}
                                    </span>
                                </div>
                            )}
                            <ThemeToggle />
                            <AuthButton user={user} />
                            <LanguageSwitcher />
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-4 md:hidden">
                        <ThemeToggle />
                        <LanguageSwitcher />
                        <button
                            onClick={toggleMenu}
                            className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white p-2 rounded-md focus:outline-none"
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
                        className="md:hidden border-t border-gray-200 dark:border-white/10 bg-white/95 dark:bg-black/95 backdrop-blur-xl"
                    >
                        <div className="px-4 pt-2 pb-6 flex flex-col gap-4">
                            <Link
                                href="/"
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-md"
                            >
                                {t('home')}
                            </Link>
                            <Link
                                href="/guide"
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-md"
                            >
                                {t('guide')}
                            </Link>
                            <Link
                                href={user ? "/dashboard" : "/projects"}
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-md"
                            >
                                {t('projects')}
                            </Link>

                            <div className="border-t border-gray-200 dark:border-white/10 pt-4 mt-2">
                                {user && (
                                    <div className="px-3 py-2 mb-2">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.user_metadata.full_name}</div>
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
