"use client";

import { useTranslations } from 'next-intl';
import { motion } from "framer-motion";
import { Upload, Users, Globe } from "lucide-react";

export default function HowItWorks() {
    const t = useTranslations('HowItWorks');

    const steps = [
        {
            icon: <Upload className="w-8 h-8 text-blue-500 dark:text-blue-400" />,
            title: t('step1Title'),
            desc: t('step1Desc'),
            color: "from-blue-50/50 to-blue-100/50 dark:from-blue-500/20 dark:to-blue-600/5"
        },
        {
            icon: <Users className="w-8 h-8 text-purple-500 dark:text-purple-400" />,
            title: t('step2Title'),
            desc: t('step2Desc'),
            color: "from-purple-50/50 to-purple-100/50 dark:from-purple-500/20 dark:to-purple-600/5"
        },
        {
            icon: <Globe className="w-8 h-8 text-pink-500 dark:text-pink-400" />,
            title: t('step3Title'),
            desc: t('step3Desc'),
            color: "from-pink-50/50 to-pink-100/50 dark:from-pink-500/20 dark:to-pink-600/5"
        }
    ];

    return (
        <section className="py-24 px-4 max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-500">
                    {t('title')}
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {steps.map((step, index) => (
                    <div key={index} className={`relative p-8 rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-transparent bg-gradient-to-br ${step.color} backdrop-blur-sm hover:-translate-y-2 transition-transform duration-300 shadow-sm dark:shadow-none`}>
                        <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-6 border border-gray-200 dark:border-white/10">
                            {step.icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
