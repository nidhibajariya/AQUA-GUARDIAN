0# AI Verification Setup Guide

## Overview
This system provides real-time AI verification of pollution reports using satellite imagery analysis. The AI system analyzes satellite data to verify pollution incidents and provides confidence scores.

## Features
- ✅ Real-time satellite imagery analysis
- ✅ AI-powered pollution detection
- ✅ Weather-adjusted confidence scoring
- ✅ Batch verification capabilities
- ✅ Detailed verification statistics
- ✅ Multiple satellite data sources (Sentinel Hub, NASA Landsat)

## API Keys Required

### 1. Sentinel Hub API (Primary)
- **Purpose**: High-resolution satellite imagery
- **Sign up**: https://apps.sentinel-hub.com/
- **Free tier**: 1000 requests/month
- **Environment variable**: `SENTINEL_HUB_API_KEY`

### 2. NASA API (Fallback)
- **Purpose**: Landsat satellite imagery
- **Sign up**: https://api.nasa.gov/
- **Free tier**: 1000 requests/hour
- **Environment variable**: `NASA_API_KEY`

### 3. OpenWeather API (Optional)
- **Purpose**: Weather data for confidence adjustment
- **Sign up**: https://openweathermap.org/api
- **Free tier**: 1000 calls/day
- **Environment variable**: `OPENWEATHER_API_KEY`

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   
   # API Configuration
   VITE_API_URL=http://localhost:4000
   
   # Satellite Imagery APIs
   SENTINEL_HUB_API_KEY=your_sentinel_hub_api_key_here
   NASA_API_KEY=your_nasa_api_key_here
   OPENWEATHER_API_KEY=your_openweather_api_key_here
   ```

3. **Start the backend server:**
   ```bash
   npm start
   ```

4. **Start the frontend:**
   ```bash
   cd waterwatch-guardian-main
   npm run dev
   ```

## How AI Verification Works

### 1. Satellite Image Acquisition
- Fetches recent satellite imagery for the report location
- Uses Sentinel Hub API (primary) or NASA Landsat (fallback)
- Analyzes imagery from the report date or most recent available

### 2. AI Analysis
- Processes satellite imagery using computer vision algorithms
- Detects pollution indicators based on spectral analysis:
  - **Oil spills**: Low NDVI, high NIR reflectance
  - **Plastic pollution**: High reflectance across all bands
  - **Sewage**: Low NDVI, high NDBI
  - **Water turbidity**: High blue/green reflectance

### 3. Confidence Scoring
- Base confidence calculated from pollution type detection
- Adjusted based on weather conditions:
  - Cloudiness affects image quality
  - Visibility impacts detection accuracy
  - Wind speed affects pollution dispersion
  - Humidity affects image clarity

### 4. Verification Decision
- Reports with >60% confidence are verified
- Reports with <60% confidence are rejected
- Results stored in database with detailed analysis

## API Endpoints

### Individual Verification
```
POST /api/reports/:id/verify
```
Verifies a single report using real satellite data.

### Simulation Mode
```
POST /api/reports/:id/simulate-verify
```
Simulates AI verification for testing (no API keys required).

### Batch Verification
```
POST /api/reports/batch-verify
Body: { "reportIds": ["id1", "id2", ...] }
```
Verifies multiple reports at once.

### AI Statistics
```
GET /api/ai/stats
```
Returns verification statistics and performance metrics.

## Usage Examples

### Frontend Integration
```typescript
// Verify a single report
const result = await ApiService.simulateVerification(reportId);

// Batch verify multiple reports
const result = await ApiService.batchVerifyReports(reportIds);

// Get AI statistics
const stats = await ApiService.getAIStats();
```

### Backend Integration
```javascript
// Verify report with satellite data
const verification = await aiVerification.verifyReport(
  reportId, lat, lng, pollutionType, photoUrl
);

// Get verification statistics
const stats = aiVerification.getVerificationStats();
```

## Troubleshooting

### Common Issues

1. **"No satellite imagery available"**
   - Check API keys are correctly set
   - Verify coordinates are valid
   - Try different date ranges

2. **"Verification failed due to technical error"**
   - Check server logs for detailed error messages
   - Verify all dependencies are installed
   - Ensure sufficient disk space for image processing

3. **Low confidence scores**
   - Check weather conditions at report location
   - Verify pollution type matches satellite analysis
   - Consider using simulation mode for testing

### Debug Mode
Enable detailed logging by setting:
```env
NODE_ENV=development
DEBUG=ai-verification:*
```

## Performance Optimization

1. **Caching**: Verification results are cached to avoid re-processing
2. **Batch Processing**: Multiple reports can be verified simultaneously
3. **Fallback Sources**: Automatic fallback between satellite data sources
4. **Async Processing**: Non-blocking verification for better user experience

## Monitoring

The system provides real-time statistics including:
- Total reports processed
- Verification success rate
- Average confidence scores
- Processing time metrics

Access statistics via the frontend dashboard or API endpoint.


