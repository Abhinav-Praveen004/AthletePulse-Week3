import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Brain, 
  Users, 
  BarChart3, 
  Medal, 
  Zap,
  Play,
  ArrowRight,
  CheckCircle,
  Target,
  Award,
  TrendingUp,
  Upload
} from "lucide-react";
import heroImage from "@/assets/hero-sports.jpg";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const HomePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-5"></div>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <Badge className="sports-badge mb-6">
                <Zap className="w-4 h-4 mr-2" />
                AI-Powered Sports Analysis
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                AI-Powered Sports Talent{" "}
                <span className="hero-gradient bg-clip-text text-transparent">
                  Assessment Platform
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Upload your sports videos, get AI analysis, compete on leaderboards, 
                and connect with coaches. Transform your athletic journey with data-driven insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button variant="hero" size="lg" className="group" onClick={() => navigate('/login?role=athlete')}>
                  <Trophy className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" size="lg" className="group" onClick={() => navigate('/leaderboard')}>
                  <BarChart3 className="w-5 h-5 mr-2" />
                  View Leaderboards
                </Button>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-secondary" />
                  Video Analysis
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-secondary" />
                  Performance Tracking
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-secondary" />
                  Coach Discovery
                </div>
              </div>
            </div>
            <div className="relative animate-fade-in">
              <div className="absolute inset-0 hero-gradient rounded-2xl blur-3xl opacity-20 animate-pulse-glow"></div>
              <img
                src={heroImage}
                alt="Athletes showcasing sports performance"
                className="relative rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How SportsAI Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Four simple steps to unlock your athletic potential
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Upload,
                title: "Upload Videos",
                description: "Record and upload your sports performance videos",
                color: "text-sports-blue"
              },
              {
                icon: Brain,
                title: "AI Analysis",
                description: "Get detailed AI-powered technique and performance analysis",
                color: "text-sports-green"
              },
              {
                icon: Trophy,
                title: "Compete & Rank",
                description: "See your rankings on district, state, and national leaderboards",
                color: "text-sports-orange"
              },
              {
                icon: Users,
                title: "Connect & Grow",
                description: "Find coaches, join communities, and improve together",
                color: "text-accent"
              }
            ].map((feature, index) => (
              <Card key={index} className="sports-card group">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 ${feature.color} bg-current/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: "15K+", label: "Athletes Registered", icon: Users },
              { number: "25+", label: "Sports Supported", icon: Medal },
              { number: "500K+", label: "Videos Analyzed", icon: Play },
              { number: "1200+", label: "Coaches Connected", icon: Award }
            ].map((stat, index) => (
              <div key={index} className="group">
                <div className="text-4xl md:text-5xl font-bold hero-gradient bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <stat.icon className="w-4 h-4" />
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 hero-gradient">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Unlock Your Athletic Potential?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join the AI revolution in sports. Get personalized insights, compete fairly, and connect with the right coaches.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" className="group" onClick={() => navigate('/login?role=athlete')}>
              <Target className="w-5 h-5 mr-2" />
              Start as Athlete
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => navigate('/login?role=coach')}>
              <TrendingUp className="w-5 h-5 mr-2" />
              Join as Coach
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;