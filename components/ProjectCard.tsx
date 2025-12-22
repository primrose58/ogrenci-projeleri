import { Link } from "@/i18n/routing";
import Image from "next/image";
import { Project } from '@/types/project';

interface ProjectCardProps {
    project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
    return (
        <Link href={`/project/${project.id}`} className="group relative block h-full">
            <div className="relative h-full bg-white/5 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-purple-500/20">

                {/* Thumbnail */}
                <div className="relative h-48 w-full overflow-hidden">
                    {project.image_url ? (
                        <Image
                            src={project.image_url}
                            alt={project.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                            <span className="text-4xl">🚀</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                            {project.title}
                        </h3>
                    </div>

                    <p className="text-sm text-gray-400 line-clamp-2">
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
