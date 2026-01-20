-- Add DELETE policy for profiles so moderators can delete user profiles
CREATE POLICY "Moderators can delete profiles" ON public.profiles
FOR DELETE USING (is_user_moderator(auth.uid()));

-- Add DELETE policy for badges so moderators can delete badges  
DROP POLICY IF EXISTS "Moderators can manage badges" ON public.badges;
CREATE POLICY "Moderators can manage badges" ON public.badges
FOR ALL USING (is_user_moderator(auth.uid()));

-- Add DELETE policy for competitions
DROP POLICY IF EXISTS "Moderators can manage competitions" ON public.competitions;
CREATE POLICY "Moderators can manage competitions" ON public.competitions
FOR ALL USING (is_user_moderator(auth.uid()));

-- Add DELETE policy for questions
DROP POLICY IF EXISTS "Moderators can manage questions" ON public.questions;
CREATE POLICY "Moderators can manage questions" ON public.questions
FOR ALL USING (is_user_moderator(auth.uid()));