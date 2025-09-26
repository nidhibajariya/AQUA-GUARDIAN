import { PollutionReport } from './supabase'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export interface ReportSubmissionData {
  photo: File
  lat: number
  lng: number
  manual_location?: string
  pollution_type: 'oil' | 'plastic' | 'sewage' | 'turbidity'
}

export interface ReportSubmissionResponse {
  message: string
  reportId: string
}

export interface ReportStatusResponse {
  reportId: string
  status: 'Pending' | 'Verified' | 'Rejected'
  ai_confidence?: number
  verified?: boolean
  analysis?: any
}

export interface AIVerificationResponse {
  reportId: string
  status: 'Pending' | 'Verified' | 'Rejected'
  verified: boolean
  ai_confidence: number
  analysis: {
    pollutionType: string
    score: number
    verificationTime: string
    method: string
    satelliteSource: string
    weather?: any
  }
  message: string
}

export interface AIStatsResponse {
  totalReports: number
  verifiedReports: number
  rejectedReports: number
  verificationRate: number
  averageConfidence: number
}

export class ApiService {
  static async submitReport(data: ReportSubmissionData): Promise<ReportSubmissionResponse> {
    const formData = new FormData()
    formData.append('photo', data.photo)
    formData.append('lat', data.lat.toString())
    formData.append('lng', data.lng.toString())
    if (data.manual_location) {
      formData.append('manual_location', data.manual_location)
    }
    formData.append('pollution_type', data.pollution_type)

    const response = await fetch(`${API_BASE_URL}/api/reports`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to submit report')
    }

    return response.json()
  }

  static async getReportStatus(reportId: string): Promise<ReportStatusResponse> {
    const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}/status`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get report status')
    }

    return response.json()
  }

  static async getAllReports(): Promise<PollutionReport[]> {
    const response = await fetch(`${API_BASE_URL}/api/reports`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get reports')
    }

    return response.json()
  }

  static async verifyReport(reportId: string): Promise<AIVerificationResponse> {
    const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}/verify`, {
      method: 'POST',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to verify report')
    }

    return response.json()
  }

  static async simulateVerification(reportId: string): Promise<AIVerificationResponse> {
    const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}/simulate-verify`, {
      method: 'POST',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to simulate verification')
    }

    return response.json()
  }

  static async batchVerifyReports(reportIds: string[]): Promise<{ message: string; results: AIVerificationResponse[] }> {
    const response = await fetch(`${API_BASE_URL}/api/reports/batch-verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reportIds }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to batch verify reports')
    }

    return response.json()
  }

  static async getAIStats(): Promise<AIStatsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/ai/stats`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get AI statistics')
    }

    return response.json()
  }

  // CNN model removed: uploadSatelliteImage and cnnVerifyReport deprecated
}
