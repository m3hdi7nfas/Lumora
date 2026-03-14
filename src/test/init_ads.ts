import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function initAdSettings() {
  console.log('Initializing ad settings...');
  const { data, error } = await supabase
    .from('system_settings')
    .upsert({ 
      key: 'show_ads', 
      value: true,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error initializing show_ads:', error);
  } else {
    console.log('Successfully initialized show_ads to true');
  }
}

initAdSettings();
