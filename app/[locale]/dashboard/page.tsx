import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';
import { Project } from '@/types/project';

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth');
    }

    // Fetch User Profile Data for Edit Form
    const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Fetch My Projects
    const { data: myProjects } = await supabase
        .from('projects')
        .select(`
            *,
            user:profiles(full_name, student_number, department, linkedin_url, github_url, website_url, instagram_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Fetch All Projects
    const { data: allProjects } = await supabase
        .from('projects')
        .select(`
            *,
            user:profiles(full_name, student_number, department, linkedin_url, github_url, website_url, instagram_url)
        `)
        .order('created_at', { ascending: false });

    const mapProject = (p: any): Project => ({
        ...p,
        tags: p.tags || [],
        collaborators: p.collaborators || [],
        user: p.user || { full_name: 'Unknown', student_number: '' }
    });

    return (
        <DashboardClient
            user={user}
            userProfile={userProfile}
            myProjects={myProjects?.map(mapProject) || []}
            allProjects={allProjects?.map(mapProject) || []}
        />
    );
}
