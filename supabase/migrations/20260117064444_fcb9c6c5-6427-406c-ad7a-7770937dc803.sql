-- Fix infinite recursion in profiles RLS policies
-- Drop the problematic policies that reference profiles table within profiles policies

-- Drop the problematic policy on profiles
DROP POLICY IF EXISTS "Moderators can view all profiles" ON public.profiles;

-- Recreate using the security definer function
CREATE POLICY "Moderators can view all profiles" ON public.profiles
FOR SELECT USING (is_user_moderator(auth.uid()));

-- Fix the same issue on school_memberships
DROP POLICY IF EXISTS "Moderators can view all memberships" ON public.school_memberships;

-- Recreate using the security definer function  
CREATE POLICY "Moderators can view all memberships" ON public.school_memberships
FOR SELECT USING (is_user_moderator(auth.uid()));