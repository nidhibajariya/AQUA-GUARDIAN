import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Users, TrendingUp, Award, Droplets, Fish } from 'lucide-react';
import beforeAfterImage from '@/assets/before-after-story.jpg';

const SuccessStories = () => {
  const stories = [
    {
      id: 1,
      title: 'Chilika Lake Restoration',
      location: 'Odisha, India',
      timeframe: '2022-2024',
      impact: {
        waterQualityImproved: 85,
        speciesRecovered: 23,
        livesImpacted: 15000,
        pollutionReduced: 67,
      },
      description: 'Through community collaboration and scientific intervention, Chilika Lake has seen remarkable recovery in biodiversity and water quality.',
      challenges: [
        'Industrial pollution from nearby factories',
        'Unregulated fishing practices',
        'Sedimentation from agricultural runoff'
      ],
      solutions: [
        'Implementation of strict pollution controls',
        'Community-based sustainable fishing programs',
        'Wetland restoration and buffer zones'
      ],
      results: [
        'Return of endangered Irrawaddy dolphins',
        '85% improvement in water clarity',
        'Restoration of 200+ bird species habitat'
      ],
      image: beforeAfterImage,
      stakeholders: ['Local Communities', 'Environmental NGOs', 'Government', 'Research Institutions'],
      status: 'Ongoing Success',
    },
    {
      id: 2,
      title: 'Mumbai Harbor Clean-up Initiative',
      location: 'Mumbai, Maharashtra',
      timeframe: '2023-2024',
      impact: {
        waterQualityImproved: 72,
        speciesRecovered: 15,
        livesImpacted: 25000,
        pollutionReduced: 58,
      },
      description: 'Massive citizen-led cleanup effort transformed Mumbai Harbor from a pollution hotspot to a recovering marine ecosystem.',
      challenges: [
        'Heavy industrial discharge',
        'Plastic waste accumulation',
        'Oil spills from shipping activities'
      ],
      solutions: [
        'Daily waste collection drives',
        'Industrial compliance monitoring',
        'Community awareness campaigns'
      ],
      results: [
        'Removed 500 tons of plastic waste',
        'Installed 50 water quality sensors',
        'Trained 1000+ volunteer guardians'
      ],
      image: beforeAfterImage,
      stakeholders: ['Citizens', 'Mumbai Port Trust', 'Environmental Groups', 'Local Government'],
      status: 'Significant Progress',
    },
    {
      id: 3,
      title: 'Kerala Backwaters Revival',
      location: 'Kerala, India',
      timeframe: '2021-2024',
      impact: {
        waterQualityImproved: 91,
        speciesRecovered: 34,
        livesImpacted: 12000,
        pollutionReduced: 78,
      },
      description: 'Comprehensive ecosystem restoration bringing back the pristine beauty and biodiversity of Kerala backwaters.',
      challenges: [
        'Tourism-related pollution',
        'Uncontrolled boat traffic',
        'Sewage discharge from houseboats'
      ],
      solutions: [
        'Eco-friendly tourism guidelines',
        'Sustainable transportation systems',
        'Advanced waste treatment facilities'
      ],
      results: [
        'Zero plastic policy implementation',
        'Return of native fish species',
        'Sustainable tourism model adopted'
      ],
      image: beforeAfterImage,
      stakeholders: ['Tourism Industry', 'Local Fishermen', 'State Government', 'Conservation Groups'],
      status: 'Model Success',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Model Success': return 'bg-success text-success-foreground';
      case 'Ongoing Success': return 'bg-ocean-primary text-primary-foreground';
      case 'Significant Progress': return 'bg-accent text-accent-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const overallStats = {
    totalProjects: 12,
    waterBodiesRestored: 8,
    speciesRecovered: 156,
    communitiesImpacted: 45,
    pollutionReduced: 68,
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Success Stories</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Witness the transformative power of community action and scientific intervention 
          in restoring our water ecosystems across India
        </p>
      </div>

      {/* Overall Impact Stats */}
      <Card className="ocean-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-warning" />
            <span>Collective Impact Achievement</span>
          </CardTitle>
          <CardDescription>
            Combined results from all successful water restoration projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-ocean-primary mb-2">
                {overallStats.totalProjects}
              </div>
              <div className="text-sm text-muted-foreground">Restoration Projects</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success mb-2">
                {overallStats.waterBodiesRestored}
              </div>
              <div className="text-sm text-muted-foreground">Water Bodies Restored</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">
                {overallStats.speciesRecovered}
              </div>
              <div className="text-sm text-muted-foreground">Species Recovered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-ocean-light mb-2">
                {overallStats.communitiesImpacted}
              </div>
              <div className="text-sm text-muted-foreground">Communities Impacted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-warning mb-2">
                {overallStats.pollutionReduced}%
              </div>
              <div className="text-sm text-muted-foreground">Avg. Pollution Reduced</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Stories */}
      <div className="space-y-12">
        {stories.map((story, index) => (
          <Card key={story.id} className="ocean-card overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Image Section */}
              <div className="relative h-64 lg:h-auto">
                <img 
                  src={story.image} 
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent lg:bg-gradient-to-r" />
                <div className="absolute top-4 left-4">
                  <Badge className={getStatusColor(story.status)}>
                    {story.status}
                  </Badge>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 lg:p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">{story.title}</h2>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{story.location}</span>
                    <span>•</span>
                    <span>{story.timeframe}</span>
                  </div>
                  <p className="mt-4 text-muted-foreground">{story.description}</p>
                </div>

                {/* Impact Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Droplets className="h-4 w-4 text-ocean-primary" />
                      <span className="text-sm font-medium text-foreground">Water Quality</span>
                    </div>
                    <div className="text-2xl font-bold text-ocean-primary">
                      +{story.impact.waterQualityImproved}%
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Fish className="h-4 w-4 text-success" />
                      <span className="text-sm font-medium text-foreground">Species Recovered</span>
                    </div>
                    <div className="text-2xl font-bold text-success">
                      {story.impact.speciesRecovered}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-accent" />
                      <span className="text-sm font-medium text-foreground">Lives Impacted</span>
                    </div>
                    <div className="text-2xl font-bold text-accent">
                      {story.impact.livesImpacted.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-warning" />
                      <span className="text-sm font-medium text-foreground">Pollution Reduced</span>
                    </div>
                    <div className="text-2xl font-bold text-warning">
                      -{story.impact.pollutionReduced}%
                    </div>
                  </div>
                </div>

                {/* Key Results */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Key Achievements</span>
                  </h3>
                  <ul className="space-y-2">
                    {story.results.map((result, resultIndex) => (
                      <li key={resultIndex} className="flex items-start space-x-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-success rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-muted-foreground">{result}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Stakeholders */}
                <div>
                  <h4 className="font-medium text-foreground mb-2">Key Stakeholders</h4>
                  <div className="flex flex-wrap gap-2">
                    {story.stakeholders.map((stakeholder, stakeholderIndex) => (
                      <Badge key={stakeholderIndex} variant="outline" className="text-xs">
                        {stakeholder}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <Card className="ocean-card text-center">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Be Part of the Next Success Story
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            These transformations happened because communities took action. 
            Your water body could be the next success story in our conservation efforts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-ocean-primary text-primary-foreground rounded-lg font-medium wave-animation">
              Report a Pollution Issue
            </button>
            <button className="px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-card/50 transition-colors">
              Join a Cleanup Drive
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuccessStories;