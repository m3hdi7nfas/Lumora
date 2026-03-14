import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdSettings() {
  const { data, error } = await supabase
    .from('system_settings')
    .select('*')
    .eq('key', 'show_ads');

  if (error) {
    console.error('Error fetching system_settings:', error);
    return;
  }

  console.log('Ad settings in Supabase:', data);
}

checkAdSettings();
