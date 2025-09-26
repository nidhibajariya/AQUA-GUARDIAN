import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, Upload, Send, AlertTriangle, CheckCircle, Eye, Filter, X, Brain, Zap, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ApiService, ReportSubmissionData, AIVerificationResponse, AIStatsResponse } from '@/lib/api';
import { PollutionReport, supabase } from '@/lib/supabase';

// Remove the old interface as we're using the one from supabase.ts

const Report = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState('All');
  const [reports, setReports] = useState<PollutionReport[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const [aiStats, setAiStats] = useState<AIStatsResponse | null>(null);
  const [verificationResults, setVerificationResults] = useState<Map<string, AIVerificationResponse>>(new Map());
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  // CNN model removed: satellite image upload no longer used
  
  const [formData, setFormData] = useState({
    location: '',
    type: '' as 'oil' | 'plastic' | 'sewage' | 'turbidity' | '',
    lat: '',
    lng: '',
  });

  // Load reports from Supabase
  useEffect(() => {
    loadReports();
    loadAIStats();
  }, []);

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('pollution_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading reports:', error);
        toast({
          title: "Error",
          description: "Failed to load reports",
          variant: "destructive",
        });
        return;
      }

      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const loadAIStats = async () => {
    try {
      const stats = await ApiService.getAIStats();
      setAiStats(stats);
    } catch (error) {
      console.error('Error loading AI stats:', error);
    }
  };

  const verifyReport = async (reportId: string) => {
    setIsVerifying(reportId);
    try {
      // Use the backend API for verification
      const result = await ApiService.simulateVerification(reportId);
      setVerificationResults(prev => new Map(prev.set(reportId, result)));
      
      toast({
        title: "AI Verification Complete",
        description: `Report ${result.verified ? 'verified' : 'rejected'} with ${(result.ai_confidence * 100).toFixed(1)}% confidence`,
        variant: result.verified ? "default" : "destructive",
      });
      
      // Reload reports to get updated status
      await loadReports();
      await loadAIStats();
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Failed to verify report",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(null);
    }
  };

  const batchVerifyAll = async () => {
    const pendingReports = reports.filter(r => r.status === 'Pending');
    if (pendingReports.length === 0) {
      toast({
        title: "No Pending Reports",
        description: "All reports have already been verified",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying('batch');
    try {
      const reportIds = pendingReports.map(r => r.id);
      const result = await ApiService.batchVerifyReports(reportIds);
      
      toast({
        title: "Batch Verification Complete",
        description: `Verified ${result.results.length} reports`,
      });
      
      // Reload reports to get updated status
      await loadReports();
      await loadAIStats();
    } catch (error) {
      console.error('Batch verification error:', error);
      toast({
        title: "Batch Verification Failed",
        description: error instanceof Error ? error.message : "Failed to verify reports",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(null);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation. Please enter coordinates manually.",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);
    
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        setFormData(prev => ({
          ...prev,
          lat: latitude.toString(),
          lng: longitude.toString(),
        }));

        // Try to get a readable location name using reverse geocoding
        getLocationName(latitude, longitude);

        toast({
          title: "Location Detected",
          description: `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        });

        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = "Failed to get your location. Please enter coordinates manually.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions and try again.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable. Please enter coordinates manually.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
        }

        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        });

        setIsGettingLocation(false);
      },
      options
    );
  };

  const getLocationName = async (lat: number, lng: number) => {
    try {
      // Using a free reverse geocoding service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      
      if (response.ok) {
        const data = await response.json();
        const locationName = data.localityInfo?.administrative?.[0]?.name || 
                           data.localityInfo?.administrative?.[1]?.name || 
                           data.localityInfo?.administrative?.[2]?.name || 
                           `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        
        setFormData(prev => ({
          ...prev,
          location: locationName,
        }));
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      // Fallback to coordinates if reverse geocoding fails
      setFormData(prev => ({
        ...prev,
        location: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      }));
    }
  };

  // CNN model removed: satellite upload and cnnVerifyReport handlers removed

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.location || !formData.type || !selectedFile) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select a photo",
        variant: "destructive",
      });
      return;
    }

    if (!formData.lat || !formData.lng) {
      toast({
        title: "Missing Coordinates",
        description: "Please provide GPS coordinates",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Upload photo to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `reports/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('reports')
        .upload(filePath, selectedFile, {
          contentType: selectedFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Photo upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('reports')
        .getPublicUrl(uploadData.path);

      // Insert report into database
      const { data: insertData, error: insertError } = await supabase
        .from('pollution_reports')
        .insert([
          {
            photo_url: publicUrlData.publicUrl,
            lat: parseFloat(formData.lat),
            lng: parseFloat(formData.lng),
            manual_location: formData.location,
            pollution_type: formData.type as 'oil' | 'plastic' | 'sewage' | 'turbidity',
            status: 'Pending',
            ai_confidence: null,
          },
        ])
        .select('id')
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw new Error(`Database insert failed: ${insertError.message}`);
      }
      
      toast({
        title: "Report Submitted Successfully!",
        description: "Your pollution report has been submitted and is awaiting verification.",
      });
      
      // Reset form
      setFormData({
        location: '',
        type: '',
        lat: '',
        lng: '',
      });
      removeFile();
      
      // Reload reports
      loadReports();
      
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit report",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verified': return 'bg-success text-success-foreground';
      case 'Pending': return 'bg-warning text-warning-foreground';
      case 'Rejected': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getPollutionTypeLabel = (type: string) => {
    switch (type) {
      case 'oil': return 'Oil Spill';
      case 'plastic': return 'Plastic Pollution';
      case 'sewage': return 'Sewage Overflow';
      case 'turbidity': return 'Water Turbidity';
      default: return type;
    }
  };

  const filteredReports = filter === 'All' ? reports : reports.filter(report => report.status === filter);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Pollution Reporting</h1>
        <p className="text-muted-foreground">
          Report water pollution incidents to help protect our ecosystems. Your reports make a difference.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Report Form */}
        <Card className="ocean-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span>Submit Pollution Report</span>
            </CardTitle>
            <CardDescription>
              Provide detailed information about the pollution incident you've observed
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="location" className="text-foreground">Location *</Label>
                  <Input
                    id="location"
                    placeholder="Enter specific location (e.g., Mumbai Harbor, Sector 5)"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="mt-1 bg-background border-border focus:border-ocean-primary"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="coordinates" className="text-foreground">GPS Coordinates *</Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      id="lat"
                      placeholder="Latitude"
                      type="number"
                      step="any"
                      value={formData.lat}
                      onChange={(e) => setFormData(prev => ({ ...prev, lat: e.target.value }))}
                      className="bg-background border-border focus:border-ocean-primary"
                      required
                    />
                    <Input
                      id="lng"
                      placeholder="Longitude"
                      type="number"
                      step="any"
                      value={formData.lng}
                      onChange={(e) => setFormData(prev => ({ ...prev, lng: e.target.value }))}
                      className="bg-background border-border focus:border-ocean-primary"
                      required
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                      className="min-w-[40px]"
                      title="Get current location"
                    >
                      {isGettingLocation ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click the location icon to automatically detect your current position
                  </p>
                  {formData.lat && formData.lng && (
                    <div className="mt-2 p-2 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Detected Location:</p>
                          <p className="text-sm font-medium">
                            {formData.location || `${formData.lat}, ${formData.lng}`}
                          </p>
                          <a
                            href={`https://www.google.com/maps?q=${formData.lat},${formData.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-ocean-primary hover:underline"
                          >
                            View on Google Maps →
                          </a>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setFormData(prev => ({ ...prev, lat: '', lng: '', location: '' }))}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                          title="Clear location"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="type" className="text-foreground">Pollution Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger className="mt-1 bg-background border-border focus:border-ocean-primary">
                      <SelectValue placeholder="Select pollution type" />
                    </SelectTrigger>
                    <SelectContent className="ocean-card border-border">
                      <SelectItem value="oil">Oil Spill</SelectItem>
                      <SelectItem value="plastic">Plastic Pollution</SelectItem>
                      <SelectItem value="sewage">Sewage Overflow</SelectItem>
                      <SelectItem value="turbidity">Water Turbidity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>



                <div>
                  <Label className="text-foreground">Photo Evidence *</Label>
                  <div className="mt-1">
                    {!selectedFile ? (
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label htmlFor="photo-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop photos
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG up to 10MB
                    </p>
                        </label>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={previewUrl || ''}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeFile}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* CNN model removed: satellite image upload UI removed */}
              </div>

              <Button 
                type="submit" 
                className="w-full wave-animation" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Submitting Report..."
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Report
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Card className="ocean-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span>Reporting Guidelines</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">What to Include:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-ocean-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Exact location with landmarks</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-ocean-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Date and time of observation</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-ocean-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Clear photos or videos if possible</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-ocean-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Weather conditions</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-ocean-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Suspected source if known</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Safety First:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-warning rounded-full mt-2 flex-shrink-0"></div>
                  <span>Do not touch contaminated water</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-warning rounded-full mt-2 flex-shrink-0"></div>
                  <span>Avoid inhaling fumes or vapors</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-warning rounded-full mt-2 flex-shrink-0"></div>
                  <span>Report from a safe distance</span>
                </li>
              </ul>
            </div>

            <div className="bg-card/50 p-4 rounded-lg border border-border">
              <h5 className="font-medium text-foreground mb-2">Emergency Situations</h5>
              <p className="text-sm text-muted-foreground">
                For immediate threats to human health or environment, also contact local authorities: 
                <span className="block mt-1 font-medium text-ocean-primary">Emergency: 112</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Statistics */}
      {aiStats && (
        <Card className="ocean-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-ocean-primary" />
              <span>AI Verification Statistics</span>
            </CardTitle>
            <CardDescription>
              Real-time AI verification performance and accuracy metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-ocean-primary">{aiStats.totalReports}</div>
                <div className="text-sm text-muted-foreground">Total Reports</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{aiStats.verifiedReports}</div>
                <div className="text-sm text-muted-foreground">Verified</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">{aiStats.rejectedReports}</div>
                <div className="text-sm text-muted-foreground">Rejected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">{aiStats.averageConfidence.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Avg Confidence</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submitted Reports */}
      <Card className="ocean-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-ocean-primary" />
                <span>Recent Reports</span>
              </CardTitle>
              <CardDescription>
                Track submitted pollution reports and their status
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Reports</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Verified">Verified</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {reports.filter(r => r.status === 'Pending').length > 0 && (
                <Button
                  onClick={batchVerifyAll}
                  disabled={isVerifying === 'batch'}
                  variant="outline"
                  size="sm"
                >
                  {isVerifying === 'batch' ? (
                    <>
                      <Brain className="h-4 w-4 mr-2 animate-spin" />
                      Verifying All...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Verify All Pending
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report ID</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Coordinates</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>AI Confidence</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.id.slice(0, 8)}...</TableCell>
                    <TableCell>{report.manual_location || 'Unknown'}</TableCell>
                    <TableCell>{getPollutionTypeLabel(report.pollution_type)}</TableCell>
                    <TableCell className="text-sm">
                      {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
                    </TableCell>
                    <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {report.ai_confidence ? (
                        <span className="text-sm">
                          {(report.ai_confidence * 100).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {report.status === 'Pending' && (
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => verifyReport(report.id)}
                            disabled={isVerifying === report.id}
                            className="h-8 text-xs"
                          >
                            {isVerifying === report.id ? (
                              <>
                                <Brain className="h-3 w-3 mr-1 animate-spin" />
                                AI...
                              </>
                            ) : (
                              <>
                                <Zap className="h-3 w-3 mr-1" />
                                AI
                              </>
                            )}
                          </Button>
                          {/* CNN model removed: per-report CNN action removed */}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Report;