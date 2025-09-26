import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, MapPin, Droplets, Fish, Star, Shield, Users, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import nftLakeImage from '@/assets/nft-lake-example.jpg';

interface WaterBodyNFT {
  id: string;
  name: string;
  location: string;
  type: 'Lake' | 'River' | 'Wetland' | 'Coastal';
  size: string;
  adoptionPrice: number;
  adopted: boolean;
  adoptedBy?: string;
  healthScore: number;
  protectionLevel: 'Basic' | 'Premium' | 'Elite';
  features: string[];
  impact: {
    livesProtected: number;
    speciesSupported: number;
    carbonOffset: number;
  };
  image: string;
}

const NFTAdoption = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [waterBodies] = useState<WaterBodyNFT[]>([
    {
      id: 'NFT001',
      name: 'Chilika Lake',
      location: 'Odisha, India',
      type: 'Lake',
      size: '1,165 km²',
      adoptionPrice: 0.5,
      adopted: false,
      healthScore: 78,
      protectionLevel: 'Premium',
      features: ['Biodiversity Hotspot', 'Migratory Bird Sanctuary', 'Fishing Community Support'],
      impact: {
        livesProtected: 15000,
        speciesSupported: 160,
        carbonOffset: 2500,
      },
      image: nftLakeImage,
    },
    {
      id: 'NFT002',
      name: 'Backwaters of Kerala',
      location: 'Kerala, India',
      type: 'Wetland',
      size: '900 km²',
      adoptionPrice: 0.8,
      adopted: true,
      adoptedBy: 'EcoWarriors NGO',
      healthScore: 85,
      protectionLevel: 'Elite',
      features: ['Sustainable Tourism', 'Traditional Fishing', 'Mangrove Protection'],
      impact: {
        livesProtected: 12000,
        speciesSupported: 140,
        carbonOffset: 3200,
      },
      image: nftLakeImage,
    },
    {
      id: 'NFT003',
      name: 'Yamuna River (Delhi Stretch)',
      location: 'Delhi, India',
      type: 'River',
      size: '48 km',
      adoptionPrice: 1.2,
      adopted: false,
      healthScore: 45,
      protectionLevel: 'Basic',
      features: ['Urban Restoration', 'Pollution Control', 'Community Awareness'],
      impact: {
        livesProtected: 25000,
        speciesSupported: 85,
        carbonOffset: 1800,
      },
      image: nftLakeImage,
    },
    {
      id: 'NFT004',
      name: 'Marina Beach Waters',
      location: 'Chennai, India',
      type: 'Coastal',
      size: '13 km coastline',
      adoptionPrice: 0.6,
      adopted: false,
      healthScore: 62,
      protectionLevel: 'Premium',
      features: ['Marine Biodiversity', 'Coastal Protection', 'Clean Beach Initiative'],
      impact: {
        livesProtected: 8000,
        speciesSupported: 120,
        carbonOffset: 2100,
      },
      image: nftLakeImage,
    },
  ]);

  const handleAdopt = (waterBody: WaterBodyNFT) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to adopt a water body",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Adoption Successful! 🎉",
      description: `You've successfully adopted ${waterBody.name}. Your contribution will help protect this ecosystem.`,
    });
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-ocean-primary';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  const getProtectionColor = (level: string) => {
    switch (level) {
      case 'Elite': return 'bg-accent text-accent-foreground';
      case 'Premium': return 'bg-ocean-primary text-primary-foreground';
      case 'Basic': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const totalAdoptions = waterBodies.filter(wb => wb.adopted).length;
  const totalAvailable = waterBodies.length;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">NFT Water Body Adoption</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Adopt and protect water ecosystems through blockchain-powered conservation. 
          Your adoption helps fund monitoring, cleanup, and restoration efforts.
        </p>
        
        <div className="flex justify-center space-x-8 mt-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-ocean-primary">{totalAdoptions}</div>
            <div className="text-sm text-muted-foreground">Adopted</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-success">{totalAvailable - totalAdoptions}</div>
            <div className="text-sm text-muted-foreground">Available</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent">45,000+</div>
            <div className="text-sm text-muted-foreground">Lives Protected</div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <Card className="ocean-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-ocean-primary" />
            <span>How NFT Adoption Works</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-ocean-primary/10 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-ocean-primary">1</span>
              </div>
              <h3 className="font-semibold text-foreground">Choose Water Body</h3>
              <p className="text-sm text-muted-foreground">Select a water ecosystem that needs protection</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-ocean-primary/10 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-ocean-primary">2</span>
              </div>
              <h3 className="font-semibold text-foreground">Make Pledge</h3>
              <p className="text-sm text-muted-foreground">Commit to protecting and monitoring the ecosystem</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-ocean-primary/10 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-ocean-primary">3</span>
              </div>
              <h3 className="font-semibold text-foreground">Get NFT Certificate</h3>
              <p className="text-sm text-muted-foreground">Receive blockchain-verified adoption certificate</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-ocean-primary/10 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-ocean-primary">4</span>
              </div>
              <h3 className="font-semibold text-foreground">Track Impact</h3>
              <p className="text-sm text-muted-foreground">Monitor ecosystem health and conservation progress</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Water Bodies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {waterBodies.map((waterBody) => (
          <Card key={waterBody.id} className={`ocean-card relative overflow-hidden ${waterBody.adopted ? 'opacity-75' : ''}`}>
            {waterBody.adopted && (
              <div className="absolute top-4 right-4 z-10">
                <Badge className="bg-success text-success-foreground">
                  <Heart className="h-3 w-3 mr-1" />
                  Adopted
                </Badge>
              </div>
            )}
            
            <div className="relative h-48 overflow-hidden">
              <img 
                src={waterBody.image} 
                alt={waterBody.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-xl font-bold text-foreground mb-1">{waterBody.name}</h3>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{waterBody.location}</span>
                  <Badge variant="outline" className="text-xs">
                    {waterBody.type}
                  </Badge>
                </div>
              </div>
            </div>

            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Size</p>
                  <p className="font-semibold text-foreground">{waterBody.size}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Health Score</p>
                  <div className="flex items-center space-x-2">
                    <Progress value={waterBody.healthScore} className="w-16 h-2" />
                    <span className={`font-semibold ${getHealthColor(waterBody.healthScore)}`}>
                      {waterBody.healthScore}%
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <Badge className={getProtectionColor(waterBody.protectionLevel)}>
                  {waterBody.protectionLevel} Protection
                </Badge>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-foreground text-sm">Key Features</h4>
                <div className="flex flex-wrap gap-1">
                  {waterBody.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-3 border-t border-border">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="h-4 w-4 text-ocean-primary" />
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {waterBody.impact.livesProtected.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Lives Protected</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Fish className="h-4 w-4 text-success" />
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {waterBody.impact.speciesSupported}
                  </div>
                  <div className="text-xs text-muted-foreground">Species</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <TrendingUp className="h-4 w-4 text-accent" />
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {waterBody.impact.carbonOffset}t
                  </div>
                  <div className="text-xs text-muted-foreground">CO₂ Offset</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Adoption Pledge</p>
                  <p className="text-lg font-bold text-foreground">{waterBody.adoptionPrice} ETH</p>
                </div>
                {waterBody.adopted ? (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Adopted by</p>
                    <p className="text-sm font-semibold text-success">{waterBody.adoptedBy}</p>
                  </div>
                ) : (
                  <Button 
                    onClick={() => handleAdopt(waterBody)}
                    className="wave-animation"
                    disabled={!user}
                  >
                    <Droplets className="h-4 w-4 mr-2" />
                    Adopt Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Benefits of Adoption */}
      <Card className="ocean-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-warning" />
            <span>Benefits of Water Body Adoption</span>
          </CardTitle>
          <CardDescription>What you get when you become a water guardian</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-ocean-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-ocean-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Exclusive NFT Certificate</h3>
              <p className="text-sm text-muted-foreground">
                Unique blockchain-verified certificate of your conservation contribution
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <h3 className="font-semibold text-foreground">Real-time Monitoring</h3>
              <p className="text-sm text-muted-foreground">
                Track water quality, biodiversity, and restoration progress
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">Community Recognition</h3>
              <p className="text-sm text-muted-foreground">
                Join elite community of water guardians and conservation leaders
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-warning" />
              </div>
              <h3 className="font-semibold text-foreground">Impact Reports</h3>
              <p className="text-sm text-muted-foreground">
                Quarterly reports on ecosystem health and conservation achievements
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="w-10 h-10 bg-ocean-light/10 rounded-lg flex items-center justify-center">
                <Fish className="h-5 w-5 text-ocean-light" />
              </div>
              <h3 className="font-semibold text-foreground">Biodiversity Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Monitor species populations and ecosystem recovery metrics
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-destructive" />
              </div>
              <h3 className="font-semibold text-foreground">Carbon Credits</h3>
              <p className="text-sm text-muted-foreground">
                Earn verified carbon offset credits for your conservation efforts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NFTAdoption;