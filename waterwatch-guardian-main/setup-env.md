# Environment Setup

## Frontend Environment Variables

Create a `.env` file in the `waterwatch-guardian-main` directory with:

```
VITE_SUPABASE_URL=https://ogzorvxyblzrqxrgylgw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nem9ydnh5Ymx6cnF4cmd5bGd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NzMxNzMsImV4cCI6MjA3MzE0OTE3M30.oDHJuLdg1uIrrRKL3pNA-KH_l5c46kbNvpvE5sYCxno
VITE_API_URL=http://localhost:4000
```

## Backend Environment Variables

The backend `.env` file is already configured with the correct Supabase credentials.

## Running the Application

1. **Backend**: Already running on `http://localhost:4000`
2. **Frontend**: Start with `npm run dev` in the `waterwatch-guardian-main` directory

## Features Implemented

✅ **Database Integration**: Connected to Supabase with pollution_reports table
✅ **Photo Upload**: Users can upload photos with pollution reports
✅ **Real-time Data**: Reports display in real-time from database
✅ **AI Verification**: Placeholder endpoint for CNN model integration
✅ **Marine Impact**: Shows real pollution data and statistics
✅ **Status Tracking**: Reports show Pending/Verified/Rejected status

## Next Steps for CNN Model

The AI verification endpoint is ready at `POST /api/reports/:id/verify`. To integrate your CNN model:

1. Replace the simulated confidence calculation in `src/server.js`
2. Add your CNN model inference code
3. Process the image from `photo_url` field
4. Return actual confidence scores

## Testing

- Submit a report at `/report` page
- View real-time data at `/marine-impact` page
- Check report status via API or database

