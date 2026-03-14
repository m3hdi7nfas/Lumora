-- Lumora Supabase Schema Migration
-- Run this in the Supabase SQL Editor

-- ─── SCHOOLS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    postal_code TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all authenticated" ON public.schools;
DROP POLICY IF EXISTS "Allow all to read schools" ON public.schools;
CREATE POLICY "Allow all to read schools" ON public.schools FOR SELECT TO authenticated USING (TRUE);
DROP POLICY IF EXISTS "Allow admins to write schools" ON public.schools;
CREATE POLICY "Allow admins to write schools" ON public.schools FOR ALL TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ─── COMPETITIONS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.competitions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    difficulty TEXT DEFAULT 'medium',
    access_code TEXT,
    start_date DATE,
    start_time TEXT DEFAULT '09:00',
    end_date DATE,
    end_time TEXT DEFAULT '17:00',
    is_active BOOLEAN DEFAULT TRUE,
    can_leave BOOLEAN DEFAULT TRUE,
    current_participants INT DEFAULT 0,
    participating_schools UUID[] DEFAULT '{}',
    banner_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medium';
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS can_leave BOOLEAN DEFAULT TRUE;
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS participating_schools UUID[] DEFAULT '{}';
ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS banner_url TEXT;

ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all authenticated" ON public.competitions;
DROP POLICY IF EXISTS "Allow all to read competitions" ON public.competitions;
CREATE POLICY "Allow all to read competitions" ON public.competitions FOR SELECT TO authenticated USING (TRUE);
DROP POLICY IF EXISTS "Allow admins to write competitions" ON public.competitions;
CREATE POLICY "Allow admins to write competitions" ON public.competitions FOR ALL TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ─── QUESTION SETS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.question_sets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    competition_ids UUID[] DEFAULT '{}',
    question_ids UUID[] DEFAULT '{}',
    time_limit INT DEFAULT 0,
    allow_retries BOOLEAN DEFAULT FALSE,
    scoring_type TEXT DEFAULT 'highest',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.question_sets ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.question_sets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.question_sets ADD COLUMN IF NOT EXISTS competition_ids UUID[] DEFAULT '{}';
ALTER TABLE public.question_sets ADD COLUMN IF NOT EXISTS question_ids UUID[] DEFAULT '{}';
ALTER TABLE public.question_sets ADD COLUMN IF NOT EXISTS time_limit INT DEFAULT 0;
ALTER TABLE public.question_sets ADD COLUMN IF NOT EXISTS allow_retries BOOLEAN DEFAULT FALSE;
ALTER TABLE public.question_sets ADD COLUMN IF NOT EXISTS scoring_type TEXT DEFAULT 'highest';
ALTER TABLE public.question_sets ADD COLUMN IF NOT EXISTS category TEXT;

ALTER TABLE public.question_sets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all authenticated" ON public.question_sets;
DROP POLICY IF EXISTS "Allow all to read question_sets" ON public.question_sets;
CREATE POLICY "Allow all to read question_sets" ON public.question_sets FOR SELECT TO authenticated USING (TRUE);
DROP POLICY IF EXISTS "Allow admins to write question_sets" ON public.question_sets;
CREATE POLICY "Allow admins to write question_sets" ON public.question_sets FOR ALL TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ─── QUESTIONS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text TEXT NOT NULL,
    type TEXT DEFAULT 'mcq', -- mcq, text, true_false
    options JSONB DEFAULT '[]',
    correct_answer TEXT,
    points INT DEFAULT 10,
    question_set_id UUID REFERENCES public.question_sets(id) ON DELETE SET NULL,
    image_url TEXT,
    is_required BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    difficulty TEXT DEFAULT 'medium',
    explanation TEXT,
    exact_match_required BOOLEAN DEFAULT FALSE,
    category TEXT DEFAULT 'General',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'mcq';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS correct_answer TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS points INT DEFAULT 10;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medium';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS explanation TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS exact_match_required BOOLEAN DEFAULT FALSE;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS timer INT DEFAULT 0;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS slide_url TEXT;

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all authenticated" ON public.questions;
DROP POLICY IF EXISTS "Allow all to read questions" ON public.questions;
CREATE POLICY "Allow all to read questions" ON public.questions FOR SELECT TO authenticated USING (TRUE);
DROP POLICY IF EXISTS "Allow admins to write questions" ON public.questions;
CREATE POLICY "Allow admins to write questions" ON public.questions FOR ALL TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ─── APPROVALS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.approvals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL, -- create, update, delete
    table_name TEXT NOT NULL,
    record_id UUID,
    data JSONB DEFAULT '{}',
    requested_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    summary TEXT,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
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

