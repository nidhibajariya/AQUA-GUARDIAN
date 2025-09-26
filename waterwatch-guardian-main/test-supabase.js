// Simple test script to verify Supabase connection
// Run with: node test-supabase.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ogzorvxyblzrqxrgylgw.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nem9ydnh5Ymx6cnF4cmd5bGd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NzMxNzMsImV4cCI6MjA3MzE0OTE3M30.oDHJuLdg1uIrrRKL3pNA-KH_l5c46kbNvpvE5sYCxno'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('Testing Supabase connection...')
  console.log('URL:', supabaseUrl)
  console.log('Key:', supabaseKey.substring(0, 20) + '...')
  
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('pollution_reports')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Database connection failed:', error.message)
      return false
    }
    
    console.log('✅ Database connection successful')
    
    // Test storage connection
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    
    if (bucketError) {
      console.error('❌ Storage connection failed:', bucketError.message)
      return false
    }
    
    console.log('✅ Storage connection successful')
    console.log('Available buckets:', buckets.map(b => b.name))
    
    return true
  } catch (err) {
    console.error('❌ Connection test failed:', err.message)
    return false
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 All tests passed! Your Supabase setup is working correctly.')
  } else {
    console.log('\n💥 Some tests failed. Please check your Supabase configuration.')
  }
})



