-- Lumora RLS Hardening Fixes
-- This script restricts moderators and other non-admin users from direct writes to core tables.
-- Moderators must use the approvals table for any changes to core data.

-- 1. SCHOOLS
DROP POLICY IF EXISTS "Allow all authenticated" ON public.schools;
DROP POLICY IF EXISTS "Allow all to read schools" ON public.schools;
CREATE POLICY "Allow all to read schools" ON public.schools FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS "Allow admins to write schools" ON public.schools;
CREATE POLICY "Allow admins to write schools" ON public.schools FOR ALL TO authenticated 
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- 2. COMPETITIONS
DROP POLICY IF EXISTS "Allow all authenticated" ON public.competitions;
DROP POLICY IF EXISTS "Allow all to read competitions" ON public.competitions;
CREATE POLICY "Allow all to read competitions" ON public.competitions FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS "Allow admins to write competitions" ON public.competitions;
CREATE POLICY "Allow admins to write competitions" ON public.competitions FOR ALL TO authenticated 
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- 3. QUESTION SETS
DROP POLICY IF EXISTS "Allow all authenticated" ON public.question_sets;
DROP POLICY IF EXISTS "Allow all to read question_sets" ON public.question_sets;
CREATE POLICY "Allow all to read question_sets" ON public.question_sets FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS "Allow admins to write question_sets" ON public.question_sets;
CREATE POLICY "Allow admins to write question_sets" ON public.question_sets FOR ALL TO authenticated 
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- 4. QUESTIONS
DROP POLICY IF EXISTS "Allow all authenticated" ON public.questions;
DROP POLICY IF EXISTS "Allow all to read questions" ON public.questions;
CREATE POLICY "Allow all to read questions" ON public.questions FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS "Allow admins to write questions" ON public.questions;
CREATE POLICY "Allow admins to write questions" ON public.questions FOR ALL TO authenticated 
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- 5. PRACTICE SETS
DROP POLICY IF EXISTS "Allow all to read" ON public.practice_sets;
DROP POLICY IF EXISTS "Allow all to read practice_sets" ON public.practice_sets;
CREATE POLICY "Allow all to read practice_sets" ON public.practice_sets FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS "Allow admin to write" ON public.practice_sets;
DROP POLICY IF EXISTS "Allow admins to write practice_sets" ON public.practice_sets;
CREATE POLICY "Allow admins to write practice_sets" ON public.practice_sets FOR ALL TO authenticated 
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- 6. CHALLENGES
DROP POLICY IF EXISTS "Allow all to read" ON public.challenges;
DROP POLICY IF EXISTS "Allow all to read challenges" ON public.challenges;
CREATE POLICY "Allow all to read challenges" ON public.challenges FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS "Allow admin to write" ON public.challenges;
DROP POLICY IF EXISTS "Allow admins to write challenges" ON public.challenges;
CREATE POLICY "Allow admins to write challenges" ON public.challenges FOR ALL TO authenticated 
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- 7. AVATARS
DROP POLICY IF EXISTS "Allow all to read" ON public.avatars;
DROP POLICY IF EXISTS "Allow all to read avatars" ON public.avatars;
CREATE POLICY "Allow all to read avatars" ON public.avatars FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS "Allow admin to write" ON public.avatars;
DROP POLICY IF EXISTS "Allow admins to write avatars" ON public.avatars;
CREATE POLICY "Allow admins to write avatars" ON public.avatars FOR ALL TO authenticated 
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- 8. APPROVALS
-- Ensure the approvals table has all required columns for the hardened workflow
ALTER TABLE public.approvals ADD COLUMN IF NOT EXISTS table_name TEXT;
ALTER TABLE public.approvals ADD COLUMN IF NOT EXISTS record_id UUID;
ALTER TABLE public.approvals ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}';
ALTER TABLE public.approvals ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE public.approvals ADD COLUMN IF NOT EXISTS reviewed_by UUID;
ALTER TABLE public.approvals ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- Ensure moderators can only insert into approvals and read their own.
DROP POLICY IF EXISTS "Admins full access" ON public.approvals;
CREATE POLICY "Admins full access" ON public.approvals FOR ALL TO authenticated 
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
    WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Moderators: insert and read own" ON public.approvals;
DROP POLICY IF EXISTS "Moderators can insert approvals" ON public.approvals;
CREATE POLICY "Moderators can insert approvals" ON public.approvals FOR INSERT TO authenticated 
    WITH CHECK (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'moderator' AND
        requested_by = auth.uid()
    );

DROP POLICY IF EXISTS "Moderators/Teachers can read own approvals" ON public.approvals;
CREATE POLICY "Moderators/Teachers can read own approvals" ON public.approvals FOR SELECT TO authenticated 
    USING (requested_by = auth.uid());

-- 9. STORAGE POLICIES
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow authenticated to upload images" ON storage.objects;
    DROP POLICY IF EXISTS "Allow admins/moderators to upload images" ON storage.objects;
    CREATE POLICY "Allow admins/moderators to upload images" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (
        bucket_id = 'question-images' AND 
        ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'moderator'))
    );

    DROP POLICY IF EXISTS "Allow admins to delete images" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated to delete images" ON storage.objects;
    CREATE POLICY "Allow admins to delete images" ON storage.objects
    FOR DELETE TO authenticated USING (
        bucket_id = 'question-images' AND 
        ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
    );
END $$;

-- 10. AVATAR FOREIGN KEY FIX
-- Drop any old FK if it exists
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_avatar_id_fkey;

-- Create the proper FK to avatars.id (uuid)
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_avatar_id_fkey
    FOREIGN KEY (avatar_id)
    REFERENCES public.avatars(id)
    ON DELETE SET NULL;

-- 11. QUESTION SET DIFFICULTY
ALTER TABLE public.question_sets ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medium';

-- 12. SYSTEM SETTINGS (Global Ad Toggle)
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES public.profiles(id)
);

-- Initialize global ads setting
INSERT INTO public.system_settings (key, value)
VALUES ('show_ads', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- RLS for system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all to read system_settings" ON public.system_settings;
CREATE POLICY "Allow all to read system_settings" ON public.system_settings 
    FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS "Allow admins to write system_settings" ON public.system_settings;
CREATE POLICY "Allow admins to write system_settings" ON public.system_settings 
    FOR ALL TO authenticated 
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
-- 13. PRACTICE SET DIFFICULTY
ALTER TABLE public.practice_sets ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medium';
