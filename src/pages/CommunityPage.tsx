import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Heart, MessageCircle, Share2, Play, Trophy,
  Video, Filter, Search, Star, X, Send, Eye, ThumbsUp, Upload
} from "lucide-react";
import { useState } from "react";

import profile1 from "@/assets/profile1.jpg";
import profile2 from "@/assets/profile2.jpg";
import profile3 from "@/assets/profile3.jpg";
import profile4 from "@/assets/profile4.jpg";
import profile5 from "@/assets/profile5.jpg";

const athletes = [
  { id: 1, name: "Arjun Sharma", sport: "Cricket", location: "Mumbai, Maharashtra", rating: 4.8, avatar: profile1, videos: 15, followers: 2340 },
  { id: 2, name: "Priya Patel", sport: "Basketball", location: "Ahmedabad, Gujarat", rating: 4.9, avatar: profile2, videos: 23, followers: 3450 },
  { id: 3, name: "Vikram Singh", sport: "Football", location: "Delhi, NCR", rating: 4.7, avatar: profile3, videos: 18, followers: 1890 },
  { id: 4, name: "Anita Reddy", sport: "Badminton", location: "Hyderabad, Telangana", rating: 4.6, avatar: profile4, videos: 12, followers: 1520 },
  { id: 5, name: "Raj Kumar", sport: "Tennis", location: "Bangalore, Karnataka", rating: 4.5, avatar: profile5, videos: 8, followers: 890 },
];

