import { Link, useRouter } from "@/i18n/routing";
import Image from "next/image";
import { Project } from '@/types/project';
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ProjectCardProps {
    project: Project;
    layout?: 'grid' | 'list';
    isOwner?: boolean;
}

export default function ProjectCard({ project, layout = 'grid', isOwner = false }: ProjectCardProps) {
    const router = useRouter();
    const supabase = createClient();

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation
        if (!confirm('Are you sure you want to delete this project?')) return;

        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', project.id);

        if (error) {
            alert('Error deleting project');
            console.error(error);
        } else {
            router.refresh();
        }
    };

    if (layout === 'list') {
        return (
            <Link href={`/project/${project.id}`} className="group relative block w-full">
                <div className="relative w-full bg-white/5 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 transition-all duration-300 group-hover:bg-white/10 flex items-center p-4 gap-6">
                    {/* Thumbnail - Smaller */}
                    <div className="relative h-24 w-40 flex-shrink-0 overflow-hidden rounded-lg">
                        {project.thumbnail_url ? (
                            <Image
                                src={project.thumbnail_url}
                                alt={project.title}
                                fill
                                className="object-cover"
                            />
                        ) : (project.demo_url || project.repo_url) ? (
                            <Image
                                src={`https://api.microlink.io/?url=${encodeURIComponent(project.demo_url || project.repo_url || '')}&screenshot=true&meta=false&embed=screenshot.url`}
                                alt={project.title}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                <span className="text-2xl">🚀</span>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                                    {project.title}
                                </h3>
                                <p className="text-sm text-gray-400 line-clamp-1 mt-1">
                                    {project.description}
                                </p>
                            </div>
                            {isOwner && (
                                <button
                                    onClick={handleDelete}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors z-20"
                                    title="Delete Project"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <div className="flex gap-2">
                                {project.tags.slice(0, 3).map((tag, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/5">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <span className="ml-auto">{new Date(project.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link href={`/project/${project.id}`} className="group relative block h-full">
            <div className="relative h-full bg-white/5 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-purple-500/20 flex flex-col">

                {/* Thumbnail */}
                <div className="relative h-48 w-full overflow-hidden">
                    {project.thumbnail_url ? (
                        <Image
                            src={project.thumbnail_url}
                            alt={project.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (project.demo_url || project.repo_url) ? (
                        <Image
                            src={`https://api.microlink.io/?url=${encodeURIComponent(project.demo_url || project.repo_url || '')}&screenshot=true&meta=false&embed=screenshot.url`}
                            alt={project.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            unoptimized
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                            <span className="text-4xl">🚀</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />

                    {isOwner && (
                        <button
                            onClick={handleDelete}
                            className="absolute top-2 right-2 p-2 bg-black/50 text-white hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-all z-20"
                            title="Delete Project"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col gap-3 flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                            {project.title}
                        </h3>
                    </div>

                    <p className="text-sm text-gray-400 line-clamp-2 flex-1">
                        {project.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-2">
                        {project.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-300 border border-white/5">
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-xs text-gray-500">
                        <span>By {project.user.full_name}</span>
                        <span>{new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
