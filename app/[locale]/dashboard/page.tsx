import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';
import { type Project } from '@/components/RealtimeFeed'; // Importing type if exported, or defining

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth');
    }

    // Fetch My Projects
    const { data: myProjects } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Fetch All Projects
    const { data: allProjects } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <DashboardClient
            user={user}
            myProjects={myProjects || []}
            allProjects={allProjects || []}
        />
    );
}
