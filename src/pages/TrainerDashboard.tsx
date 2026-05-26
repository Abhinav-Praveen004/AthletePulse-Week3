import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Users, Video, Award, CheckCircle, Clock, Star,
  TrendingUp, User, Trophy, FileText, BarChart3, Edit3, Send
} from "lucide-react";

interface AthleteSubmission {
  id: number;
  athlete: string;
  sport: string;
  videoName: string;
  date: string;
  status: "pending" | "reviewed";
  aiScore: number;
  trainerScore: number | null;
  feedback: string;
  avatar: string;
}

interface CertRequest {
  id: number;
  athlete: string;
  certName: string;
  issuer: string;
  date: string;
  status: "pending" | "approved" | "rejected";
}

import { useAuth } from "@/contexts/AuthContext";

const TrainerDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const trainerName = user?.user_metadata?.name || user?.email?.split('@')[0] || "Trainer";

  const [submissions, setSubmissions] = useState<AthleteSubmission[]>([
    { id: 1, athlete: "Arjun Sharma", sport: "Cricket", videoName: "Cricket_Batting_Practice.mp4", date: "2024-01-20", status: "pending", aiScore: 92, trainerScore: null, feedback: "", avatar: "AS" },
    { id: 2, athlete: "Priya Patel", sport: "Basketball", videoName: "Basketball_Drills.mp4", date: "2024-01-19", status: "pending", aiScore: 85, trainerScore: null, feedback: "", avatar: "PP" },
    { id: 3, athlete: "Vikram Singh", sport: "Football", videoName: "Football_Sprint.mp4", date: "2024-01-18", status: "reviewed", aiScore: 78, trainerScore: 80, feedback: "Good speed, improve ball control.", avatar: "VS" },
    { id: 4, athlete: "Sneha Kumar", sport: "Badminton", videoName: "Badminton_Smash.mp4", date: "2024-01-17", status: "reviewed", aiScore: 94, trainerScore: 93, feedback: "Excellent smash technique!", avatar: "SK" },
  ]);

  const [certRequests, setCertRequests] = useState<CertRequest[]>([
    { id: 1, athlete: "Arjun Sharma", certName: "State Level Cricket Certificate", issuer: "BCCI", date: "2024-01-15", status: "pending" },
    { id: 2, athlete: "Sneha Kumar", certName: "National Badminton Championship", issuer: "BAI", date: "2024-01-10", status: "approved" },
  ]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [scoreInput, setScoreInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");

  const handleReview = (id: number) => {
    setEditingId(id);
    const sub = submissions.find(s => s.id === id);
    setScoreInput(sub?.aiScore.toString() || "");
    setFeedbackInput(sub?.feedback || "");
  };

  const handleSubmitReview = (id: number) => {
    const score = parseInt(scoreInput);
    if (isNaN(score) || score < 0 || score > 100) {
      toast({ title: "Invalid score", description: "Score must be between 0 and 100.", variant: "destructive" });
      return;
    }
    setSubmissions(prev => prev.map(s =>
      s.id === id ? { ...s, trainerScore: score, feedback: feedbackInput, status: "reviewed" } : s
    ));
    setEditingId(null);
    toast({ title: "Review Submitted!", description: `Score ${score}/100 assigned and leaderboard updated.` });
  };

  const handleCertAction = (id: number, action: "approved" | "rejected") => {
    setCertRequests(prev => prev.map(c => c.id === id ? { ...c, status: action } : c));
    toast({ title: `Certificate ${action}!`, description: `The certificate has been ${action}.` });
  };

  const pending = submissions.filter(s => s.status === "pending").length;
  const reviewed = submissions.filter(s => s.status === "reviewed").length;
  const avgTrainerScore = submissions.filter(s => s.trainerScore !== null).length
    ? Math.round(submissions.filter(s => s.trainerScore !== null).reduce((a, b) => a + (b.trainerScore || 0), 0) / submissions.filter(s => s.trainerScore !== null).length)
    : 0;

  const getScoreColor = (score: number) => score >= 90 ? "text-green-600" : score >= 75 ? "text-sports-blue" : "text-sports-orange";
  const getScoreBg = (score: number) => score >= 90 ? "bg-green-100 border-green-300" : score >= 75 ? "bg-blue-100 border-blue-300" : "bg-orange-100 border-orange-300";

  return (
    <div className="min-h-screen pt-20 bg-muted/30">
      {/* Header */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 hero-gradient">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{trainerName}</h1>
              <p className="text-white/80 flex items-center gap-2"><Star className="w-4 h-4" /> Certified Trainer</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            {[
              { label: "Pending", value: pending },
              { label: "Reviewed", value: reviewed },
              { label: "Avg Score", value: avgTrainerScore },
            ].map(s => (
              <div key={s.label} className="bg-white/20 rounded-xl px-4 py-2 text-center">
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-white/80">{s.label}</div>
              </div>
            ))}
            <Button variant="secondary" size="sm" onClick={() => navigate("/leaderboard")}>
              <BarChart3 className="w-4 h-4 mr-2" /> Leaderboard
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="w-4 h-4" /> Video Reviews
              {pending > 0 && <Badge className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0">{pending}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="athletes" className="flex items-center gap-2">
              <Users className="w-4 h-4" /> Athletes
            </TabsTrigger>
            <TabsTrigger value="certificates" className="flex items-center gap-2">
              <Award className="w-4 h-4" /> Certificates
            </TabsTrigger>
          </TabsList>

          {/* ── Video Reviews Tab ── */}
          <TabsContent value="videos">
            <div className="space-y-4">
              {submissions.map(sub => (
                <Card key={sub.id} className="sports-card">
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Athlete Info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 hero-gradient rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {sub.avatar}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold">{sub.athlete}</p>
                          <p className="text-sm text-muted-foreground">{sub.sport} • {sub.date}</p>
                          <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                            <Video className="w-3 h-3" /> {sub.videoName}
                          </p>
                        </div>
                      </div>

                      {/* AI Score */}
                      <div className={`px-3 py-2 rounded-xl border text-center flex-shrink-0 ${getScoreBg(sub.aiScore)}`}>
                        <div className={`text-xl font-bold ${getScoreColor(sub.aiScore)}`}>{sub.aiScore}</div>
                        <div className="text-xs text-muted-foreground">AI Score</div>
                      </div>

                      {/* Trainer Score */}
                      {sub.trainerScore !== null && (
                        <div className={`px-3 py-2 rounded-xl border text-center flex-shrink-0 ${getScoreBg(sub.trainerScore)}`}>
                          <div className={`text-xl font-bold ${getScoreColor(sub.trainerScore)}`}>{sub.trainerScore}</div>
                          <div className="text-xs text-muted-foreground">Your Score</div>
                        </div>
                      )}

                      {/* Status / Action */}
                      <div className="flex-shrink-0">
                        {sub.status === "pending" ? (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            <Clock className="w-3 h-3 mr-1" /> Pending
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" /> Reviewed
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Feedback display */}
                    {sub.status === "reviewed" && sub.feedback && editingId !== sub.id && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground flex items-start gap-2">
                        <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{sub.feedback}</span>
                      </div>
                    )}

                    {/* Review Form */}
                    {editingId === sub.id ? (
                      <div className="mt-4 space-y-3 border-t pt-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Score (0–100)</label>
                            <Input type="number" min={0} max={100} value={scoreInput} onChange={e => setScoreInput(e.target.value)} placeholder="e.g. 88" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Feedback</label>
                            <Input value={feedbackInput} onChange={e => setFeedbackInput(e.target.value)} placeholder="Brief feedback…" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="hero" onClick={() => handleSubmitReview(sub.id)}>
                            <Send className="w-4 h-4 mr-2" /> Submit Review
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant={sub.status === "pending" ? "hero" : "outline"} onClick={() => handleReview(sub.id)}>
                          <Edit3 className="w-4 h-4 mr-2" />
                          {sub.status === "pending" ? "Review & Score" : "Edit Review"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── Athletes Tab ── */}
          <TabsContent value="athletes">
            <div className="grid md:grid-cols-2 gap-4">
              {[...new Map(submissions.map(s => [s.athlete, s])).values()].map(sub => {
                const athleteVideos = submissions.filter(s => s.athlete === sub.athlete);
                const best = Math.max(...athleteVideos.filter(v => v.trainerScore !== null).map(v => v.trainerScore || 0), 0);
                return (
                  <Card key={sub.athlete} className="sports-card">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 hero-gradient rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {sub.avatar}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{sub.athlete}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Trophy className="w-3 h-3" /> {sub.sport}
                          </p>
                        </div>
                        {best > 0 && (
                          <div className={`px-3 py-2 rounded-xl border text-center ${getScoreBg(best)}`}>
                            <div className={`text-xl font-bold ${getScoreColor(best)}`}>{best}</div>
                            <div className="text-xs text-muted-foreground">Best</div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Videos Submitted</span>
                          <span className="font-medium">{athleteVideos.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Reviewed</span>
                          <span className="font-medium">{athleteVideos.filter(v => v.status === "reviewed").length}</span>
                        </div>
                        {best > 0 && <Progress value={best} className="h-2 mt-2" />}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ── Certificates Tab ── */}
          <TabsContent value="certificates">
            <Card className="sports-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-sports-orange" /> Certificate Verification Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {certRequests.map(cert => (
                  <div key={cert.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                    <div className="w-10 h-10 bg-sports-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-sports-orange" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{cert.certName}</p>
                      <p className="text-xs text-muted-foreground">
                        <User className="w-3 h-3 inline mr-1" />{cert.athlete} • {cert.issuer} • {cert.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {cert.status === "pending" ? (
                        <>
                          <Button size="sm" variant="default" onClick={() => handleCertAction(cert.id, "approved")}>
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleCertAction(cert.id, "rejected")}>
                            Reject
                          </Button>
                        </>
                      ) : (
                        <Badge className={cert.status === "approved"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-red-100 text-red-800 border-red-200"}>
                          {cert.status === "approved"
                            ? <><CheckCircle className="w-3 h-3 mr-1" /> Approved</>
                            : "Rejected"}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TrainerDashboard;