const communityPosts = [
  {
    id: 1,
    author: "Arjun Sharma",
    avatar: profile1,
    sport: "Cricket",
    title: "Perfect Cover Drive Technique – Virat Kohli Style",
    description: "Breaking down the mechanics of a perfect cover drive shot. Watch how weight transfer, head position, and follow-through create the ideal stroke.",
    youtubeId: "tBCuMBxCPOA",
    likes: 234, comments: 45, views: 12400, duration: "2:30", category: "Technique",
    postedAt: "2 hours ago",
    commentList: [
      { user: "Rohit M", text: "Amazing breakdown! Really helped my batting.", time: "1h ago" },
      { user: "Sneha K", text: "The slow-motion analysis is 🔥", time: "45m ago" },
      { user: "Dev P", text: "Can you do one for pull shot next?", time: "20m ago" },
    ]
  },
  {
    id: 2,
    author: "Priya Patel",
    avatar: profile2,
    sport: "Basketball",
    title: "Three-Point Shooting Drills – NBA Training",
    description: "5 essential drills to improve your three-point accuracy. Used by NBA players to build muscle memory and shooting consistency.",
    youtubeId: "6kJ2XFSev0o",
    likes: 189, comments: 32, views: 9800, duration: "4:15", category: "Training",
    postedAt: "5 hours ago",
    commentList: [
      { user: "Karan S", text: "My shooting % went up after this!", time: "3h ago" },
      { user: "Meera T", text: "Best basketball drill video I've seen.", time: "2h ago" },
      { user: "Arun B", text: "The form correction tips are gold.", time: "1h ago" },
    ]
  },
  {
    id: 3,
    author: "Vikram Singh",
    avatar: profile3,
    sport: "Football",
    title: "Goalkeeper Reflexes Training – Pro Level",
    description: "Advanced reflexes training for goalkeepers. Reaction time drills used by professional goalkeepers to improve shot-stopping ability.",
    youtubeId: "aBcD1234xyz",
    likes: 156, comments: 28, views: 7600, duration: "3:45", category: "Skills",
    postedAt: "1 day ago",
    commentList: [
      { user: "Suresh N", text: "These drills are intense but effective!", time: "20h ago" },
      { user: "Pooja R", text: "My coach recommended this exact routine.", time: "15h ago" },
      { user: "Amit V", text: "The lateral movement drill is 💯", time: "8h ago" },
    ]
  },
  {
    id: 4,
    author: "Anita Reddy",
    avatar: profile4,
    sport: "Badminton",
    title: "Smash Technique Breakdown – PV Sindhu Style",
    description: "Master the perfect badminton smash. Wrist snap, jump timing, and racket angle explained with slow-motion analysis.",
    youtubeId: "dQw4w9WgXcQ",
    likes: 203, comments: 51, views: 15200, duration: "2:15", category: "Technique",
    postedAt: "2 days ago",
    commentList: [
      { user: "Lakshmi P", text: "Finally understood the wrist snap!", time: "1d ago" },
      { user: "Ravi C", text: "PV Sindhu comparison is spot on.", time: "22h ago" },
      { user: "Nisha M", text: "My smash speed increased by 20%!", time: "10h ago" },
    ]
  },
  {
    id: 5,
    author: "Raj Kumar",
    avatar: profile5,
    sport: "Tennis",
    title: "Serve Technique – Ace Every Time",
    description: "Step-by-step guide to a powerful tennis serve. Ball toss, racket drop, and contact point explained for beginners and intermediate players.",
    youtubeId: "ScMzIvxBSi4",
    likes: 178, comments: 39, views: 11300, duration: "5:10", category: "Training",
    postedAt: "3 days ago",
    commentList: [
      { user: "Deepak J", text: "My serve is finally consistent!", time: "2d ago" },
      { user: "Kavya S", text: "The ball toss tip changed everything.", time: "1d ago" },
      { user: "Nikhil R", text: "Best serve tutorial on the internet.", time: "12h ago" },
    ]
  },
  {
    id: 6,
    author: "Arjun Sharma",
    avatar: profile1,
    sport: "Cricket",
    title: "Fast Bowling Speed Training – 140+ kmph",
    description: "Strength and conditioning drills to bowl faster. Run-up mechanics, hip rotation, and wrist position for maximum pace.",
    youtubeId: "9bZkp7q19f0",
    likes: 312, comments: 67, views: 21000, duration: "6:20", category: "Fitness",
    postedAt: "4 days ago",
    commentList: [
      { user: "Sanjay K", text: "Added 8 kmph to my bowling speed!", time: "3d ago" },
      { user: "Preethi A", text: "The hip rotation drill is a game changer.", time: "2d ago" },
      { user: "Mohan L", text: "Please make one for swing bowling too!", time: "1d ago" },
    ]
  },
  {
    id: 7,
    author: "Rahul Verma",
    avatar: profile2,
    sport: "Football",
    title: "Dribbling Skills – Messi Footwork Drills",
    description: "Master ball control and dribbling techniques used by Lionel Messi. Close ball control, step-over moves, and acceleration drills.",
    youtubeId: "jNQXAC9IVRw",
    likes: 245, comments: 38, views: 15600, duration: "4:45", category: "Skills",
    postedAt: "5 days ago",
    commentList: [
      { user: "Amit S", text: "My ball control improved dramatically!", time: "4d ago" },
      { user: "Priya M", text: "The step-over variations are amazing.", time: "3d ago" },
      { user: "Vikram R", text: "Perfect for youth players.", time: "2d ago" },
    ]
  },
  {
    id: 8,
    author: "Sneha Gupta",
    avatar: profile3,
    sport: "Basketball",
    title: "Defensive Footwork – NBA Pro Techniques",
    description: "Learn defensive positioning, lateral quickness, and help defense. Essential footwork drills used by NBA defenders.",
    youtubeId: "kNQXAC9IVRw",
    likes: 198, comments: 29, views: 12300, duration: "5:30", category: "Skills",
    postedAt: "6 days ago",
    commentList: [
      { user: "Rohan K", text: "Defense is my weak point, this helped!", time: "5d ago" },
      { user: "Meera P", text: "The slide drills are perfect.", time: "4d ago" },
      { user: "Arjun T", text: "Much better at staying in front.", time: "3d ago" },
    ]
  },
  {
    id: 9,
    author: "Karan Singh",
    avatar: profile4,
    sport: "Badminton",
    title: "Drop Shot Mastery – Saina Nehwal Style",
    description: "Perfect your drop shots with precision and deception. Learn the grip, swing path, and timing for effective drop shots.",
    youtubeId: "lNQXAC9IVRw",
    likes: 167, comments: 24, views: 8900, duration: "3:20", category: "Technique",
    postedAt: "1 week ago",
    commentList: [
      { user: "Anjali R", text: "My drop shots are now deadly!", time: "6d ago" },
      { user: "Vivek M", text: "The deception techniques are gold.", time: "5d ago" },
      { user: "Priya S", text: "Much better control now.", time: "4d ago" },
    ]
  },
  {
    id: 10,
    author: "Neha Patel",
    avatar: profile5,
    sport: "Tennis",
    title: "Forehand Groundstroke – Federer Technique",
    description: "Master the modern forehand with proper footwork, swing path, and follow-through. Step-by-step breakdown of Roger Federer's forehand.",
    youtubeId: "mNQXAC9IVRw",
    likes: 289, comments: 45, views: 18700, duration: "4:10", category: "Technique",
    postedAt: "1 week ago",
    commentList: [
      { user: "Rahul K", text: "My forehand consistency improved 50%!", time: "6d ago" },
      { user: "Sneha M", text: "The footwork explanation is perfect.", time: "5d ago" },
      { user: "Amit P", text: "Finally got the swing path right.", time: "4d ago" },
    ]
  },
  {
    id: 11,
    author: "Vikram Joshi",
    avatar: profile1,
    sport: "Cricket",
    title: "Wicketkeeping Drills – MSD Style",
    description: "Essential wicketkeeping techniques including stance, glove work, and catching positions. Drills used by Mahendra Singh Dhoni.",
    youtubeId: "nNQXAC9IVRw",
    likes: 223, comments: 31, views: 14200, duration: "5:15", category: "Skills",
    postedAt: "1 week ago",
    commentList: [
      { user: "Rohit S", text: "My keeping has improved so much!", time: "6d ago" },
      { user: "Priya K", text: "The glove positioning tips are great.", time: "5d ago" },
      { user: "Arjun M", text: "Much better at catching edges.", time: "4d ago" },
    ]
  },
  {
    id: 12,
    author: "Meera Reddy",
    avatar: profile2,
    sport: "Football",
    title: "Free Kick Techniques – Cristiano Ronaldo",
    description: "Learn to curl and dip free kicks like CR7. Ball placement, approach angle, and contact techniques for spectacular free kicks.",
    youtubeId: "oNQXAC9IVRw",
    likes: 334, comments: 52, views: 22300, duration: "6:00", category: "Technique",
    postedAt: "1 week ago",
    commentList: [
      { user: "Suresh K", text: "My free kicks are finally curling!", time: "6d ago" },
      { user: "Anita M", text: "The approach angle makes all the difference.", time: "5d ago" },
      { user: "Vikram P", text: "Added 10 meters to my free kick range.", time: "4d ago" },
    ]
  },
  {
    id: 13,
    author: "Arun Kumar",
    avatar: profile3,
    sport: "Basketball",
    title: "Ball Handling Drills – Kyrie Irving Style",
    description: "Advanced dribbling and ball handling drills. Cross-over moves, behind-back dribbles, and combo moves for elite ball control.",
    youtubeId: "pNQXAC9IVRw",
    likes: 256, comments: 41, views: 16800, duration: "4:50", category: "Skills",
    postedAt: "2 weeks ago",
    commentList: [
      { user: "Rahul S", text: "My handles are so much smoother now!", time: "12d ago" },
      { user: "Priya R", text: "The combo moves are challenging but fun.", time: "11d ago" },
      { user: "Karan M", text: "Finally mastered the cross-over.", time: "10d ago" },
    ]
  },
  {
    id: 14,
    author: "Pooja Sharma",
    avatar: profile4,
    sport: "Badminton",
    title: "Footwork Patterns – Professional Training",
    description: "Master badminton court movement with proper footwork patterns. Split-step timing, lunges, and recovery techniques.",
    youtubeId: "qNQXAC9IVRw",
    likes: 189, comments: 27, views: 11200, duration: "3:40", category: "Training",
    postedAt: "2 weeks ago",
    commentList: [
      { user: "Vivek K", text: "My court coverage improved dramatically!", time: "12d ago" },
      { user: "Sneha P", text: "The split-step timing is crucial.", time: "11d ago" },
      { user: "Arun R", text: "Much better lunges and recovery.", time: "10d ago" },
    ]
  },
  {
    id: 15,
    author: "Ravi Singh",
    avatar: profile5,
    sport: "Tennis",
    title: "Backhand Slice – Professional Technique",
    description: "Learn the defensive backhand slice for control and variety. Grip changes, swing path, and when to use the slice effectively.",
    youtubeId: "rNQXAC9IVRw",
    likes: 201, comments: 33, views: 13400, duration: "3:55", category: "Technique",
    postedAt: "2 weeks ago",
    commentList: [
      { user: "Neha K", text: "My backhand defense is much stronger!", time: "12d ago" },
      { user: "Vikram S", text: "The grip change explanation is perfect.", time: "11d ago" },
      { user: "Meera P", text: "Added variety to my game.", time: "10d ago" },
    ]
  },
];

