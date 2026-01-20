-- This migration creates a trigger to automatically create profiles when new users sign up

-- Create a function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new profile for the new user
  INSERT INTO public.profiles (user_id, email, role, display_name, is_active, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    -- Set role based on metadata, default to 'student'
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'role', ''),
      'student'
    ),
    -- Set display name from metadata or use email prefix
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'display_name', ''),
      SPLIT_PART(NEW.email, '@', 1)
    ),
    TRUE, -- is_active
    NOW(), -- created_at
    NOW()  -- updated_at
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable insert for all users" ON public.profiles
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable select for all users" ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Enable update for authenticated users" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);