-- ─── MESSAGES ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject TEXT NOT NULL,
    body TEXT,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    sender_name TEXT,
    sender_role TEXT,
    recipient_role TEXT, -- 'all', 'student', 'teacher', 'moderator'
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated to send" ON public.messages;
CREATE POLICY "Allow authenticated to send" ON public.messages FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = sender_id
);
DROP POLICY IF EXISTS "Allow teachers/admins to read all" ON public.messages;
CREATE POLICY "Allow teachers/admins to read all" ON public.messages FOR SELECT TO authenticated USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'teacher', 'moderator')
    OR
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'teacher', 'moderator'))
);
DROP POLICY IF EXISTS "Allow admin to delete" ON public.messages;
CREATE POLICY "Allow admin to delete" ON public.messages FOR DELETE TO authenticated USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- ─── AVATARS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.avatars (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT DEFAULT 'default',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all to read" ON public.avatars;
CREATE POLICY "Allow all to read" ON public.avatars FOR SELECT TO authenticated USING (TRUE);
DROP POLICY IF EXISTS "Allow admin to write" ON public.avatars;
CREATE POLICY "Allow admin to write" ON public.avatars FOR ALL TO authenticated USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
) WITH CHECK (TRUE);
-- ─── PROFILES ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    role TEXT DEFAULT 'student', -- student, teacher, moderator, admin
    school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    score INT DEFAULT 0,
    progress INT DEFAULT 0,
    avatar_id UUID DEFAULT NULL, -- Placeholder for avatar relation
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if table was created previously without them
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_id UUID DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS progress INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS score INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_text TEXT;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT TO authenticated USING (TRUE);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admins full access" ON public.profiles;
CREATE POLICY "Admins full access" ON public.profiles FOR ALL TO authenticated USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- ─── PRACTICE SETS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.practice_sets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'General',
    questions UUID[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.practice_sets ADD COLUMN IF NOT EXISTS allow_retries BOOLEAN DEFAULT TRUE;
ALTER TABLE public.practice_sets ADD COLUMN IF NOT EXISTS scoring_type TEXT DEFAULT 'highest';
ALTER TABLE public.practice_sets ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medium';

ALTER TABLE public.practice_sets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all to read" ON public.practice_sets;
DROP POLICY IF EXISTS "Allow all to read practice_sets" ON public.practice_sets;
CREATE POLICY "Allow all to read practice_sets" ON public.practice_sets FOR SELECT TO authenticated USING (TRUE);
DROP POLICY IF EXISTS "Allow admin to write" ON public.practice_sets;
DROP POLICY IF EXISTS "Allow admins to write practice_sets" ON public.practice_sets;
CREATE POLICY "Allow admins to write practice_sets" ON public.practice_sets FOR ALL TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ─── RESULTS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_set_id UUID REFERENCES public.question_sets(id) ON DELETE CASCADE,
    practice_set_id UUID REFERENCES public.practice_sets(id) ON DELETE CASCADE,
    competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE,
    score INT DEFAULT 0,
    total_points INT DEFAULT 0,
    correct_count INT DEFAULT 0,
    total_questions INT DEFAULT 0,
    answers JSONB DEFAULT '{}',
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist for those who already ran the migration
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS correct_count INT DEFAULT 0;
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS total_questions INT DEFAULT 0;

ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own results" ON public.results;
CREATE POLICY "Users can read own results" ON public.results FOR SELECT TO authenticated USING (auth.uid() = student_id);
DROP POLICY IF EXISTS "Admins/Teachers can read all" ON public.results;
CREATE POLICY "Admins/Teachers can read all" ON public.results FOR SELECT TO authenticated USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'teacher', 'moderator')
    OR
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'teacher', 'moderator'))
);
DROP POLICY IF EXISTS "Users can insert own results" ON public.results;
CREATE POLICY "Users can insert own results" ON public.results FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);

