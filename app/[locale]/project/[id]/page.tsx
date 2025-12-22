"use client";

import { Link } from "@/i18n/routing";
import { use, useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import { Github, Linkedin, Globe, Instagram, Users } from 'lucide-react';
import { SocialIcon } from '@/lib/utils/social';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Defensive params unwrapping
    const [resolvedId, setResolvedId] = useState<string | null>(null);
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null); // State to show specialized fetch errors
    const supabase = createClient();
    const t = useTranslations('ProjectDetail');

    // Handle params unwrapping safe for both Next 13/14/15
    useEffect(() => {
        if (params instanceof Promise) {
            params.then(p => setResolvedId(p.id)).catch(e => console.error("Params check failed", e));
        } else {
            // @ts-ignore - Fallback for older Next versions where params is object
            setResolvedId(params.id);
        }
    }, [params]);

    useEffect(() => {
        if (!resolvedId) return;

        const fetchProject = async () => {
            try {
                console.log("Fetching project:", resolvedId);
                const { data, error } = await supabase
                    .from('projects')
                    .select(`
                    *,
                    user:profiles(full_name, student_number, department, social_links)
                `)
                    .eq('id', resolvedId)
                    .single();

                if (error) {
                    console.error("Supabase Error:", error);
                    throw error;
                }

                if (!data) {
                    console.error("No data returned");
                    setLoading(false);
                    return;
                }

                // Nuclear-proof data normalization
                const safeProject = {
                    id: data.id,
                    title: data.title || "Untitled Project",
                    description: data.description || "",
                    thumbnail_url: data.thumbnail_url, // Allow null, handled in UI
                    repo_url: data.repo_url,
                    demo_url: data.demo_url,
                    created_at: data.created_at || new Date().toISOString(),
                    tags: Array.isArray(data.tags) ? data.tags : [],
                    collaborators: Array.isArray(data.collaborators) ? data.collaborators.map((c: any) => ({
                        full_name: c.full_name || "Unknown",
                        student_number: c.student_number || "",
                        department: c.department || "",
                        social_links: Array.isArray(c.social_links) ? c.social_links : []
                    })) : [],
                    user: data.user ? {
                        full_name: data.user.full_name || 'Unknown User',
                        student_number: data.user.student_number || '',
                        department: data.user.department || '',
                        social_links: Array.isArray(data.user.social_links) ? data.user.social_links : []
                    } : {
                        full_name: 'Unknown User',
                        student_number: '',
                        department: '',
                        social_links: []
                    }
                };

                console.log("Safe Project Data:", safeProject);
                setProject(safeProject);
            } catch (err: any) {
                console.error("Fetch Loop Error:", err);
                setFetchError(err.message || "Failed to load project");
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [resolvedId]);

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (e) {
            return "Date unavailable";
        }
    };

    if (loading) return <div className="min-h-screen pt-20 flex items-center justify-center text-white"><span className="animate-pulse">Loading project...</span></div>;

    // Show detailed error if fetch failed
    if (fetchError) return (
        <div className="min-h-screen pt-20 flex flex-col items-center justify-center text-white gap-4">
            <h2 className="text-xl font-bold text-red-500">Error Loading Project</h2>
            <code className="bg-black/50 p-2 rounded text-red-300">{fetchError}</code>
            <Link href="/" className="px-4 py-2 bg-white/10 rounded hover:bg-white/20">Go Back</Link>
        </div>
    );

    if (!project) return <div className="min-h-screen pt-20 flex items-center justify-center text-white">Project not found.</div>;

    return (
        <div className="min-h-screen pt-20 px-4 md:px-20 pb-10 max-w-7xl mx-auto">
            {/* Back Button */}
            <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
                ← {t('backToProjects')}
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left: Image */}
                <div className="relative h-[400px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/40">
                    {project.thumbnail_url ? (
                        <Image
                            src={project.thumbnail_url}
                            alt={project.title}
                            fill
                            className="object-cover"
                            priority
                            onError={(e) => console.log("Image load failed", e)}
                        />
                    ) : (project.demo_url || project.repo_url) ? (
                        <Image
                            src={`https://api.microlink.io/?url=${encodeURIComponent(project.demo_url || project.repo_url || '')}&screenshot=true&meta=false&embed=screenshot.url`}
                            alt={project.title}
                            fill
                            className="object-cover"
                            priority
                            unoptimized
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-2">
                            <span className="text-4xl">🚀</span>
                            <span className="text-sm">No Preview</span>
                        </div>
                    )}
                </div>

                {/* Right: Details */}
                <div className="flex flex-col gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            {project.title}
                        </h1>
                        <div className="flex flex-col gap-1 mt-4">
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <span>{t('by')} <span className="text-white font-medium">{project.user.full_name}</span></span>
                                <span>•</span>
                                <span>{formatDate(project.created_at)}</span>
                            </div>
                            <div className="text-sm text-gray-500">
                                {project.user.student_number}
                                {project.user.department && ` - ${project.user.department}`}
                            </div>

                            {/* User Social Links */}
                            <div className="flex gap-3 mt-2">
                                {(project.user.social_links || []).map((link: string, i: number) => (
                                    link && (
                                        <a key={i} href={link.includes('@') && !link.startsWith('mailto:') ? `mailto:${link}` : link} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                                            <SocialIcon url={link} size={20} />
                                        </a>
                                    )
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag: string) => (
                            <span key={tag} className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
                        {project.description}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        {project.demo_url && (
                            <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                                <Button className="w-full h-12 text-lg">{t('liveDemo')}</Button>
                            </a>
                        )}
                        {project.repo_url && (
                            <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                                <Button variant="secondary" className="w-full h-12 text-lg">{t('viewCode')}</Button>
                            </a>
                        )}
                    </div>

                    {/* Collaborators Section */}
                    {project.collaborators && project.collaborators.length > 0 && (
                        <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-xl border border-white/10 mt-6">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Users size={20} />
                                {t('collaborators', { defaultValue: 'Projeye Katkıda Bulunanlar' })}
                            </h3>
                            <div className="flex flex-col gap-3">
                                {project.collaborators.map((collab: any, index: number) => (
                                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-lg font-bold border border-blue-500/20">
                                            {collab.full_name?.charAt(0) || '?'}
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <span className="text-base font-medium text-gray-200">
                                                {collab.full_name}
                                            </span>
                                            <div className="flex flex-col text-xs text-gray-500">
                                                <span>{collab.student_number}</span>
                                                <span>{collab.department}</span>
                                            </div>

                                            {/* Collaborator Social Links */}
                                            <div className="flex gap-2 mt-1">
                                                {(collab.social_links || []).map((link: string, i: number) => (
                                                    link && (
                                                        <a key={i} href={link.includes('@') && !link.startsWith('mailto:') ? `mailto:${link}` : link} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                                                            <SocialIcon url={link} size={16} />
                                                        </a>
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
