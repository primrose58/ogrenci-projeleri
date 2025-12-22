"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { useRouter } from "@/i18n/routing";

export default function UploadPage() {
    const t = useTranslations('Upload');
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        repoLink: '',
        demoLink: '',
        tags: ''
    });

    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error("User not authenticated");

            // Insert project data
            const { error } = await supabase.from('projects').insert({
                title: formData.title,
                description: formData.description,
                repo_url: formData.repoLink,
                demo_url: formData.demoLink,
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
                user_id: user.id
            });

            if (error) throw error;

            alert(t('success'));
            router.push('/');
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
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

                        {/* Image Upload Stub */}
                        <div className="w-full h-32 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center text-gray-400 hover:border-white/40 transition-colors cursor-pointer bg-white/5">
                            {t('dropImage')}
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
