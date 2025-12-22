"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { useRouter } from "@/i18n/routing";
import { UploadCloud, X, Link as LinkIcon } from "lucide-react";
import Image from "next/image";
import { SocialIcon } from '@/lib/utils/social';

interface Collaborator {
    full_name: string;
    student_number: string;
    department: string;
    social_links: string[];
}

const POPULAR_TECHNOLOGIES = [
    'React', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'Node.js', 'Python', 'Django', 'Flask',
    'FastAPI', 'Java', 'Spring Boot', 'C#', '.NET', 'Go', 'Rust', 'PHP', 'Laravel', 'TypeScript',
    'JavaScript', 'Tailwind CSS', 'Bootstrap', 'Material UI', 'Shadcn UI', 'Supabase', 'Firebase',
    'AWS', 'Google Cloud', 'Azure', 'Vercel', 'Netlify', 'Docker', 'Kubernetes', 'Git', 'GitHub',
    'GitLab', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL', 'Rest API', 'Gemini API',
    'OpenAI API', 'Stripe', 'Prisma', 'Drizzle ORM', 'Zod', 'Redux', 'Zustand', 'Recoil',
    'Framer Motion', 'Three.js', 'Antigravity'
];

export default function UploadPage() {
    const t = useTranslations('Upload');
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        repoLink: '',
        demoLink: '',
        tags: '',
        collaborators: [] as Collaborator[]
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Autocomplete state
    const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
    const [showTagSuggestions, setShowTagSuggestions] = useState(false);

    const supabase = createClient();

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Simple validation: check if image and size < 5MB
            if (!file.type.startsWith('image/')) {
                setError('Please upload an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size must be less than 5MB');
                return;
            }

            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setError(null);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Helper functions for collaborators
    const updateCollaborator = (index: number, field: keyof Collaborator, value: any) => {
        const newCollabs = [...formData.collaborators];
        newCollabs[index] = { ...newCollabs[index], [field]: value };
        setFormData({ ...formData, collaborators: newCollabs });
    };

    const addCollaboratorLink = (collabIndex: number) => {
        const newCollabs = [...formData.collaborators];
        newCollabs[collabIndex].social_links.push('');
        setFormData({ ...formData, collaborators: newCollabs });
    };

    const updateCollaboratorLink = (collabIndex: number, linkIndex: number, value: string) => {
        const newCollabs = [...formData.collaborators];
        newCollabs[collabIndex].social_links[linkIndex] = value;
        setFormData({ ...formData, collaborators: newCollabs });
    };

    const removeCollaboratorLink = (collabIndex: number, linkIndex: number) => {
        const newCollabs = [...formData.collaborators];
        newCollabs[collabIndex].social_links.splice(linkIndex, 1);
        setFormData({ ...formData, collaborators: newCollabs });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error("User not authenticated");

            let imageUrl = null;

            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('project-images')
                    .upload(fileName, imageFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('project-images')
                    .getPublicUrl(fileName);

                imageUrl = publicUrl;
            }

            // Clean up collaborators data before insert
            const cleanedCollaborators = formData.collaborators
                .filter(c => c.full_name.trim() !== '')
                .map(c => ({
                    ...c,
                    social_links: c.social_links.filter(l => l.trim() !== '')
                }));

            // Insert project data
            const { error: insertError } = await supabase.from('projects').insert({
                title: formData.title,
                description: formData.description,
                repo_url: formData.repoLink,
                demo_url: formData.demoLink,
                thumbnail_url: imageUrl,
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                collaborators: cleanedCollaborators,
                user_id: user.id
            });

            if (insertError) throw insertError;

            alert(t('success'));
            router.push('/dashboard');
            router.refresh();
        } catch (err: any) {
            console.error('Upload Error:', err);
            if (err instanceof Error) {
                setError(err.message);
            } else if (typeof err === 'object' && err !== null && 'message' in err) {
                setError((err as any).message);
            } else {
                setError('An unknown error occurred: ' + JSON.stringify(err));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[90vh] w-full p-4 pt-20">
            <div className="relative w-full max-w-2xl p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

                <div className="relative z-10 flex flex-col items-center gap-6">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                        {t('title')}
                    </h1>

                    {error && (
                        <div className="w-full p-3 text-sm text-red-200 bg-red-500/10 border border-red-500/20 rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label={t('projectTitle')}
                                placeholder={t('placeholderTitle')}
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />

                            <div className="relative">
                                <Input
                                    label={t('tags')}
                                    placeholder={t('placeholderTags')}
                                    value={formData.tags}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFormData({ ...formData, tags: value });

                                        const parts = value.split(',');
                                        const lastPart = parts[parts.length - 1].trim().toLowerCase();

                                        if (lastPart.length > 0) {
                                            const filteredInfo = POPULAR_TECHNOLOGIES.filter(tech =>
                                                tech.toLowerCase().includes(lastPart) &&
                                                !parts.slice(0, -1).some(p => p.trim().toLowerCase() === tech.toLowerCase())
                                            );
                                            setTagSuggestions(filteredInfo);
                                            setShowTagSuggestions(true);
                                        } else {
                                            setShowTagSuggestions(false);
                                        }
                                    }}
                                    onBlur={() => {
                                        // Delay hiding to allow click event on suggestion to register
                                        setTimeout(() => setShowTagSuggestions(false), 200);
                                    }}
                                />
                                {showTagSuggestions && tagSuggestions.length > 0 && (
                                    <div className="absolute z-50 w-full mt-1 bg-[#1a1b26] border border-white/10 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                        {tagSuggestions.map((tech, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => {
                                                    const parts = formData.tags.split(',');
                                                    parts.pop(); // Remove partial input
                                                    parts.push(tech); // Add selected tag

                                                    const newValue = parts.join(', ') + ', ';
                                                    setFormData({ ...formData, tags: newValue });
                                                    setShowTagSuggestions(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
                                            >
                                                {tech}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-medium text-gray-400">{t('collaborators')}</label>
                            {formData.collaborators.map((collab, index) => (
                                <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10 flex flex-col gap-3">
                                    <div className="flex flex-col md:flex-row gap-2 items-start">
                                        <Input
                                            placeholder={t('placeholderName')}
                                            value={collab.full_name}
                                            onChange={(e) => updateCollaborator(index, 'full_name', e.target.value)}
                                            containerClassName="flex-1 w-full"
                                        />
                                        <Input
                                            placeholder={t('placeholderStudentId')}
                                            value={collab.student_number}
                                            onChange={(e) => updateCollaborator(index, 'student_number', e.target.value)}
                                            containerClassName="w-full md:w-32"
                                        />
                                        <Input
                                            placeholder={t('placeholderDept')}
                                            value={collab.department}
                                            onChange={(e) => updateCollaborator(index, 'department', e.target.value)}
                                            containerClassName="w-full md:w-40"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newCollabs = formData.collaborators.filter((_, i) => i !== index);
                                                setFormData({ ...formData, collaborators: newCollabs });
                                            }}
                                            className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors mt-0.5"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    {/* Social Links for Collaborator */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs text-gray-500">Sosyal Medya Linkleri</label>
                                        <div className="space-y-2">
                                            {collab.social_links.map((link, linkIdx) => (
                                                <div key={linkIdx} className="flex items-center gap-2">
                                                    <div className="relative flex-1">
                                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                                            {link ? <SocialIcon url={link} size={14} /> : <LinkIcon size={14} />}
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={link}
                                                            onChange={(e) => updateCollaboratorLink(index, linkIdx, e.target.value)}
                                                            placeholder="https://..."
                                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-9 pr-2 text-xs text-white focus:ring-1 focus:ring-purple-500 outline-none placeholder-gray-600"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCollaboratorLink(index, linkIdx)}
                                                        className="text-gray-400 hover:text-red-400 p-1"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => addCollaboratorLink(index)}
                                                className="text-xs text-purple-400 hover:text-purple-300 font-medium self-start flex items-center gap-1"
                                            >
                                                <LinkIcon size={12} />
                                                {t('addLink')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => setFormData({
                                    ...formData,
                                    collaborators: [...formData.collaborators, {
                                        full_name: '',
                                        student_number: '',
                                        department: '',
                                        social_links: ['']
                                    }]
                                })}
                                className="self-start text-sm text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
                            >
                                {t('addCollaborator')}
                            </button>
                        </div>


                        <Textarea
                            label={t('description')}
                            placeholder={t('placeholderDesc')}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label={t('repoLink')}
                                placeholder={t('placeholderRepo')}
                                value={formData.repoLink}
                                onChange={(e) => setFormData({ ...formData, repoLink: e.target.value })}
                            />
                            <Input
                                label={t('demoLink')}
                                placeholder={t('placeholderDemo')}
                                value={formData.demoLink}
                                onChange={(e) => setFormData({ ...formData, demoLink: e.target.value })}
                            />
                        </div>

                        {/* Image Upload Area */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">{t('image')}</label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageSelect}
                                accept="image/*"
                                className="hidden"
                            />

                            {!imagePreview ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-32 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-white/40 hover:bg-white/5 transition-all cursor-pointer gap-2"
                                >
                                    <UploadCloud size={32} />
                                    <span>{t('dropImage')}</span>
                                </div>
                            ) : (
                                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-white/20 group">
                                    <Image
                                        src={imagePreview}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-red-500 rounded-full text-white transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <Button type="submit" isLoading={loading} className="mt-4">
                            {t('submit')}
                        </Button>
                    </form>
                </div>
            </div >
        </div >
    );
}
