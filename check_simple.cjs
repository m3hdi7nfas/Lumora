const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vqbzgtcbynezeouuosbo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxYnpndGNieW5lemVvdXVvc2JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NjI2OTIsImV4cCI6MjA4ODUzODQ5Mn0.uVLo4j3jQUlD0HGSzqGhKZ2Hcu74_HXLsPc_Cknyv3k';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log('Starting Supabase check...');
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
        console.error('FAILED:', error.message, error.code);
    } else {
        console.log('SUCCESS: Table exists and is reachable.');
    }
}

check();
