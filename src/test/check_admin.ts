import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

const envConfig = dotenv.config()
if (!envConfig.parsed) {
    console.log('No env file found via dotenv.config()')
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkAdminProfile() {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('email', 'admin@lumora.com')
        .single()

    if (error) {
        console.log('Error:', error.message)
    } else {
        console.log('Found profile:', data)
    }
}

checkAdminProfile()
