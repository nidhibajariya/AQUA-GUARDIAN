import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ogzorvxyblzrqxrgylgw.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nem9ydnh5Ymx6cnF4cmd5bGd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NzMxNzMsImV4cCI6MjA3MzE0OTE3M30.oDHJuLdg1uIrrRKL3pNA-KH_l5c46kbNvpvE5sYCxno'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log("Supabase URL:", supabaseUrl)
console.log("Supabase Key:", supabaseAnonKey)


export type PollutionReport = {
  id: string
  user_id?: string
  photo_url: string
  lat: number
  lng: number
  manual_location?: string
  pollution_type: 'oil' | 'plastic' | 'sewage' | 'turbidity'
  status: 'Pending' | 'Verified' | 'Rejected'
  ai_confidence?: number
  created_at: string
}