-- ─── AUTH TRIGGER ─────────────────────────────────────────────────────────
-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, role)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'display_name', COALESCE(new.raw_user_meta_data->>'role', 'student'));
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- ─── JOINED COMPETITIONS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.joined_competitions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, competition_id)
);

ALTER TABLE public.joined_competitions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see own joins" ON public.joined_competitions;
CREATE POLICY "Users can see own joins" ON public.joined_competitions FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can join" ON public.joined_competitions;
CREATE POLICY "Users can join" ON public.joined_competitions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can leave" ON public.joined_competitions;
CREATE POLICY "Users can leave" ON public.joined_competitions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ─── CHALLENGES ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'learning', -- learning, logic, social
    points INT DEFAULT 50,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all to read" ON public.challenges;
DROP POLICY IF EXISTS "Allow all to read challenges" ON public.challenges;
CREATE POLICY "Allow all to read challenges" ON public.challenges FOR SELECT TO authenticated USING (TRUE);
DROP POLICY IF EXISTS "Allow admin to write" ON public.challenges;
DROP POLICY IF EXISTS "Allow admins to write challenges" ON public.challenges;
CREATE POLICY "Allow admins to write challenges" ON public.challenges FOR ALL TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ─── STORAGE BUCKETS ──────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public) 
VALUES ('question-images', 'question-images', true)
ON CONFLICT (id) DO NOTHING;

-- ─── STORAGE POLICIES ─────────────────────────────────────────────────────
-- Allow authenticated users to upload images
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow authenticated to upload images" ON storage.objects;
    CREATE POLICY "Allow authenticated to upload images" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'question-images');

    DROP POLICY IF EXISTS "Allow everyone to view images" ON storage.objects;
    CREATE POLICY "Allow everyone to view images" ON storage.objects
    FOR SELECT TO public USING (bucket_id = 'question-images');

    DROP POLICY IF EXISTS "Allow authenticated to delete images" ON storage.objects;
    CREATE POLICY "Allow authenticated to delete images" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'question-images');

    -- Competition Banners policies
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('competition-banners', 'competition-banners', true)
    ON CONFLICT (id) DO NOTHING;

    DROP POLICY IF EXISTS "Allow authenticated to upload banners" ON storage.objects;
    CREATE POLICY "Allow authenticated to upload banners" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'competition-banners');

    DROP POLICY IF EXISTS "Allow everyone to view banners" ON storage.objects;
    CREATE POLICY "Allow everyone to view banners" ON storage.objects
    FOR SELECT TO public USING (bucket_id = 'competition-banners');

    DROP POLICY IF EXISTS "Allow authenticated to delete banners" ON storage.objects;
    CREATE POLICY "Allow authenticated to delete banners" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'competition-banners');
END $$;

-- ─── DUELS (1v1) ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.duels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    challenger_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    challenged_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- pending, accepted, rejected, in_progress, completed
    question_ids UUID[] DEFAULT '{}',
    challenger_score INT DEFAULT 0,
    challenged_score INT DEFAULT 0,
    challenger_answers JSONB DEFAULT '{}',
    challenged_answers JSONB DEFAULT '{}',
    challenger_done BOOLEAN DEFAULT FALSE,
    challenged_done BOOLEAN DEFAULT FALSE,
    total_points INT DEFAULT 150,
    forfeited_by UUID,
    forfeited_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.duels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own duels" ON public.duels;
CREATE POLICY "Users can read own duels" ON public.duels FOR SELECT TO authenticated USING (
    auth.uid() = challenger_id OR auth.uid() = challenged_id
);
DROP POLICY IF EXISTS "Users can insert duels" ON public.duels;
CREATE POLICY "Users can insert duels" ON public.duels FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = challenger_id
);
DROP POLICY IF EXISTS "Users can update own duels" ON public.duels;
CREATE POLICY "Users can update own duels" ON public.duels FOR UPDATE TO authenticated USING (
    auth.uid() = challenger_id OR auth.uid() = challenged_id
);

-- Note: To enable Realtime for duels, run the following manually in Supabase if not active:
-- ALTER publication supabase_realtime ADD TABLE public.duels;
