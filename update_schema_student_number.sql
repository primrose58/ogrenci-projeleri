-- Add student_number column to profiles
ALTER TABLE public.profiles 
ADD COLUMN student_number text UNIQUE;

-- Create an index for faster lookups (optional but recommended)
CREATE INDEX idx_profiles_student_number ON public.profiles(student_number);

-- Update the handle_new_user function to include student_number
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, student_number)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'student_number'
  );
  RETURN new;
END;
$$;
