import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Medal, 
  Crown, 
  TrendingUp,
  MapPin,
  Filter,
  Star,
  Award,
  BarChart3,
  Target,
  Zap,
  Gamepad2,
  CheckCircle,
  Video
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Import profile images (fallback removed)
import profile2 from "@/assets/profile2.jpg";
import profile3 from "@/assets/profile3.jpg";
import profile4 from "@/assets/profile4.jpg";
import profile5 from "@/assets/profile5.jpg";

interface AthleteRanking {
  rank: number;
  name: string;
  location: string;
  score: number;
  change: string;
  avatar_url?: string;
  achievements: number;
  isVerified: boolean;
}

const LeaderboardPage = () => {
  const [selectedRegion, setSelectedRegion] = useState("National");
  const [selectedCategory, setSelectedCategory] = useState("Overall");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [totalAthletesCount, setTotalAthletesCount] = useState(0);
  const [totalVideosCount, setTotalVideosCount] = useState(0);

  const [leaderboardData, setLeaderboardData] = useState<Record<string, AthleteRanking[]>>({
    cricket: [],
    football: [],
    basketball: [],
    badminton: [],
    tennis: [],
    hockey: [],
    athletics: []
  });

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const { data: athletes, error: aErr } = await supabase.from('athletes').select('*');
      if (aErr) throw new Error("Athletes Error: " + aErr.message);

      const { data: videos, error: vErr } = await supabase
        .from('videos')
        .select('*')
        .not('athlete_id', 'is', null)
        .neq('status', 'deleted');
      if (vErr) throw new Error("Videos Error: " + vErr.message);

      const { data: certs, error: cErr } = await supabase.from('certificates').select('*').not('athlete_id', 'is', null);
      if (cErr) throw new Error("Certs Error: " + cErr.message);

      if (!athletes || !videos) {
        throw new Error("No data returned from Supabase");
      }

      setTotalAthletesCount(athletes.length);
      setTotalVideosCount(videos.length);

      const sports = ['cricket', 'football', 'basketball', 'badminton', 'tennis', 'hockey', 'athletics'];
      const newLeaderboard: Record<string, AthleteRanking[]> = {};

      sports.forEach(sport => {
        const sportVideos = videos.filter(v => v.sport.toLowerCase() === sport.toLowerCase());
        
        let rankings: AthleteRanking[] = athletes.map(athlete => {
          const athleteVideos = sportVideos.filter(v => v.athlete_id === athlete.id);
          if (athleteVideos.length === 0) return null;

          const scores = athleteVideos.map(v => v.score || 0).sort((a, b) => b - a);
          const bestScore = scores[0];
          const top5 = scores.slice(0, 5);
          const avgTop5 = top5.reduce((a, b) => a + b, 0) / top5.length;
          
          // Hybrid Weighted Ranking Logic
          const hybridScore = Math.round((bestScore * 0.7) + (avgTop5 * 0.3));

          // Verified Badging
          const athleteCerts = certs?.filter(c => c.athlete_id === athlete.id) || [];
          const isVerified = athleteCerts.some(c => c.confidence_score && c.confidence_score >= 85);

          return {
            rank: 0,
            name: athlete.name,
            location: athlete.location,
            score: hybridScore,
            change: "0", 
            avatar_url: athlete.avatar_url,
            achievements: athleteVideos.length,
            isVerified
          };
        }).filter(Boolean) as AthleteRanking[];

        rankings.sort((a, b) => b.score - a.score);
        rankings.forEach((r, i) => r.rank = i + 1);

        newLeaderboard[sport] = rankings;
      });

      setLeaderboardData(newLeaderboard);
    } catch (err: any) {
      console.error("Failed to fetch leaderboard:", err);
      setErrorMsg(err.message || "An unknown error occurred while fetching leaderboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  const regions = ["National", "State", "District", "Zonal"];
  const categories = ["Overall", "Strength", "Stamina", "Style", "Technique"];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getChangeColor = (change: string) => {
    if (change.startsWith('+')) return 'text-green-500';
    if (change.startsWith('-')) return 'text-red-500';
    return 'text-muted-foreground';
  };

  return (
    <div className="min-h-screen pt-20 bg-muted/30">
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Live
            <span className="hero-gradient bg-clip-text text-transparent"> Leaderboards</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Real-time rankings from zonal to national level across all sports categories
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Filters */}
        <div className="sports-card mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-3 block">Region</label>
                <div className="flex flex-wrap gap-2">
                  {regions.map((region) => (
                    <Badge 
                      key={region} 
                      variant={region === selectedRegion ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => setSelectedRegion(region)}
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      {region}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-3 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge 
                      key={category} 
                      variant={category === selectedCategory ? "default" : "outline"}
                      className="cursor-pointer hover:bg-secondary hover:text-secondary-foreground transition-colors"
                      onClick={() => setSelectedCategory(category)}
                    >
                      <Target className="w-3 h-3 mr-1" />
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </div>

        {/* Sports Tabs */}
        <Tabs defaultValue="cricket" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mb-8">
            <TabsTrigger value="cricket" className="flex items-center gap-1 sm:gap-2">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Cricket</span>
              <span className="sm:hidden">Cricket</span>
            </TabsTrigger>
            <TabsTrigger value="football" className="flex items-center gap-1 sm:gap-2">
              <Medal className="w-4 h-4" />
              <span className="hidden sm:inline">Football</span>
              <span className="sm:hidden">Football</span>
            </TabsTrigger>
            <TabsTrigger value="basketball" className="flex items-center gap-1 sm:gap-2">
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Basketball</span>
              <span className="sm:hidden">Basketball</span>
            </TabsTrigger>
            <TabsTrigger value="badminton" className="flex items-center gap-1 sm:gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Badminton</span>
              <span className="sm:hidden">Badminton</span>
            </TabsTrigger>
            <TabsTrigger value="tennis" className="flex items-center gap-1 sm:gap-2">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Tennis</span>
              <span className="sm:hidden">Tennis</span>
            </TabsTrigger>
            <TabsTrigger value="hockey" className="flex items-center gap-1 sm:gap-2">
              <Gamepad2 className="w-4 h-4" />
              <span className="hidden sm:inline">Hockey</span>
              <span className="sm:hidden">Hockey</span>
            </TabsTrigger>
          </TabsList>

          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-8">
              <h3 className="font-bold">Error loading leaderboard</h3>
              <p>{errorMsg}</p>
            </div>
          )}

          {!isLoading && !errorMsg && Object.entries(leaderboardData).map(([sport, athletes]) => (
            <TabsContent key={sport} value={sport}>
              <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
                {/* Top 3 Podium */}
                <div className="order-2 lg:order-1 lg:col-span-1">
                  <Card className="sports-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-yellow-500" />
                        Top Performers
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6">
                      {athletes.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No athletes ranked yet.
                        </div>
                      ) : athletes.slice(0, 3).map((athlete, index) => (
                        <div key={athlete.rank} className="relative">
                          <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-muted/50 to-transparent hover:from-muted hover:shadow-lg transition-all duration-300">
                            <div className="relative flex-shrink-0">
                              {getRankIcon(athlete.rank)}
                              {index === 0 && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                              )}
                            </div>
                            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                              <AvatarImage src={athlete.avatar} />
                              <AvatarFallback>{athlete.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm sm:text-base truncate flex items-center gap-1">
                                {athlete.name}
                                {athlete.isVerified && (
                                  <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" title="Verified Athlete" />
                                )}
                              </h4>
                              <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{athlete.location}</span>
                              </p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <Badge variant="outline" className="text-xs">
                                  {athlete.score} pts
                                </Badge>
                                <span className={`text-xs flex items-center gap-1 ${getChangeColor(athlete.change)}`}>
                                  <TrendingUp className="w-3 h-3" />
                                  {athlete.change}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Full Leaderboard */}
                <div className="order-1 lg:order-2 lg:col-span-2">
                  <Card className="sports-card">
                    <CardHeader>
                      <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-sports-blue" />
                          <span className="truncate">{sport.charAt(0).toUpperCase() + sport.slice(1)} Rankings</span>
                        </span>
                        <Badge className="sports-badge self-start sm:self-auto">Live</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {athletes.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            Be the first to upload a video for {sport}!
                          </div>
                        ) : athletes.map((athlete, index) => (
                          <div key={athlete.rank} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-muted/50 transition-colors border border-border/50">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                              <div className="flex-shrink-0">
                                {getRankIcon(athlete.rank)}
                              </div>
                              <Avatar className={`h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 border-2 ${
                                index === 0 ? "border-yellow-400" :
                                index === 1 ? "border-gray-300" :
                                index === 2 ? "border-amber-600" :
                                "border-transparent"
                              }`}>
                                <AvatarImage src={athlete.avatar_url || undefined} alt={athlete.name} className="object-cover" />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {athlete.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-medium text-sm sm:text-base truncate flex items-center gap-1">
                                  {athlete.name}
                                  {athlete.isVerified && (
                                    <CheckCircle className="w-3 h-3 text-blue-500 flex-shrink-0" title="Verified Athlete" />
                                  )}
                                </h4>
                                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{athlete.location}</span>
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-right">
                              <div className="flex-shrink-0">
                                <div className="font-semibold text-sm sm:text-base">{athlete.score}</div>
                                <div className="text-xs text-muted-foreground hidden sm:block">points</div>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <Badge variant="outline" className="text-xs self-end sm:self-auto" title="Videos Uploaded">
                                  <Video className="w-3 h-3 mr-1" />
                                  {athlete.achievements}
                                </Badge>
                                {athlete.change !== "0" && (
                                  <span className={`text-xs sm:text-sm font-medium ${getChangeColor(athlete.change)} self-end sm:self-auto`}>
                                    {athlete.change}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 text-center">
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            alert("Viewing full rankings for this sport...");
                          }}
                        >
                          View Full Rankings
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mt-8">
          {[
            { label: "Total Athletes", value: totalAthletesCount.toString(), icon: Trophy, color: "text-sports-blue" },
            { label: "Videos Analyzed", value: totalVideosCount.toString(), icon: Medal, color: "text-sports-green" },
            { label: "Sports Covered", value: "7", icon: Award, color: "text-sports-orange" },
            { label: "Rankings Updated", value: "Real-time", icon: TrendingUp, color: "text-accent" }
          ].map((stat, index) => (
            <Card key={index} className="sports-card text-center">
              <CardContent className="p-6">
                <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;