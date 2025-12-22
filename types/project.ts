export interface Project {
    id: string;
    title: string;
    description: string;
    image_url?: string;
    user_id: string;
    created_at: string;
    tags: string[];
    collaborators: string[];
    repo_url?: string;
    demo_url?: string;
    user?: {
        full_name: string;
    };
}
