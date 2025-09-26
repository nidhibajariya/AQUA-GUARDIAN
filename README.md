## WaterWatch Guardian - Backend (Express + Supabase)

### Setup

1. Copy `.env.example` to `.env` and fill values:

```
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
PORT=4000
```

2. Create Supabase schema and bucket:

Run contents of `supabase.sql` in Supabase SQL Editor.

3. Install and run:

```
npm install
npm run dev
```

Server runs on `http://localhost:4000`.

### Endpoints

- POST `/api/reports` (multipart/form-data)
  - fields: `photo` (file), `lat`, `lng`, `manual_location?`, `pollution_type` (oil|plastic|sewage|turbidity)
  - response: `{ message, reportId }`

- GET `/api/reports/:id/status`
  - response: `{ reportId, status, ai_confidence }`


