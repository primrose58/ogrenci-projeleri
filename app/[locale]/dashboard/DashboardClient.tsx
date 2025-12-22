"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import RealtimeFeed from '@/components/RealtimeFeed';
import { Project } from '@/types/project';
import { User } from '@supabase/supabase-js';

import { LayoutGrid, List } from 'lucide-react';

export default function DashboardClient({
    user,
    myProjects,
    allProjects
}: {
    user: User,
    myProjects: Project[],
    allProjects: Project[]
}) {
    const t = useTranslations('Dashboard');
    const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const userInfo = user.user_metadata || {};

    return (
        <div className="w-full max-w-7xl mx-auto p-4 pt-8">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold text-white">
                            {t('welcome', { name: userInfo.full_name || user.email })}
                        </h1>
                        <div className="flex items-center gap-3 text-gray-400">
                            <span className="bg-white/10 px-2 py-1 rounded text-sm">{userInfo.student_number}</span>
                            {userInfo.department && (
                                <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-sm border border-purple-500/20">
                                    {userInfo.department}
                                </span>
                            )}
                        </div>
                        <p className="text-gray-400 mt-1">
                            {t('subTitle')}
                        </p>
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <List size={20} />
                        </button>
                    </div>
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
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <p className="text-gray-500">{t('noProjects')}</p>
                                    <Link href="/upload" className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium hover:opacity-90 transition-opacity">
                                        {t('uploadFirst')}
                                    </Link>
                                </div>
                            ) : (
                                <RealtimeFeed serverProjects={myProjects} userId={user.id} viewMode={viewMode} currentUserId={user.id} />
                            )}
                        </>
                    ) : (
                        <RealtimeFeed serverProjects={allProjects} viewMode={viewMode} currentUserId={user.id} />
                    )}
                </div>
            </div>
        </div>
    );
}
