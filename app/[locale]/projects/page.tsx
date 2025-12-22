import { createClient } from '@/lib/supabase/server';
import RealtimeFeed from "@/components/RealtimeFeed";
import { getTranslations } from 'next-intl/server';

export default async function ProjectsPage() {
    const supabase = await createClient();
    const t = await getTranslations('ProjectsPage');

    // Fetch all projects initially
    const { data: projects } = await supabase
        .from('projects')
        .select(`
      *,
      user:profiles(full_name, avatar_url, student_number)
    `)
        .order('created_at', { ascending: false });

    return (
        <div className="min-h-screen p-6 md:p-12 lg:p-20 max-w-[1600px] mx-auto w-full pt-28">
            <div className="flex flex-col gap-4 mb-12">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 pb-2">
                    {t('title')}
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl">
                    {t('subTitle')}
                </p>
            </div>

            <RealtimeFeed serverProjects={projects || []} />
        </div>
    );
}
