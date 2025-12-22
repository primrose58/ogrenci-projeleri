"use client";

import { useTranslations } from "next-intl";
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { Github, Database, UploadCloud, Globe, ArrowRight, ExternalLink } from "lucide-react";

export default function GuidePage() {
    const t = useTranslations('Guide');

    const steps = [
        {
            key: 'step1',
            icon: <Github size={28} className="text-white" />,
            color: "from-gray-700 to-gray-900",
            image: "/guide/step1.png",
            action: {
                label: t('openGithub'),
                url: "https://github.com/join"
            }
        },
        {
            key: 'step2',
            icon: <Database size={28} className="text-white" />,
            color: "from-green-600 to-emerald-500",
            image: "/guide/step2.png",
            action: {
                label: t('openSupabase'),
                url: "https://supabase.com"
            }
        },
        {
            key: 'step3',
            icon: <Globe size={28} className="text-white" />,
            color: "from-blue-600 to-cyan-500",
            image: "/guide/step3.png",
            action: {
                label: t('openVercel'),
                url: "https://vercel.com/signup"
            }
        },
        {
            key: 'step4',
            icon: <UploadCloud size={28} className="text-white" />,
            color: "from-purple-600 to-pink-500",
            image: "/guide/step4.png",
            action: {
                label: t('goToUpload'),
                url: "/upload",
                internal: true
            }
        }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white pt-24 pb-20 px-4 transition-colors">
            <div className="max-w-6xl mx-auto space-y-16">

                {/* Header */}
                <div className="text-center space-y-6">
                    <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 dark:from-purple-400 dark:via-pink-500 dark:to-red-500">
                        {t('title')}
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        {t('subTitle')}
                    </p>
                </div>

                {/* Steps */}
                <div className="space-y-24">
                    {steps.map((step, index) => (
                        <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 group`}>

                            {/* Visual Side */}
                            <div className="w-full lg:w-1/2 relative">
                                <div className={`absolute -inset-4 bg-gradient-to-br ${step.color} rounded-3xl blur-2xl opacity-20 dark:opacity-20 group-hover:opacity-30 transition duration-700`}></div>
                                <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-2xl bg-gray-50 dark:bg-gray-900 aspect-video group-hover:scale-[1.02] transition duration-500">
                                    <Image
                                        src={step.image}
                                        alt={t(`${step.key}` as any)}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 to-transparent dark:from-black/60 dark:to-transparent"></div>
                                </div>
                            </div>

                            {/* Content Side */}
                            <div className="w-full lg:w-1/2 space-y-6">
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg shadow-${step.color}/20 text-white`}>
                                    {step.icon}
                                </div>

                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {t(`${step.key}` as any)}
                                </h2>

                                <div className="space-y-4">
                                    <p className="text-purple-600 dark:text-purple-300 font-medium text-lg">
                                        {t(`${step.key}Desc` as any)}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                                        {t(`${step.key}Content` as any)}
                                    </p>
                                </div>

                                <div className="pt-4">
                                    {step.action.internal ? (
                                        <Link
                                            href={step.action.url}
                                            className="px-6 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-900 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 dark:text-white font-medium inline-flex items-center gap-2 transition-all group-hover:border-purple-500/50"
                                        >
                                            {step.action.label}
                                            <ArrowRight size={18} />
                                        </Link>
                                    ) : (
                                        <a
                                            href={step.action.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-6 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-900 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 dark:text-white font-medium inline-flex items-center gap-2 transition-all group-hover:border-purple-500/50"
                                        >
                                            {step.action.label}
                                            <ExternalLink size={18} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Message */}
                <div className="text-center pt-12 border-t border-gray-200 dark:border-white/10">
                    <p className="text-gray-600 dark:text-gray-500 text-lg">
                        Takıldığın bir yer mi var? <Link href="/dashboard" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 underline">Topluluk</Link> bölümünden sorabilirsin.
                    </p>
                </div>
            </div>
        </div>
    );
}
