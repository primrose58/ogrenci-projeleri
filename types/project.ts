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
        social_links?: string[];
    }[];
    repo_url?: string;
    demo_url?: string;
    user: {
        full_name: string;
        student_number: string;
        department?: string;
        social_links?: string[];
    };
}
