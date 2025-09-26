// Test script to verify the AI verification system
const axios = require('axios');

const API_BASE_URL = 'http://localhost:4000';

async function testVerification() {
  try {
    console.log('Testing AI verification system...');
    
    // First, get all reports
    console.log('\n1. Fetching all reports...');
    const reportsResponse = await axios.get(`${API_BASE_URL}/api/reports`);
    const reports = reportsResponse.data;
    
    console.log(`Found ${reports.length} reports`);
    
    if (reports.length === 0) {
      console.log('No reports found. Please submit a report first.');
      return;
    }
    
    // Find a pending report
    const pendingReport = reports.find(r => r.status === 'Pending');
    
    if (!pendingReport) {
      console.log('No pending reports found. All reports have been verified.');
      return;
    }
    
    console.log(`\n2. Testing verification for report: ${pendingReport.id}`);
    console.log(`Location: ${pendingReport.lat}, ${pendingReport.lng}`);
    console.log(`Type: ${pendingReport.pollution_type}`);
    
    // Test verification
    console.log('\n3. Running AI verification...');
    const verifyResponse = await axios.post(`${API_BASE_URL}/api/reports/${pendingReport.id}/simulate-verify`);
    const result = verifyResponse.data;
    
    console.log('\n4. Verification Results:');
    console.log(`Status: ${result.status}`);
    console.log(`Verified: ${result.verified}`);
    console.log(`Confidence: ${(result.ai_confidence * 100).toFixed(1)}%`);
    console.log(`Message: ${result.message}`);
    
    // Verify the report was updated in database
    console.log('\n5. Verifying database update...');
    const updatedReportResponse = await axios.get(`${API_BASE_URL}/api/reports`);
    const updatedReports = updatedReportResponse.data;
    const updatedReport = updatedReports.find(r => r.id === pendingReport.id);
    
    console.log(`Updated status: ${updatedReport.status}`);
    console.log(`Updated confidence: ${updatedReport.ai_confidence ? (updatedReport.ai_confidence * 100).toFixed(1) + '%' : 'N/A'}`);
    
    if (updatedReport.status === result.status) {
      console.log('\n✅ SUCCESS: Database was updated correctly!');
    } else {
      console.log('\n❌ ERROR: Database was not updated correctly!');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testVerification();


