export interface Project {
    id: string;
    title: string;
    description: string;
    thumbnail_url?: string;
    user_id: string;
    created_at: string;
    tags: string[];
    collaborators: {
        full_name: string;
        student_number?: string;
        department?: string;
        linkedin_url?: string;
        github_url?: string;
        instagram_url?: string;
    }[];
    repo_url?: string;
    demo_url?: string;
    user: {
        full_name: string;
        student_number: string;
        department?: string;
        linkedin_url?: string;
        github_url?: string;
        website_url?: string;
        instagram_url?: string;
    };
}
