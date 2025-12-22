"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { useRouter } from "@/i18n/routing";
import { UploadCloud, X } from "lucide-react";
import Image from "next/image";

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
        collaborators: ''
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

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

                const { error: uploadError, data } = await supabase.storage
                    .from('project-images')
                    .upload(fileName, imageFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('project-images')
                    .getPublicUrl(fileName);

                imageUrl = publicUrl;
            }

            // Insert project data
            const { error: insertError } = await supabase.from('projects').insert({
                title: formData.title,
                description: formData.description,
                repo_url: formData.repoLink,
                demo_url: formData.demoLink,
                thumbnail_url: imageUrl,
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                collaborators: formData.collaborators ? formData.collaborators.split(',').map(c => c.trim()).filter(Boolean) : [],
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
                                placeholder="My Awesome Project"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                            <Input
                                label={t('tags')}
                                placeholder="React, Next.js, AI"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            />
                        </div>

                        <Input
                            label={t('collaborators')}
                            placeholder="Ahmet Yılmaz, Ayşe Demir..."
                            value={formData.collaborators}
                            onChange={(e) => setFormData({ ...formData, collaborators: e.target.value })}
                        />


                        <Textarea
                            label={t('description')}
                            placeholder="Tell us about your project..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label={t('repoLink')}
                                placeholder="https://github.com/..."
                                value={formData.repoLink}
                                onChange={(e) => setFormData({ ...formData, repoLink: e.target.value })}
                            />
                            <Input
                                label={t('demoLink')}
                                placeholder="https://my-app.vercel.app"
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
            </div>
        </div>
    );
}
