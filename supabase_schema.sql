-- Enable Row Level Security
alter default privileges revoke execute on functions from public;

-- Profiles Table (Users)
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  full_name text null,
  avatar_url text null,
  updated_at timestamp with time zone null,
  student_number text null,
  department text null,
  linkedin_url text null,
  social_links jsonb default '[]'::jsonb,
  
  primary key (id)
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Projects Table
create table public.projects (
  id uuid not null default gen_random_uuid(),
  title text not null,
  description text not null,
  thumbnail_url text null,
  repo_url text null,
  demo_url text null,
  tags text[] null,
  collaborators jsonb default '[]'::jsonb,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  primary key (id)
);

alter table public.projects enable row level security;

create policy "Projects are viewable by everyone."
  on projects for select
  using ( true );

create policy "Users can create projects."
  on projects for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own projects."
  on projects for update
  using ( auth.uid() = user_id );

create policy "Users can delete own projects."
  on projects for delete
  using ( auth.uid() = user_id );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, student_number, department)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'student_number',
    new.raw_user_meta_data->>'department'
  );
  return new;
end;
$$;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
