import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Menu, X, Trophy, Users, BarChart3, Info,
  Mail, Sun, Moon, User, LogOut, Dumbbell, Home
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  
  const { user, signOut } = useAuth();

  const isLoggedIn = !!user;
  const userRole = user?.user_metadata?.role || "athlete";
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || "Athlete";

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Logged out", description: "See you next time!" });
    setIsOpen(false);
    navigate("/");
  };

  const profilePath = userRole === "athlete" ? "/athlete-dashboard" : "/trainer-dashboard";

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Features", path: "/features", icon: BarChart3 },
    { name: "Community", path: "/community", icon: Users },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "About", path: "/about", icon: Info },
    { name: "Contact", path: "/contact", icon: Mail },
  ];

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 hero-gradient rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground">SportsAI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button variant={isActive ? "default" : "ghost"} size="sm" className="flex items-center gap-1.5">
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme toggle */}
            <Button
              variant="ghost" size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            {isLoggedIn ? (
              <>
                {/* Profile button */}
                <Link to={profilePath}>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    {userRole === "athlete"
                      ? <Trophy className="w-4 h-4 text-primary" />
                      : <Dumbbell className="w-4 h-4 text-primary" />
                    }
                    <span className="max-w-[100px] truncate">{userName}</span>
                    <Badge className="text-xs px-1.5 py-0 capitalize bg-primary/10 text-primary border-primary/20">
                      {userRole}
                    </Badge>
                  </Button>
                </Link>
                {/* Logout */}
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link to="/login">
                  <Button variant="hero" size="sm">Join Now</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile right */}
          <div className="md:hidden flex items-center gap-1">
            <Button
              variant="ghost" size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                    <Button variant={isActive ? "default" : "ghost"} size="sm" className="w-full justify-start gap-2">
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}

              <div className="pt-3 border-t border-border mt-2">
                {isLoggedIn ? (
                  <>
                    <Link to={profilePath} onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full justify-start gap-2 mb-2">
                        <User className="w-4 h-4" />
                        {userName}
                        <Badge className="ml-auto text-xs capitalize">{userRole}</Badge>
                      </Button>
                    </Link>
                    <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:text-destructive" onClick={handleLogout}>
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">Login</Button>
                    </Link>
                    <Link to="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                      <Button variant="hero" className="w-full">Join Now</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
