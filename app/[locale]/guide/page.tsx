"use client";

import { useTranslations } from "next-intl";
import { Link } from '@/i18n/routing';
import { Github, UploadCloud, Globe, ArrowRight } from "lucide-react";

export default function GuidePage() {
    const t = useTranslations('Guide');

    const steps = [
        {
            key: 'step1',
            icon: <Github size={32} className="text-white" />,
            color: "from-gray-700 to-gray-900",
            action: {
                label: t('openGithub'),
                url: "https://github.com/join"
            }
        },
        {
            key: 'step2',
            icon: <Globe size={32} className="text-white" />,
            color: "from-blue-600 to-cyan-500",
            action: {
                label: t('openVercel'),
                url: "https://vercel.com/signup"
            }
        },
        {
            key: 'step3',
            icon: <UploadCloud size={32} className="text-white" />,
            color: "from-purple-600 to-pink-500",
            action: {
                label: t('goToUpload'),
                url: "/upload",
                internal: true
            }
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto space-y-12">

                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        {t('title')}
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        {t('subTitle')}
                    </p>
                </div>

                <div className="grid gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="relative group">
                            <div className={`absolute -inset-1 bg-gradient-to-r ${step.color} rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500`}></div>
                            <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">

                                <div className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                                    {step.icon}
                                </div>

                                <div className="flex-1 space-y-3">
                                    <h2 className="text-2xl font-bold text-white">
                                        {t(`${step.key}` as any)}
                                    </h2>
                                    <p className="text-gray-400 text-lg leading-relaxed">
                                        {t(`${step.key}Content` as any)}
                                    </p>

                                    <div className="pt-2">
                                        {step.action.internal ? (
                                            <Link
                                                href={step.action.url}
                                                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium transition-colors"
                                            >
                                                {step.action.label}
                                                <ArrowRight size={18} />
                                            </Link>
                                        ) : (
                                            <a
                                                href={step.action.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
                                            >
                                                {step.action.label}
                                                <ArrowRight size={18} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center pt-8">
                    <p className="text-gray-500">
                        Başka soruların mı var? Topluluk bölümünden bize ulaşabilirsin.
                    </p>
                </div>
            </div>
        </div>
    );
}