const categories = ["All", "Technique", "Training", "Skills", "Competition", "Fitness"];
const sports = ["All Sports", "Cricket", "Football", "Basketball", "Badminton", "Tennis"];

const CommunityPage = () => {
  const [selectedSport, setSelectedSport] = useState("All Sports");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [selectedPost, setSelectedPost] = useState<typeof communityPosts[0] | null>(null);
  const [newComment, setNewComment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [comments, setComments] = useState<Record<number, { user: string; text: string; time: string }[]>>(
    Object.fromEntries(communityPosts.map(p => [p.id, p.commentList]))
  );
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    youtubeUrl: "",
    sport: "",
    category: ""
  });
  const [posts, setPosts] = useState(communityPosts);

  const handleLike = (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedPosts(prev => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
  };

  const handleComment = (postId: number) => {
    if (!newComment.trim()) return;
    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), { user: "You", text: newComment, time: "Just now" }]
    }));
    setNewComment("");
  };

  const handleUpload = () => {
    if (!uploadForm.title.trim() || !uploadForm.youtubeUrl.trim() || !uploadForm.sport || !uploadForm.category) {
      return;
    }

    // Extract YouTube ID from URL
    const youtubeId = uploadForm.youtubeUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    if (!youtubeId) {
      alert("Please enter a valid YouTube URL");
      return;
    }

    const newPost = {
      id: Math.max(...posts.map(p => p.id)) + 1,
      author: "You",
      avatar: profile1, // Default avatar
      sport: uploadForm.sport,
      title: uploadForm.title,
      description: uploadForm.description,
      youtubeId: youtubeId,
      likes: 0,
      comments: 0,
      views: 0,
      duration: "0:00", // Would need to be fetched from YouTube API
      category: uploadForm.category,
      postedAt: "Just now",
      commentList: []
    };

    // Add new post to the beginning of the list
    setPosts(prev => [newPost, ...prev]);
    setComments(prev => ({ ...prev, [newPost.id]: [] }));

    // Reset form and close modal
    setUploadForm({ title: "", description: "", youtubeUrl: "", sport: "", category: "" });
    setIsUploadOpen(false);
  };

  const filteredPosts = posts.filter(post =>
    (selectedSport === "All Sports" || post.sport === selectedSport) &&
    (selectedCategory === "All" || post.category === selectedCategory) &&
    (searchQuery === "" || post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen pt-20 bg-muted/30">
      {/* Hero */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Sports <span className="hero-gradient bg-clip-text text-transparent">Community</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Watch real training videos, learn techniques, and connect with athletes across India
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-4 gap-8">

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sports-card">
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-sports-blue" /> Top Athletes
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {athletes.map((athlete) => (
                  <div key={athlete.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={athlete.avatar} />
                      <AvatarFallback>{athlete.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{athlete.name}</h4>
                      <p className="text-xs text-muted-foreground">{athlete.sport} • {athlete.location.split(',')[0]}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span>{athlete.rating}</span>
                        <span>•</span>
                        <span>{athlete.followers.toLocaleString()} followers</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </div>

            <div className="sports-card">
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Filter className="w-5 h-5 text-sports-green" /> Filters
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Sport</label>
                  <div className="flex flex-wrap gap-2">
                    {sports.map(sport => (
                      <Badge key={sport} variant={sport === selectedSport ? "default" : "outline"}
                        className="cursor-pointer" onClick={() => setSelectedSport(sport)}>
                        {sport}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <Badge key={cat} variant={cat === selectedCategory ? "default" : "outline"}
                        className="cursor-pointer" onClick={() => setSelectedCategory(cat)}>
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input type="text" placeholder="Search videos, athletes..."
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                  <Button variant="hero">
                    <Upload className="w-4 h-4 mr-2" /> Upload Video
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Share Your Training Video</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Video Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter video title..."
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="youtubeUrl">YouTube URL</Label>
                      <Input
                        id="youtubeUrl"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={uploadForm.youtubeUrl}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sport">Sport</Label>
                      <Select value={uploadForm.sport} onValueChange={(value) => setUploadForm(prev => ({ ...prev, sport: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sport" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cricket">Cricket</SelectItem>
                          <SelectItem value="Football">Football</SelectItem>
                          <SelectItem value="Basketball">Basketball</SelectItem>
                          <SelectItem value="Badminton">Badminton</SelectItem>
                          <SelectItem value="Tennis">Tennis</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={uploadForm.category} onValueChange={(value) => setUploadForm(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Technique">Technique</SelectItem>
                          <SelectItem value="Training">Training</SelectItem>
                          <SelectItem value="Skills">Skills</SelectItem>
                          <SelectItem value="Fitness">Fitness</SelectItem>
                          <SelectItem value="Competition">Competition</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your video..."
                        value={uploadForm.description}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleUpload}>
                        Upload Video
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {filteredPosts.map(post => (
                <Card key={post.id} className="sports-card group cursor-pointer overflow-hidden"
                  onClick={() => setSelectedPost(post)}>
                  {/* YouTube Thumbnail */}
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={`https://img.youtube.com/vi/${post.youtubeId}/hqdefault.jpg`}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-6 h-6 text-white fill-white ml-1" />
                      </div>
                    </div>
                    <Badge className="absolute top-3 left-3 bg-black/70 text-white border-0">{post.category}</Badge>
                    <span className="absolute bottom-3 right-3 text-white text-xs bg-black/70 px-2 py-1 rounded font-medium">
                      {post.duration}
                    </span>
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-xs bg-black/70 px-2 py-1 rounded">
                      <Eye className="w-3 h-3" /> {post.views.toLocaleString()}
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={post.avatar} />
                        <AvatarFallback>{post.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-sm">{post.author}</h4>
                        <p className="text-xs text-muted-foreground">{post.sport} • {post.postedAt}</p>
                      </div>
                    </div>
                    <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{post.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <button className={`flex items-center gap-1 transition-colors ${likedPosts.has(post.id) ? 'text-red-500' : 'hover:text-red-500'}`}
                        onClick={e => handleLike(post.id, e)}>
                        <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                        {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                      </button>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {comments[post.id]?.length || 0}
                      </span>
                      <button className="flex items-center gap-1 hover:text-primary transition-colors ml-auto"
                        onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(window.location.href); }}>
                        <Share2 className="w-4 h-4" /> Share
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedPost(null)}>
          <div className="bg-background rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}>
            {/* YouTube Embed */}
            <div className="relative aspect-video bg-black rounded-t-2xl overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${selectedPost.youtubeId}?autoplay=1&rel=0`}
                title={selectedPost.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
              <button onClick={() => setSelectedPost(null)}
                className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white rounded-full p-1.5 transition-colors z-10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Title & Meta */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold mb-1">{selectedPost.title}</h2>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{selectedPost.views.toLocaleString()} views</span>
                    <span>•</span>
                    <span>{selectedPost.postedAt}</span>
                    <Badge variant="outline">{selectedPost.category}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors text-sm font-medium ${likedPosts.has(selectedPost.id) ? 'bg-red-50 border-red-300 text-red-500' : 'hover:bg-muted'}`}
                    onClick={e => handleLike(selectedPost.id, e)}>
                    <ThumbsUp className={`w-4 h-4 ${likedPosts.has(selectedPost.id) ? 'fill-current' : ''}`} />
                    {selectedPost.likes + (likedPosts.has(selectedPost.id) ? 1 : 0)}
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-full border hover:bg-muted transition-colors text-sm font-medium">
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </div>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 p-4 bg-muted/40 rounded-xl mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedPost.avatar} />
                  <AvatarFallback>{selectedPost.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold">{selectedPost.author}</h4>
                  <p className="text-sm text-muted-foreground">{selectedPost.sport} Athlete</p>
                </div>
                <Button variant="outline" size="sm">Follow</Button>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{selectedPost.description}</p>

              {/* Comments */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Comments ({comments[selectedPost.id]?.length || 0})
                </h3>
                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                  {(comments[selectedPost.id] || []).map((c, i) => (
                    <div key={i} className="flex gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="text-xs">{c.user[0]}</AvatarFallback>
                      </Avatar>
                      <div className="bg-muted/50 rounded-xl px-3 py-2 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{c.user}</span>
                          <span className="text-xs text-muted-foreground">{c.time}</span>
                        </div>
                        <p className="text-sm">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Add Comment */}
                <div className="flex gap-2">
                  <input type="text" placeholder="Add a comment..."
                    value={newComment} onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleComment(selectedPost.id)}
                    className="flex-1 px-4 py-2 border border-input rounded-full bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <Button size="sm" className="rounded-full px-4" onClick={() => handleComment(selectedPost.id)}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
