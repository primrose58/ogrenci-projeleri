import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import ProjectCard from "@/components/ProjectCard";
import { SocialIcon } from "@/lib/utils/social";
import { Mail, GraduationCap, Hash, LayoutGrid, Calendar, Edit2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import ProfileEditButton from "@/components/ProfileEditButton";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    const t = await getTranslations('Profile');
    const { id } = await params;

    // Validate UUID format to prevent database errors
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
        return notFound();
    }

    // Initialize data containers
    let profile = null;
    let projects = [];
    let isOwner = false;
    let currentUser = null;

    try {
        // Check current user for ownership
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            currentUser = user;
            if (user.id === id) {
                isOwner = true;
            }
        }

        // 1. Fetch User Profile
        const { data: profileVal, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (!profileError && profileVal) {
            profile = profileVal;
        }
    } catch (e) {
        console.error("Supabase Profile Fetch Error:", e);
    }


    if (!profile) {
        return notFound();
    }

    try {
        // 2. Fetch User's Projects
        const { data: projectsVal, error: projectsError } = await supabase
            .from('projects')
            .select(`
            *,
            user:profiles(full_name, student_number, department)
        `)
            .eq('user_id', id)
            .order('created_at', { ascending: false });

        if (!projectsError && projectsVal) {
            projects = projectsVal;
        }
    } catch (e) {
        console.error("Supabase Projects Fetch Error:", e);
        // We don't fail the page if projects fail to load, just show empty
        projects = [];
    }

    // Ensure social links is an array
    const socialLinks = Array.isArray(profile.social_links) ? profile.social_links : [];

    return (
        <div className="min-h-screen pt-24 pb-12 px-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black transition-colors duration-500">
            <div className="max-w-6xl mx-auto">
                {/* Profile Header */}
                <div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-8 shadow-sm mb-12 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left transition-colors duration-300">

                    {/* Avatar */}
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300 overflow-hidden border-4 border-white dark:border-white/10">
                        {profile.avatar_url ? (
                            <img
                                src={profile.avatar_url}
                                alt={profile.full_name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-4xl font-bold text-white">
                                {profile.full_name?.charAt(0).toUpperCase() || '?'}
                            </span>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                                {profile.full_name}
                            </h1>
                            {isOwner && (
                                <ProfileEditButton user={currentUser} profile={profile} />
                            )}
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-600 dark:text-gray-300 mt-4">
                            {/* Student Number */}
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/5">
                                <Hash size={16} className="text-purple-500" />
                                <span className="text-sm font-medium">
                                    <span className="opacity-70 mr-1">{t('studentNumber')}:</span>
                                    {profile.student_number}
                                </span>
                            </div>

                            {/* Department */}
                            {profile.department && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/5">
                                    <GraduationCap size={16} className="text-blue-500" />
                                    <span className="text-sm font-medium">{profile.department}</span>
                                </div>
                            )}

                            {/* Joined Date (Optional, if we have it easily, otherwise skip or mock) */}
                            {/* <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/5">
                                <Calendar size={16} className="text-green-500" />
                                <span className="text-sm font-medium">Joined 2024</span>
                            </div> */}
                        </div>

                        {/* Social Links */}
                        <div className="flex gap-3 justify-center md:justify-start">
                            {profile.social_links?.map((link: string, i: number) => (
                                <SocialIcon key={i} url={link} size={24} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Projects Grid */}
                <div>
                    <div className="flex items-center gap-3 mb-8">
                        <LayoutGrid className="text-purple-500" size={24} />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {t('projectsTitle')} <span className="text-gray-400 dark:text-gray-600 font-normal">({projects?.length || 0})</span>
                        </h2>
                    </div>

                    {!projects || projects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-300 dark:border-white/10">
                            <div className="text-6xl mb-4">📂</div>
                            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">{t('noProjectsTitle')}</h3>
                            <p className="text-gray-500 dark:text-gray-400">{t('noProjectsDesc')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                // Make sure we pass the correct structure
                                // For this page, user info is redundant on the card itself since we are on their page,
                                // but consistency is fine.
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
