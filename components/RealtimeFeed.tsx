"use client";

import { useEffect, useState } from "react";
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

    useEffect(() => {
        // 1. Fetch initial projects
        const fetchProjects = async () => {
            let query = supabase
                .from('projects')
                .select(`
                *,
                user:profiles(full_name)
            `)
                .order('created_at', { ascending: false });

            if (userId) {
                query = query.eq('user_id', userId);
            }

            const { data } = await query;

            if (data) {
                // Supabase returns tags as array if defined in schema, but type assertion helps safety
                const mappedData = data.map((p: any) => ({
                    ...p,
                    tags: p.tags || [], // Ensure tags is always array
                    user: p.user || { full_name: 'Unknown' }
                }));
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

                // Fetch the full project data including user profile for the new item
                const { data } = await supabase
                    .from('projects')
                    .select('*, user:profiles(full_name)')
                    .eq('id', payload.new.id)
                    .single();

                if (data) {
                    const newProject: Project = {
                        ...data,
                        tags: data.tags || [],
                        collaborators: data.collaborators || [], // Handle collaborators
                        user: data.user || { full_name: 'Unknown' }
                    } as Project;

                    if (payload.eventType === 'INSERT') {
                        // Only add if it matches filter (client side check simple)
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

    if (projects.length === 0) {
        return <div className="text-gray-400 text-center w-full col-span-3 py-10">No projects shared yet. Be the first!</div>;
    }

    return (
        <div className={`w-full ${viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr'
            : 'flex flex-col gap-4'
            }`}>
            {projects.map((project) => (
                <ProjectCard
                    key={project.id}
                    project={project}
                    layout={viewMode}
                    isOwner={currentUserId === project.user_id}
                />
            ))}
        </div>
    );
}
