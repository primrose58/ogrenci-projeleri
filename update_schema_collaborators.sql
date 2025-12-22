-- Add collaborators column to projects table as an array of text
ALTER TABLE public.projects 
ADD COLUMN collaborators text[] DEFAULT '{}';

-- Create an index for faster filtering if needed
CREATE INDEX idx_projects_collaborators ON public.projects USING GIN (collaborators);
