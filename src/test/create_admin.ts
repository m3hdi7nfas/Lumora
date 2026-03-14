import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase Environment Variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdmin() {
    const email = 'admin@lumora.com';
    const password = 'Admin123!';

    console.log(`🚀 Attempting to create user: ${email}...`);

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role: 'admin',
                    display_name: 'System Admin'
                }
            }
        });

        if (error) {
            if (error.message.includes('already registered')) {
                console.log('ℹ️ User already exists in Auth. Proceeding to update role...');
            } else {
                throw error;
            }
        } else {
            console.log('✅ User created in Auth system!');
        }

        console.log('🔧 Ensuring Admin role in profiles table...');
        // The trigger should have handled the profile creation, we just need to make sure the role is admin
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('email', email);

        if (profileError) {
            console.warn('⚠️ Could not update profile role via API (likely RLS). You MUST run the SQL update in Supabase Dashboard.');
        } else {
            console.log('✅ Role updated to admin!');
        }

        console.log('\n--- NEXT STEPS ---');
        console.log('1. Go to your email and click the confirmation link (if enabled).');
        console.log('2. Or, go to Supabase Auth -> Users and manually click "Confirm User".');
        console.log('3. Run this SQL in the editor to be safe:');
        console.log(`   UPDATE public.profiles SET role = 'admin' WHERE email = '${email}';`);

    } catch (err: any) {
        console.error('💥 Failed:', err.message);
    }
}

createAdmin();
