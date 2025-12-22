"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import ProjectCard from "./ProjectCard";
import { createClient } from "@/lib/supabase/client";
import { Project } from '@/types/project';
import { LayoutGrid, List } from "lucide-react";
import { motion } from "framer-motion";

export default function RealtimeFeed({
    serverProjects,
    userId,
    currentUserId,
    viewMode: initialViewMode = 'grid'
}: {
    serverProjects?: Project[],
    userId?: string,
    currentUserId?: string,
    viewMode?: 'grid' | 'list'
}) {
    // Internal state for view mode
    const [internalViewMode, setInternalViewMode] = useState<'grid' | 'list'>(initialViewMode);
    const [projects, setProjects] = useState<Project[]>(serverProjects || []);
    const supabase = createClient();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // 1. Fetch initial projects
        const fetchProjects = async () => {
            let query = supabase
                .from('projects')
                .select(`
                *,
                user:profiles(full_name, student_number, department)
            `)
                .order('created_at', { ascending: false });

            if (userId) {
                query = query.eq('user_id', userId);
            }

            const { data } = await query;

            if (data) {
                const mappedData = data.map((p: any) => ({
                    ...p,
                    tags: p.tags || [],
                    user: p.user || { full_name: 'Unknown' }
                }));
                // Only set projects if serverside data wasn't provided or we want to refresh
                // For simplicity, we update to ensure client consistency
                setProjects(mappedData);
            }
        };

        fetchProjects();

        // 2. Subscribe to new projects
        const channel = supabase.channel('realtime projects')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, async (payload) => {
                if (payload.eventType === 'DELETE') {
                    setProjects(current => current.filter(p => p.id !== payload.old.id));
                    return;
                }

                const { data } = await supabase
                    .from('projects')
                    .select('*, user:profiles(full_name, student_number, department)')
                    .eq('id', payload.new.id)
                    .single();

                if (data) {
                    const newProject: Project = {
                        ...data,
                        tags: data.tags || [],
                        collaborators: data.collaborators || [],
                        user: data.user || { full_name: 'Unknown' }
                    } as Project;

                    if (payload.eventType === 'INSERT') {
                        if (!userId || newProject.user_id === userId) {
                            setProjects(current => [newProject, ...current]);
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        setProjects(current => current.map(p => p.id === newProject.id ? newProject : p));
                    }
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); }
    }, [userId]);

    const t = useTranslations('Dashboard');

    const filteredProjects = projects.filter(project => {
        const term = searchTerm.toLowerCase();
        return (
            project.title.toLowerCase().includes(term) ||
            project.description.toLowerCase().includes(term) ||
            project.user.full_name.toLowerCase().includes(term) ||
            (project.user.student_number && project.user.student_number.toLowerCase().includes(term)) ||
            (project.user.department && project.user.department.toLowerCase().includes(term)) ||
            (project.collaborators && project.collaborators.some(c =>
                c.full_name.toLowerCase().includes(term) ||
                (c.student_number && c.student_number.toLowerCase().includes(term)) ||
                (c.department && c.department.toLowerCase().includes(term))
            ))
        );
    });

    if (projects.length === 0) {
        return <div className="text-gray-600 dark:text-gray-400 text-center w-full col-span-3 py-10">{t('noProjectsYet')}</div>;
    }

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Search and Toggle Header */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                {/* Search Input */}
                <div className="relative w-full md:max-w-xl">
                    <input
                        type="text"
                        placeholder="Proje adı, öğrenci adı veya numara ile ara..."
                        className="w-full bg-white border border-gray-200 text-gray-900 placeholder-gray-600 rounded-lg px-4 py-3 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* View Toggle with Sliding Animation */}
                <div className="relative flex items-center bg-gray-100 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 p-1">
                    {/* Sliding Background Pill */}
                    <motion.div
                        className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-white/10 rounded-md shadow-sm z-0"
                        animate={{
                            left: internalViewMode === 'grid' ? '4px' : 'calc(50% + 0px)'
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />

                    <button
                        onClick={() => setInternalViewMode('grid')}
                        className={`relative z-10 w-10 p-2 rounded-md flex items-center justify-center transition-colors duration-200 ${internalViewMode === 'grid'
                            ? 'text-purple-600 dark:text-white'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button
                        onClick={() => setInternalViewMode('list')}
                        className={`relative z-10 w-10 p-2 rounded-md flex items-center justify-center transition-colors duration-200 ${internalViewMode === 'list'
                            ? 'text-purple-600 dark:text-white'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        <List size={20} />
                    </button>
                </div>
            </div>

            <div className={`w-full ${internalViewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr'
                : 'flex flex-col gap-4'
                }`}>
                {filteredProjects.map((project) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        layout={internalViewMode}
                        isOwner={currentUserId === project.user_id}
                    />
                ))}
            </div>

            {filteredProjects.length === 0 && searchTerm && (
                <div className="text-center text-gray-600 dark:text-gray-500 py-10">
                    Arama sonucu bulunamadı.
                </div>
            )}
        </div>
    );
}
