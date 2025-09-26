# WaterWatch Guardian Setup Guide

## Database Setup

1. **Run the SQL script in Supabase:**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `supabase.sql` from the root directory
   - Execute the script to create the necessary tables and policies

## Environment Configuration

1. **Create a `.env` file in the `waterwatch-guardian-main` directory:**
   ```env
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

2. **Get your Supabase credentials:**
   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy the Project URL and anon/public key

## Running the Application

1. **Install dependencies:**
   ```bash
   cd waterwatch-guardian-main
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   - Navigate to `http://localhost:5173`

## Features

- ✅ Direct Supabase integration (no backend server required)
- ✅ Photo upload to Supabase Storage
- ✅ Report submission with GPS coordinates
- ✅ Pollution type classification
- ✅ Report status tracking
- ✅ Real-time report viewing

## Troubleshooting

If you encounter "Failed to fetch" errors:
1. Ensure your Supabase credentials are correct
2. Check that the database schema has been created
3. Verify that the storage bucket "reports" exists
4. Check browser console for detailed error messages
