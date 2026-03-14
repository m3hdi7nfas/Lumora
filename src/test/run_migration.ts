import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
    console.log('Running Supabase migration...')

    const sql = fs.readFileSync(path.join(__dirname, '..', '..', 'supabase_migration.sql'), 'utf-8')

    // Split by -- comments and execute each statement
    const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

    let success = 0
    let skipped = 0

    for (const stmt of statements) {
        try {
            const { error } = await supabase.rpc('exec_sql', { sql: stmt + ';' })
            if (error) {
                console.warn('⚠️  Statement skipped (may already exist):', error.message.slice(0, 80))
                skipped++
            } else {
                success++
            }
        } catch (e: any) {
            console.warn('⚠️  Exception:', e.message?.slice(0, 80))
            skipped++
        }
    }

    console.log(`\n✅ Migration done: ${success} statements applied, ${skipped} skipped/already existed`)
}

runMigration()
