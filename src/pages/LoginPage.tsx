import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Trophy, Users, Mail, Lock, User, Phone,
  Eye, EyeOff, ArrowRight, Dumbbell
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Role = "athlete" | "trainer";
type Mode = "login" | "register";

const LoginPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("athlete");
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    password: "", sport: "", specialization: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast({ title: "Missing fields", description: "Email and password are required.", variant: "destructive" });
      return;
    }
    if (mode === "register" && !form.name) {
      toast({ title: "Missing name", description: "Please enter your full name.", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              name: form.name,
              phone: form.phone,
              role: role,
              sport: form.sport,
              specialization: form.specialization,
            }
          }
        });

        if (error) throw error;

        toast({
          title: "Account Created! 🎉",
          description: "Please check your email to verify your account, or sign in if email verification is disabled."
        });
        
        // Optionally switch to login mode automatically
        setMode("login");

      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back! 🎉",
          description: "Successfully signed in."
        });
        
        // Retrieve role from user metadata to navigate properly
        const userRole = data.user?.user_metadata?.role || role;
        navigate(userRole === "athlete" ? "/athlete-dashboard" : "/trainer-dashboard");
      }
    } catch (err: any) {
      toast({ 
        title: "Authentication Failed", 
        description: err.message || "An unknown error occurred", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center bg-muted/30 px-4 py-8">
      <div className="w-full max-w-md">

        {/* Page Title */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 hero-gradient rounded-2xl flex items-center justify-center shadow-lg">
              <Trophy className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">SportsAI</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login" ? "Sign in to your account" : "Create your account"}
          </p>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {(["athlete", "trainer"] as Role[]).map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                role === r
                  ? "border-primary bg-primary/10 shadow-md"
                  : "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
              }`}
            >
              {r === "athlete"
                ? <Trophy className={`w-7 h-7 ${role === r ? "text-primary" : "text-muted-foreground"}`} />
                : <Dumbbell className={`w-7 h-7 ${role === r ? "text-primary" : "text-muted-foreground"}`} />
              }
              <span className={`font-semibold capitalize text-sm ${role === r ? "text-primary" : "text-muted-foreground"}`}>
                {r === "athlete" ? "Athlete" : "Trainer"}
              </span>
              <span className={`text-xs ${role === r ? "text-primary/70" : "text-muted-foreground/70"}`}>
                {r === "athlete" ? "Upload & compete" : "Review & coach"}
              </span>
            </button>
          ))}
        </div>

        <Card className="sports-card">
          <CardHeader className="text-center pb-2 pt-5">
            <CardTitle className="text-xl">
              {mode === "login" ? "Sign In" : "Create Account"}
            </CardTitle>
            <Badge className="sports-badge mx-auto mt-1 capitalize w-fit">
              {role === "athlete" ? <Trophy className="w-3 h-3 mr-1" /> : <Users className="w-3 h-3 mr-1" />}
              {role}
            </Badge>
          </CardHeader>

          <CardContent className="pt-2">
            <form onSubmit={handleSubmit} className="space-y-3">

              {/* Name - register only */}
              {mode === "register" && (
                <div className="space-y-1">
                  <Label htmlFor="name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name" name="name"
                      placeholder="Your full name"
                      className="pl-9"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email" name="email" type="email"
                    placeholder="you@example.com"
                    className="pl-9"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Phone - register only */}
              {mode === "register" && (
                <div className="space-y-1">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone" name="phone"
                      placeholder="+91 9876543210"
                      className="pl-9"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              {/* Sport - athlete register only */}
              {mode === "register" && role === "athlete" && (
                <div className="space-y-1">
                  <Label htmlFor="sport">Your Sport</Label>
                  <Input
                    id="sport" name="sport"
                    placeholder="e.g. Cricket, Football, Badminton"
                    value={form.sport}
                    onChange={handleChange}
                  />
                </div>
              )}

              {/* Specialization - trainer register only */}
              {mode === "register" && role === "trainer" && (
                <div className="space-y-1">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization" name="specialization"
                    placeholder="e.g. Strength & Conditioning"
                    value={form.specialization}
                    onChange={handleChange}
                  />
                </div>
              )}

              {/* Password */}
              <div className="space-y-1">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password" name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-9 pr-9"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="hero"
                className="w-full group mt-1"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    {mode === "login" ? "Signing in…" : "Creating account…"}
                  </span>
                ) : (
                  <>
                    {mode === "login" ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <Separator className="my-4" />

            <p className="text-center text-sm text-muted-foreground">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="text-primary font-semibold hover:underline"
              >
                {mode === "login" ? "Register here" : "Sign In"}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
