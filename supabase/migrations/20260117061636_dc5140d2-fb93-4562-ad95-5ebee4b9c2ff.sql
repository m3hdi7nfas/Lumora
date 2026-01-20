-- Allow users to always see their own profile (this is critical for login flow)
-- First, drop and recreate to ensure proper access

-- Create a simpler, guaranteed policy for own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Also ensure insert/update policies work for the trigger
DROP POLICY IF EXISTS "Profiles can be created by trigger" ON public.profiles;
CREATE POLICY "System can create profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);