"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import ProjectCard from "./ProjectCard";
import { createClient } from "@/lib/supabase/client";
import { Project } from '@/types/project';

export default function RealtimeFeed({
    serverProjects,
    userId,
    viewMode = 'grid',
    currentUserId
}: {
    serverProjects?: Project[],
    userId?: string,
    viewMode?: 'grid' | 'list',
    currentUserId?: string
}) {
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
        return <div className="text-gray-400 text-center w-full col-span-3 py-10">{t('noProjectsYet')}</div>;
    }

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Search Input */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Proje adı, öğrenci adı veya numara ile ara..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className={`w-full ${viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr'
                : 'flex flex-col gap-4'
                }`}>
                {filteredProjects.map((project) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        layout={viewMode}
                        isOwner={currentUserId === project.user_id}
                    />
                ))}
            </div>

            {filteredProjects.length === 0 && searchTerm && (
                <div className="text-center text-gray-500 py-10">
                    Arama sonucu bulunamadı.
                </div>
            )}
        </div>
    );
}
