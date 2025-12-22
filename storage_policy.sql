-- Create a storage bucket for project images
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true);

-- Policy to allow public access to view images
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'project-images' );

-- Policy to allow authenticated users to upload images
create policy "Authenticated Users can Upload"
  on storage.objects for insert
  with check ( bucket_id = 'project-images' and auth.role() = 'authenticated' );

-- Policy to allow users to update their own images (optional but good practice)
create policy "Users can update own images"
  on storage.objects for update
  using ( bucket_id = 'project-images' and auth.uid() = owner )
  with check ( bucket_id = 'project-images' and auth.uid() = owner );

-- Policy to allow users to delete their own images
create policy "Users can delete own images"
  on storage.objects for delete
  using ( bucket_id = 'project-images' and auth.uid() = owner );
