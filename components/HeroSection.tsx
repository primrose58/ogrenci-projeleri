"use client";

import { useTranslations } from 'next-intl';
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Code2, Rocket } from "lucide-react";
import { User } from '@supabase/supabase-js';

export default function HeroSection({ user }: { user: User | null }) {
    const t = useTranslations('HomePage');

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <section className="relative min-h-[80vh] flex flex-col items-center justify-center text-center p-4 overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-50/50 via-white to-white dark:from-purple-900/20 dark:via-black dark:to-black z-0 transition-colors duration-500" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 dark:opacity-20 z-0 mix-blend-overlay"></div>

            {/* Floating Elements Animation */}
            <motion.div
                animate={{
                    y: [0, -20, 0],
                    rotate: [0, 5, 0]
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "reverse"
                }}
                className="absolute top-20 left-[10%] opacity-20 blur-sm"
            >
                <Code2 size={120} className="text-blue-500" />
            </motion.div>

            <motion.div
                animate={{
                    y: [0, 20, 0],
                    rotate: [0, -5, 0]
                }}
                transition={{
                    duration: 7,
                    repeat: Infinity,
                    repeatType: "reverse"
                }}
                className="absolute bottom-40 right-[10%] opacity-20 blur-sm"
            >
                <Rocket size={120} className="text-pink-500" />
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 max-w-5xl flex flex-col items-center gap-8"
            >
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm md:text-base text-purple-600 dark:text-purple-300 backdrop-blur-sm">
                    <Sparkles size={16} />
                    <span>{t('bannerTag')}</span>
                </motion.div>

                <motion.h1
                    variants={itemVariants}
                    className="text-6xl md:text-8xl font-black tracking-tight"
                >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 drop-shadow-sm dark:drop-shadow-2xl">
                        {t('title')}
                    </span>
                </motion.h1>

                <motion.p
                    variants={itemVariants}
                    className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl font-light leading-relaxed"
                >
                    {t('subTitle')}
                </motion.p>

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-4">
                    <Link href={user ? "/dashboard" : "/auth"}>
                        <button className="group relative px-8 py-4 bg-gray-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-100 font-bold rounded-full text-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-xl dark:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                            {user ? t('goToDashboard') : t('getStarted')}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                    {!user && (
                        <Link href="/projects">
                            <button className="px-8 py-4 bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 font-medium rounded-full text-lg border border-gray-200 dark:border-white/10 transition-all backdrop-blur-sm">
                                {t('exploreProjects')}
                            </button>
                        </Link>
                    )}
                </motion.div>
            </motion.div>
        </section>
    );
}
