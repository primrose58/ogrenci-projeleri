"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import RealtimeFeed from '@/components/RealtimeFeed';
import { Project } from '@/types/project'; // We might need to define this type shared
import { User } from '@supabase/supabase-js';

// Re-defining for now if not shared
type ProjectType = {
    id: string;
    title: string;
    description: string;
    image_url?: string;
    user_id: string;
    created_at: string;
    tags: string[];
    collaborators: string[];
};

export default function DashboardClient({
    user,
    myProjects,
    allProjects
}: {
    user: User,
    myProjects: ProjectType[],
    allProjects: ProjectType[]
}) {
    const t = useTranslations('Dashboard'); // We'll need to add this
    const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');

    return (
        <div className="w-full max-w-7xl mx-auto p-4 pt-8">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-white">
                        {t('welcome', { name: user.user_metadata.full_name || user.email })}
                    </h1>
                    <p className="text-gray-400">
                        {t('subTitle')}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('my')}
                        className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'my' ? 'text-white' : 'text-gray-400 hover:text-white/80'
                            }`}
                    >
                        {t('myProjects')}
                        {activeTab === 'my' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'all' ? 'text-white' : 'text-gray-400 hover:text-white/80'
                            }`}
                    >
                        {t('community')}
                        {activeTab === 'all' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 rounded-t-full" />
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="min-h-[50vh]">
                    {activeTab === 'my' ? (
                        <>
                            {myProjects.length === 0 ? (
                                <div className="text-center py-20 text-gray-500">
                                    {t('noProjects')}
                                </div>
                            ) : (
                                <RealtimeFeed serverProjects={myProjects} userId={user.id} />
                            )}
                        </>
                    ) : (
                        <RealtimeFeed serverProjects={allProjects} />
                    )}
                </div>
            </div>
        </div>
    );
}
