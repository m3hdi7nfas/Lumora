import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function listSettings() {
  const { data, error } = await supabase
    .from('system_settings')
    .select('*');

  if (error) {
    console.error('Error fetching system_settings:', error);
    return;
  }

  console.log('All system settings:', data);
}

listSettings();
