import SatelliteService from './satelliteService.js';

class AIVerificationService {
  constructor() {
    this.satelliteService = new SatelliteService();
    this.verificationHistory = new Map(); // Cache for recent verifications
  }

  /**
   * Verify a pollution report using satellite imagery and AI analysis
   */
  async verifyReport(reportId, lat, lng, pollutionType, userPhotoUrl) {
    try {
      console.log(`Starting AI verification for report ${reportId}`);
      
      // Get satellite imagery for the location
      const satelliteData = await this.satelliteService.getSatelliteImage(lat, lng);
      
      if (!satelliteData) {
        return {
          verified: false,
          confidence: 0.1,
          reason: 'No satellite imagery available',
          status: 'Rejected'
        };
      }

      // Analyze the satellite image for pollution
      const analysis = await this.satelliteService.analyzePollution(satelliteData, pollutionType);
      
      // Get weather data to adjust confidence
      const weather = await this.satelliteService.getWeatherData(lat, lng);
      const adjustedConfidence = this.adjustConfidenceForWeather(analysis.confidence, weather);

      // Determine verification status
      const verified = adjustedConfidence > 0.6;
      const status = verified ? 'Verified' : 'Rejected';

      // Store verification result
      const verificationResult = {
        reportId,
        verified,
        confidence: adjustedConfidence,
        status,
        analysis: {
          ...analysis.analysis,
          satelliteSource: satelliteData.source,
          satelliteDate: satelliteData.date,
          weather: weather,
          verificationTime: new Date().toISOString()
        }
      };

      // Cache the result
      this.verificationHistory.set(reportId, verificationResult);

      console.log(`AI verification completed for report ${reportId}: ${status} (${(adjustedConfidence * 100).toFixed(1)}%)`);

      return verificationResult;
    } catch (error) {
      console.error('AI verification error:', error);
      return {
        verified: false,
        confidence: 0.1,
        reason: 'Verification failed due to technical error',
        status: 'Rejected',
        error: error.message
      };
    }
  }

  /**
   * Adjust confidence based on weather conditions
   */
  adjustConfidenceForWeather(baseConfidence, weather) {
    if (!weather) return baseConfidence;

    let adjustment = 0;

    // Cloudiness affects satellite image quality
    if (weather.cloudiness > 80) {
      adjustment -= 0.2; // Heavy clouds reduce confidence
    } else if (weather.cloudiness > 50) {
      adjustment -= 0.1; // Moderate clouds slightly reduce confidence
    }

    // Visibility affects pollution detection
    if (weather.visibility < 1000) {
      adjustment -= 0.15; // Poor visibility reduces confidence
    } else if (weather.visibility > 10000) {
      adjustment += 0.05; // Excellent visibility increases confidence
    }

    // Wind speed affects pollution dispersion
    if (weather.windSpeed > 10) {
      adjustment -= 0.1; // High wind disperses pollution
    }

    // Humidity affects image clarity
    if (weather.humidity > 90) {
      adjustment -= 0.05; // High humidity reduces clarity
    }

    return Math.max(0.1, Math.min(0.95, baseConfidence + adjustment));
  }

  /**
   * Batch verify multiple reports
   */
  async batchVerifyReports(reports) {
    const results = [];
    
    for (const report of reports) {
      try {
        const result = await this.verifyReport(
          report.id,
          report.lat,
          report.lng,
          report.pollution_type,
          report.photo_url
        );
        results.push({ reportId: report.id, ...result });
      } catch (error) {
        console.error(`Batch verification error for report ${report.id}:`, error);
        results.push({
          reportId: report.id,
          verified: false,
          confidence: 0.1,
          status: 'Rejected',
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Get verification history for a report
   */
  getVerificationHistory(reportId) {
    return this.verificationHistory.get(reportId) || null;
  }

  /**
   * Get verification statistics
   */
  getVerificationStats() {
    const history = Array.from(this.verificationHistory.values());
    const total = history.length;
    const verified = history.filter(h => h.verified).length;
    const averageConfidence = history.reduce((sum, h) => sum + h.confidence, 0) / total;

    return {
      totalReports: total,
      verifiedReports: verified,
      rejectedReports: total - verified,
      verificationRate: total > 0 ? (verified / total) * 100 : 0,
      averageConfidence: averageConfidence || 0
    };
  }

  /**
   * Simulate AI verification for demo purposes (when satellite data is unavailable)
   */
  async simulateVerification(reportId, lat, lng, pollutionType) {
    console.log(`Simulating AI verification for report ${reportId}`);
    console.log(`Location: ${lat}, ${lng}, Type: ${pollutionType}`);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    // Generate realistic confidence scores based on pollution type
    const baseConfidence = this.getBaseConfidenceForType(pollutionType);
    const randomFactor = (Math.random() - 0.5) * 0.3; // ±15% variation
    const confidence = Math.max(0.1, Math.min(0.95, baseConfidence + randomFactor));
    
    const verified = confidence > 0.6;
    const status = verified ? 'Verified' : 'Rejected';

    console.log(`Verification result: ${status} (${(confidence * 100).toFixed(1)}% confidence)`);

    const result = {
      reportId,
      verified,
      confidence,
      status,
      analysis: {
        pollutionType,
        score: confidence,
        verificationTime: new Date().toISOString(),
        method: 'simulated',
        satelliteSource: 'simulated',
        weather: {
          temperature: 20 + Math.random() * 15,
          humidity: 60 + Math.random() * 30,
          visibility: 5000 + Math.random() * 5000,
          cloudiness: Math.random() * 100,
          windSpeed: Math.random() * 10
        }
      }
    };

    this.verificationHistory.set(reportId, result);
    return result;
  }

  /**
   * Get base confidence score for different pollution types
   */
  getBaseConfidenceForType(pollutionType) {
    const baseScores = {
      'oil': 0.75,      // Oil spills are usually clearly visible
      'plastic': 0.65,  // Plastic pollution is moderately detectable
      'sewage': 0.70,   // Sewage is usually visible in water
      'turbidity': 0.80 // Water turbidity is easily detectable
    };
    
    return baseScores[pollutionType] || 0.50;
  }
}

export default AIVerificationService;
