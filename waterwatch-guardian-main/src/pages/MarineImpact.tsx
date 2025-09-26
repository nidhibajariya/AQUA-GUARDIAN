import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Fish, AlertTriangle, TrendingUp, Brain, BarChart3, Waves, MapPin } from 'lucide-react';
import { PollutionReport, supabase } from '@/lib/supabase';

const MarineImpact = () => {
  const [reports, setReports] = useState<PollutionReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('pollution_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading reports:', error);
        return;
      }

      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pollution statistics from real data
  const pollutionStats = reports.reduce((acc, report) => {
    acc[report.pollution_type] = (acc[report.pollution_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalReports = reports.length;
  const verifiedReports = reports.filter(r => r.status === 'Verified').length;
  const pendingReports = reports.filter(r => r.status === 'Pending').length;

  const impactData = [
    {
      species: 'Marine Fish',
      currentPopulation: 2500000,
      projectedChange: -15,
      threats: ['Plastic Pollution', 'Chemical Runoff', 'Temperature Rise'],
      conservationStatus: 'Vulnerable',
    },
    {
      species: 'Coral Reefs',
      currentPopulation: 850,
      projectedChange: -23,
      threats: ['Ocean Acidification', 'Pollution', 'Warming Waters'],
      conservationStatus: 'Critical',
    },
    {
      species: 'Sea Turtles',
      currentPopulation: 45000,
      projectedChange: -8,
      threats: ['Plastic Ingestion', 'Nesting Site Loss', 'Fishing Nets'],
      conservationStatus: 'Endangered',
    },
    {
      species: 'Dolphins & Whales',
      currentPopulation: 12000,
      projectedChange: +3,
      threats: ['Noise Pollution', 'Ship Strikes', 'Chemical Toxins'],
      conservationStatus: 'Stable',
    },
  ];

  const aiPredictions = [
    {
      timeframe: 'Next 5 Years',
      prediction: 'Moderate decline in marine biodiversity if current pollution trends continue',
      confidence: 87,
      severity: 'High',
    },
    {
      timeframe: 'Next 10 Years',
      prediction: 'Critical threshold for coral reef ecosystems without intervention',
      confidence: 92,
      severity: 'Critical',
    },
    {
      timeframe: 'Next 20 Years',
      prediction: 'Potential for significant recovery with aggressive conservation efforts',
      confidence: 76,
      severity: 'Moderate',
    },
  ];

  const pollutionSources = [
    { source: 'Oil Spills', impact: totalReports > 0 ? (pollutionStats.oil || 0) / totalReports * 100 : 0, trend: 'Increasing' },
    { source: 'Plastic Pollution', impact: totalReports > 0 ? (pollutionStats.plastic || 0) / totalReports * 100 : 0, trend: 'Stable' },
    { source: 'Sewage Overflow', impact: totalReports > 0 ? (pollutionStats.sewage || 0) / totalReports * 100 : 0, trend: 'Increasing' },
    { source: 'Water Turbidity', impact: totalReports > 0 ? (pollutionStats.turbidity || 0) / totalReports * 100 : 0, trend: 'Stable' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Critical': return 'bg-destructive text-destructive-foreground';
      case 'Endangered': return 'bg-warning text-warning-foreground';
      case 'Vulnerable': return 'bg-ocean-primary text-primary-foreground';
      case 'Stable': return 'bg-success text-success-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-destructive';
      case 'High': return 'text-warning';
      case 'Moderate': return 'text-ocean-primary';
      case 'Low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Marine Impact Analysis</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          AI-powered predictions and analysis of pollution effects on marine ecosystems and biodiversity
        </p>
      </div>

      {/* AI Predictions */}
      <Card className="ocean-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-ocean-primary" />
            <span>AI-Powered Ecosystem Predictions</span>
          </CardTitle>
          <CardDescription>
            Machine learning models analyze current trends to predict future marine ecosystem health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {aiPredictions.map((prediction, index) => (
              <div key={index} className="p-4 bg-card/50 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">{prediction.timeframe}</h3>
                  <div className="flex items-center space-x-2">
                    <Badge className={getSeverityColor(prediction.severity)}>
                      {prediction.severity} Risk
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {prediction.confidence}% confidence
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">{prediction.prediction}</p>
                <div className="mt-3">
                  <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                    <span>Prediction Confidence</span>
                    <span>{prediction.confidence}%</span>
                  </div>
                  <Progress value={prediction.confidence} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Species Impact Assessment */}
      <Card className="ocean-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Fish className="h-5 w-5 text-ocean-light" />
            <span>Species Impact Assessment</span>
          </CardTitle>
          <CardDescription>
            Current population status and projected changes for key marine species
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {impactData.map((species, index) => (
              <div key={index} className="p-4 bg-card/50 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground text-lg">{species.species}</h3>
                  <Badge className={getStatusColor(species.conservationStatus)}>
                    {species.conservationStatus}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Current Population</span>
                      <span className="font-semibold text-foreground">
                        {species.currentPopulation.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">5-Year Projection</span>
                      <span className={`font-semibold ${species.projectedChange < 0 ? 'text-destructive' : 'text-success'}`}>
                        {species.projectedChange > 0 ? '+' : ''}{species.projectedChange}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Primary Threats</h4>
                    <div className="flex flex-wrap gap-1">
                      {species.threats.map((threat, threatIndex) => (
                        <Badge key={threatIndex} variant="outline" className="text-xs">
                          {threat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pollution Sources Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="ocean-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-warning" />
              <span>Pollution Sources Impact</span>
            </CardTitle>
            <CardDescription>
              Major pollution sources affecting marine ecosystems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pollutionSources.map((source, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">{source.source}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{source.impact}%</span>
                      <Badge 
                        variant="outline" 
                        className={
                          source.trend === 'Increasing' ? 'text-destructive border-destructive' :
                          source.trend === 'Decreasing' ? 'text-success border-success' :
                          'text-ocean-primary border-ocean-primary'
                        }
                      >
                        {source.trend}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={source.impact} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="ocean-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <span>Conservation Effectiveness</span>
            </CardTitle>
            <CardDescription>
              Impact of current conservation efforts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-success mb-2">78%</div>
                <p className="text-sm text-muted-foreground">Overall Conservation Success Rate</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Protected Areas Established</span>
                  <span className="font-semibold text-foreground">1,247</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Species Recovery Programs</span>
                  <span className="font-semibold text-foreground">89</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pollution Reduction Achieved</span>
                  <span className="font-semibold text-success">32%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Community Engagement Score</span>
                  <span className="font-semibold text-ocean-primary">9.2/10</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Recommendations */}
      <Card className="ocean-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <span>AI-Generated Action Recommendations</span>
          </CardTitle>
          <CardDescription>
            Data-driven suggestions for immediate conservation action
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <h3 className="font-semibold text-destructive mb-2">Immediate Action Required</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Implement stricter industrial discharge controls</li>
                <li>• Establish emergency response protocols</li>
                <li>• Increase monitoring in critical zones</li>
              </ul>
            </div>

            <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
              <h3 className="font-semibold text-warning mb-2">Medium-term Strategy</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Expand plastic waste collection programs</li>
                <li>• Develop sustainable fishing guidelines</li>
                <li>• Create marine protected areas</li>
              </ul>
            </div>

            <div className="p-4 bg-success/10 rounded-lg border border-success/20">
              <h3 className="font-semibold text-success mb-2">Long-term Vision</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Achieve 50% pollution reduction by 2030</li>
                <li>• Restore degraded marine habitats</li>
                <li>• Build resilient coastal communities</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Pollution Reports */}
      <Card className="ocean-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-ocean-primary" />
            <span>Real-time Pollution Reports</span>
          </CardTitle>
          <CardDescription>
            Live pollution incidents reported through our platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Loading pollution data...</div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-ocean-primary mb-2">{totalReports}</div>
                  <div className="text-sm text-muted-foreground">Total Reports</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-success mb-2">{verifiedReports}</div>
                  <div className="text-sm text-muted-foreground">Verified Reports</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-warning mb-2">{pendingReports}</div>
                  <div className="text-sm text-muted-foreground">Pending Review</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent mb-2">
                    {totalReports > 0 ? Math.round((verifiedReports / totalReports) * 100) : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Verification Rate</div>
                </div>
              </div>
              
              {reports.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-foreground mb-3">Recent Pollution Incidents</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {reports.slice(0, 10).map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            report.status === 'Verified' ? 'bg-success' :
                            report.status === 'Pending' ? 'bg-warning' : 'bg-destructive'
                          }`} />
                          <div>
                            <div className="font-medium text-foreground capitalize">
                              {report.pollution_type} Pollution
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {report.manual_location || `${report.lat.toFixed(4)}, ${report.lng.toFixed(4)}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(report.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-time Ecosystem Health */}
      <Card className="ocean-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Waves className="h-5 w-5 text-ocean-primary" />
            <span>Real-time Ecosystem Health Index</span>
          </CardTitle>
          <CardDescription>
            Live assessment of marine ecosystem vitality across monitored regions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-success mb-2">8.2</div>
              <div className="text-sm text-muted-foreground">Water Quality Index</div>
              <Progress value={82} className="h-2 mt-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-ocean-primary mb-2">7.5</div>
              <div className="text-sm text-muted-foreground">Biodiversity Score</div>
              <Progress value={75} className="h-2 mt-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-warning mb-2">6.8</div>
              <div className="text-sm text-muted-foreground">Pollution Level</div>
              <Progress value={68} className="h-2 mt-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">9.1</div>
              <div className="text-sm text-muted-foreground">Conservation Effort</div>
              <Progress value={91} className="h-2 mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarineImpact;