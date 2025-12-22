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

    // Fetch My Projects
    const { data: myProjects } = await supabase
        .from('projects')
        .select(`
            *,
            user:profiles(full_name, student_number, department)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Fetch All Projects
    const { data: allProjects } = await supabase
        .from('projects')
        .select(`
            *,
            user:profiles(full_name, student_number, department)
        `)
        .order('created_at', { ascending: false });

    const mapProject = (p: any): Project => ({
        ...p,
        tags: p.tags || [],
        collaborators: p.collaborators || [],
        user: p.user || { full_name: 'Unknown' }
    });

    return (
        <DashboardClient
            user={user}
            myProjects={myProjects?.map(mapProject) || []}
            allProjects={allProjects?.map(mapProject) || []}
        />
    );
}
