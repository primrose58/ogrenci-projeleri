"use client";

import { Link } from "@/i18n/routing";
import { use, useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchProject = async () => {
            const { data, error } = await supabase
                .from('projects')
                .select(`
                *,
                user:profiles(full_name, student_number, department)
            `)
                .eq('id', id)
                .single();

            if (error || !data) {
                setLoading(false);
                return; // Handle 404 visually or redirect
            }

            setProject({
                ...data,
                tags: data.tags || [],
                user: data.user || { full_name: 'Unknown' }
            });
            setLoading(false);
        };

        fetchProjects();
    }, [id]);

    if (loading) return <div className="min-h-screen text-white flex items-center justify-center">Loading...</div>;
    if (!project) return <div className="min-h-screen text-white flex items-center justify-center">Project not found.</div>;

    const t = useTranslations('ProjectDetail');

    return (
        <div className="min-h-screen pt-20 px-4 md:px-20 pb-10 max-w-7xl mx-auto">
            {/* Back Button */}
            <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
                ← {t('backToProjects')}
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left: Image */}
                <div className="relative h-[400px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    {project.thumbnail_url ? (
                        <Image
                            src={project.thumbnail_url}
                            alt={project.title}
                            fill
                            className="object-cover"
                            priority
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
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center text-4xl">🚀</div>
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
                                <span>{new Date(project.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="text-sm text-gray-500">
                                {project.user.student_number}
                                {project.user.department && ` - ${project.user.department}`}
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

                    <p className="text-gray-300 leading-relaxed text-lg">
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
                </div>
            </div>
        </div>
    );
}
