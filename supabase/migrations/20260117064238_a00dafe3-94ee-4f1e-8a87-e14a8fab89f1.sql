-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Teachers can view profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "Teachers can view memberships in their school" ON public.school_memberships;
DROP POLICY IF EXISTS "Teachers can view answers from their school students" ON public.student_answers;

-- Create security definer function to check if user is moderator
CREATE OR REPLACE FUNCTION public.is_user_moderator(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = check_user_id AND role = 'moderator'
  )
$$;

-- Create security definer function to check if user is teacher
CREATE OR REPLACE FUNCTION public.is_user_teacher(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = check_user_id AND role = 'teacher'
  )
$$;

-- Create security definer function to get user's schools
CREATE OR REPLACE FUNCTION public.get_user_school_ids(check_user_id uuid)
RETURNS uuid[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ARRAY_AGG(school_id) FROM public.school_memberships
  WHERE user_id = check_user_id
$$;

-- Recreate profiles policies without recursion
CREATE POLICY "Teachers can view profiles in their school" 
ON public.profiles 
FOR SELECT 
USING (
  public.is_user_teacher(auth.uid()) 
  AND user_id = ANY(
    SELECT sm.user_id FROM public.school_memberships sm
    WHERE sm.school_id = ANY(public.get_user_school_ids(auth.uid()))
  )
);

-- Recreate school_memberships policies without recursion
CREATE POLICY "Teachers can view memberships in their school" 
ON public.school_memberships 
FOR SELECT 
USING (
  public.is_user_teacher(auth.uid())
  AND school_id = ANY(public.get_user_school_ids(auth.uid()))
);

-- Recreate student_answers policies without recursion
CREATE POLICY "Teachers can view answers from their school students" 
ON public.student_answers 
FOR SELECT 
USING (
  public.is_user_teacher(auth.uid())
  AND user_id = ANY(
    SELECT sm.user_id FROM public.school_memberships sm
    WHERE sm.school_id = ANY(public.get_user_school_ids(auth.uid()))
  )
);