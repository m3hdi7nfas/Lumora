-- Fix profiles policy: users can only view their own profile
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Moderators can view all profiles
CREATE POLICY "Moderators can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'moderator'
  )
);

-- Teachers can view profiles in their school
CREATE POLICY "Teachers can view profiles in their school" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles AS teacher_profile
    WHERE teacher_profile.user_id = auth.uid() 
    AND teacher_profile.role = 'teacher'
    AND EXISTS (
      SELECT 1 FROM public.school_memberships AS teacher_sm
      WHERE teacher_sm.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.school_memberships AS member_sm
        WHERE member_sm.school_id = teacher_sm.school_id
        AND member_sm.user_id = profiles.user_id
      )
    )
  )
);

-- Fix school_memberships policy: remove public read access
DROP POLICY IF EXISTS "School memberships are viewable by school members" ON public.school_memberships;
CREATE POLICY "Users can view own memberships" 
ON public.school_memberships 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Moderators can view all memberships" 
ON public.school_memberships 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'moderator'
  )
);

CREATE POLICY "Teachers can view memberships in their school" 
ON public.school_memberships 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles AS p
    WHERE p.user_id = auth.uid() AND p.role = 'teacher'
    AND EXISTS (
      SELECT 1 FROM public.school_memberships AS teacher_sm
      WHERE teacher_sm.user_id = auth.uid()
      AND teacher_sm.school_id = school_memberships.school_id
    )
  )
);

-- Fix student_answers policy: teachers can only see answers from students in their school
DROP POLICY IF EXISTS "Teachers can view all answers" ON public.student_answers;
CREATE POLICY "Teachers can view answers from their school students" 
ON public.student_answers 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles AS p
    WHERE p.user_id = auth.uid() AND p.role = 'teacher'
    AND EXISTS (
      SELECT 1 FROM public.school_memberships AS teacher_sm
      WHERE teacher_sm.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.school_memberships AS student_sm
        WHERE student_sm.school_id = teacher_sm.school_id
        AND student_sm.user_id = student_answers.user_id
      )
    )
  )
);