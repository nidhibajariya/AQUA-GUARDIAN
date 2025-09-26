import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
// Charts will be added later with proper implementation
import { Droplets, Thermometer, Eye, Waves, AlertTriangle, CheckCircle, TrendingUp, Fish } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Simulate real-time data updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock real-time water quality data
  const waterQualityData = [
    { time: '00:00', pH: 7.2, turbidity: 2.1, oxygen: 8.5, salinity: 0.5, temperature: 24 },
    { time: '04:00', pH: 7.1, turbidity: 2.3, oxygen: 8.3, salinity: 0.6, temperature: 23 },
    { time: '08:00', pH: 7.3, turbidity: 1.9, oxygen: 8.7, salinity: 0.4, temperature: 25 },
    { time: '12:00', pH: 7.0, turbidity: 2.5, oxygen: 8.1, salinity: 0.7, temperature: 27 },
    { time: '16:00', pH: 7.2, turbidity: 2.0, oxygen: 8.6, salinity: 0.5, temperature: 26 },
    { time: '20:00', pH: 7.4, turbidity: 1.8, oxygen: 8.8, salinity: 0.3, temperature: 24 },
  ];

  const pollutionHotspots = [
    { location: 'Mumbai Harbor', severity: 85, status: 'Critical', lat: 19.0760, lng: 72.8777 },
    { location: 'Delhi Yamuna', severity: 72, status: 'High', lat: 28.7041, lng: 77.1025 },
    { location: 'Chennai Marina', severity: 45, status: 'Medium', lat: 13.0827, lng: 80.2707 },
    { location: 'Kolkata Hooghly', severity: 58, status: 'High', lat: 22.5726, lng: 88.3639 },
    { location: 'Kochi Backwaters', severity: 28, status: 'Low', lat: 9.9312, lng: 76.2673 },
  ];

  const marineImpactData = [
    { name: 'Fish Population', current: 75, target: 90, color: '#3b82f6' },
    { name: 'Coral Health', current: 62, target: 85, color: '#10b981' },
    { name: 'Water Clarity', current: 58, target: 80, color: '#06b6d4' },
    { name: 'Biodiversity', current: 68, target: 90, color: '#8b5cf6' },
  ];

  const currentParameters = {
    pH: { value: 7.2, status: 'normal', range: '6.5-8.5' },
    turbidity: { value: 2.1, status: 'good', range: '<5 NTU' },
    oxygen: { value: 8.5, status: 'excellent', range: '>6 mg/L' },
    salinity: { value: 0.5, status: 'normal', range: '<1 ppt' },
    temperature: { value: 24, status: 'optimal', range: '20-30°C' },
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-success';
      case 'good': return 'text-ocean-primary';
      case 'normal': return 'text-ocean-light';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent': return <Badge className="bg-success text-success-foreground">Excellent</Badge>;
      case 'good': return <Badge className="bg-ocean-primary text-primary-foreground">Good</Badge>;
      case 'normal': return <Badge className="bg-ocean-light text-accent-foreground">Normal</Badge>;
      case 'warning': return <Badge className="bg-warning text-warning-foreground">Warning</Badge>;
      case 'critical': return <Badge variant="destructive">Critical</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const canAccessAdvanced = user?.role === 'NGO' || user?.role === 'Government';

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Water Quality Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time monitoring • Last updated: {currentTime.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Live Data</span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Parameters Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="ocean-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">pH Level</CardTitle>
              <Waves className="h-4 w-4 text-ocean-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className={`text-2xl font-bold ${getStatusColor(currentParameters.pH.status)}`}>
                {currentParameters.pH.value}
              </div>
              {getStatusBadge(currentParameters.pH.status)}
              <p className="text-xs text-muted-foreground">Range: {currentParameters.pH.range}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="ocean-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Turbidity</CardTitle>
              <Eye className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className={`text-2xl font-bold ${getStatusColor(currentParameters.turbidity.status)}`}>
                {currentParameters.turbidity.value} NTU
              </div>
              {getStatusBadge(currentParameters.turbidity.status)}
              <p className="text-xs text-muted-foreground">Range: {currentParameters.turbidity.range}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="ocean-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Dissolved Oxygen</CardTitle>
              <Droplets className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className={`text-2xl font-bold ${getStatusColor(currentParameters.oxygen.status)}`}>
                {currentParameters.oxygen.value} mg/L
              </div>
              {getStatusBadge(currentParameters.oxygen.status)}
              <p className="text-xs text-muted-foreground">Range: {currentParameters.oxygen.range}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="ocean-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Salinity</CardTitle>
              <Waves className="h-4 w-4 text-ocean-light" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className={`text-2xl font-bold ${getStatusColor(currentParameters.salinity.status)}`}>
                {currentParameters.salinity.value} ppt
              </div>
              {getStatusBadge(currentParameters.salinity.status)}
              <p className="text-xs text-muted-foreground">Range: {currentParameters.salinity.range}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="ocean-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Temperature</CardTitle>
              <Thermometer className="h-4 w-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className={`text-2xl font-bold ${getStatusColor(currentParameters.temperature.status)}`}>
                {currentParameters.temperature.value}°C
              </div>
              {getStatusBadge(currentParameters.temperature.status)}
              <p className="text-xs text-muted-foreground">Range: {currentParameters.temperature.range}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Water Quality Trends */}
        <Card className="ocean-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-ocean-primary" />
              <span>24-Hour Water Quality Trends</span>
            </CardTitle>
            <CardDescription>Real-time monitoring of key parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] bg-gradient-to-br from-ocean-deep to-card rounded-lg flex items-center justify-center border border-border">
              <div className="text-center space-y-4">
                <TrendingUp className="h-12 w-12 mx-auto text-ocean-primary" />
                <div>
                  <p className="text-lg font-semibold text-foreground">Live Water Quality Chart</p>
                  <p className="text-sm text-muted-foreground">pH: 7.2 • Oxygen: 8.5mg/L • Turbidity: 2.1 NTU</p>
                </div>
                <div className="flex justify-center space-x-4 text-xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-ocean-primary rounded-full"></div>
                    <span className="text-muted-foreground">pH Level</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-muted-foreground">Oxygen</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-muted-foreground">Turbidity</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marine Impact Assessment */}
        <Card className="ocean-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Fish className="h-5 w-5 text-ocean-light" />
              <span>Marine Impact Assessment</span>
            </CardTitle>
            <CardDescription>AI-powered ecosystem health analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {marineImpactData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                    <span className="text-sm text-muted-foreground">{item.current}% / {item.target}%</span>
                  </div>
                  <Progress 
                    value={item.current} 
                    className="h-2"
                    style={{
                      '--progress-background': item.color
                    } as React.CSSProperties}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Current</span>
                    <span>Target: {item.target}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pollution Hotspots Map Placeholder and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="ocean-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span>Pollution Hotspots Map</span>
            </CardTitle>
            <CardDescription>Interactive map showing pollution levels across monitored areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-ocean-deep to-card rounded-lg flex items-center justify-center border border-border">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-ocean-primary/10 rounded-full flex items-center justify-center">
                  <Waves className="h-8 w-8 text-ocean-primary" />
                </div>
                <p className="text-muted-foreground">Interactive Map</p>
                <p className="text-sm text-muted-foreground">Folium integration placeholder</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="ocean-card">
          <CardHeader>
            <CardTitle className="text-lg">Hotspot Rankings</CardTitle>
            <CardDescription>Areas requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pollutionHotspots.map((hotspot, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-card/50">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground text-sm">{hotspot.location}</p>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={
                          hotspot.status === 'Critical' ? 'destructive' :
                          hotspot.status === 'High' ? 'secondary' :
                          hotspot.status === 'Medium' ? 'outline' : 'default'
                        }
                        className={
                          hotspot.status === 'Medium' ? 'bg-warning text-warning-foreground' :
                          hotspot.status === 'Low' ? 'bg-success text-success-foreground' : ''
                        }
                      >
                        {hotspot.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{hotspot.severity}%</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ocean-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics (Role-based access) */}
      {canAccessAdvanced && (
        <Card className="ocean-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span>Advanced Analytics Dashboard</span>
              <Badge className="bg-accent text-accent-foreground">{user?.role} Access</Badge>
            </CardTitle>
            <CardDescription>
              Enhanced monitoring tools and predictive analytics for {user?.role.toLowerCase()} organizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Pollution Predictions</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Next 7 days</span>
                    <Badge className="bg-warning text-warning-foreground">Moderate Risk</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Next 30 days</span>
                    <Badge className="bg-success text-success-foreground">Low Risk</Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Compliance Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Environmental Standards</span>
                    <Badge className="bg-success text-success-foreground">98% Compliant</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Safety Regulations</span>
                    <Badge className="bg-success text-success-foreground">100% Compliant</Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Impact Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Lives Protected</span>
                    <span className="text-sm font-medium text-success">2.3M+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Water Cleaned</span>
                    <span className="text-sm font-medium text-ocean-primary">890K L</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;