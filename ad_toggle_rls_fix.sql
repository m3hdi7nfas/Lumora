-- FIX FOR AD TOGGLE RLS
-- This script fixes the permissions for the system_settings table to allow the ad toggle to work correctly.

-- 1. Ensure the table exists (it should, but just in case)
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES public.profiles(id)
);

-- 2. Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- 3. Fix Read Access: Allow BOTH logged-in and guest users to see settings
-- (Guests need this for the Login page ads to disappear when toggled off)
DROP POLICY IF EXISTS "Allow all to read system_settings" ON public.system_settings;
CREATE POLICY "Allow all to read system_settings" ON public.system_settings 
    FOR SELECT USING (TRUE);

-- 4. Fix Write Access: Allow admins to update/upsert settings
-- This version checks the profiles table directly which is more reliable than JWT metadata.
DROP POLICY IF EXISTS "Allow admins to write system_settings" ON public.system_settings;
CREATE POLICY "Allow admins to write system_settings" ON public.system_settings 
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 5. Initialize the setting to 'false' (disabled) if it doesn't exist
INSERT INTO public.system_settings (key, value)
VALUES ('show_ads', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;
