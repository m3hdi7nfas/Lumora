import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔗 URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkConnection() {
    try {
        const { data, error, status } = await supabase
            .from('profiles')
            .select('*')
            .limit(1);

        if (error) {
            console.log('❌ Error Code:', error.code);
            console.log('❌ Error Message:', error.message);
            if (error.code === '42P01') {
                console.log('💡 HINT: The "profiles" table was not found. Please make sure you ran the SQL in Supabase Dashboard.');
            }
        } else {
            console.log('✅ Success! Found the "profiles" table.');
            console.log('📋 Data Sample:', data);
        }
    } catch (err: any) {
        console.log('💥 Critical Error:', err.message);
    }
}

checkConnection();
