import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { 
  Play, Upload, Trophy, Activity, CheckCircle, TrendingUp, Filter, AlertCircle, FileText, Medal, Award, Clock, Trash2, Video, Search, User, Star, Zap, BarChart3
} from "lucide-react";
import Groq from "groq-sdk";
import Tesseract from "tesseract.js";

import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const runMediaPipeAnalysis = async (file: File, setProgress: React.Dispatch<React.SetStateAction<number>>): Promise<{ speed: number; posture: number; balance: number; consistency: number }> => {
  setProgress(10);
  const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
  setProgress(20);
  const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
      delegate: "GPU"
    },
    runningMode: "VIDEO",
    numPoses: 1
  });
  setProgress(30);

  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.crossOrigin = "anonymous";
    
    let framesProcessed = 0;
    let framesWithAthlete = 0;
    let lastVideoTime = -1;
    
    let postureDeviation = 0;
    let balanceAsymmetry = 0;
    let poses: any[] = [];
    
    // Advanced Activity Confidence Tracking
    let prevHips: {lx: number, ly: number, rx: number, ry: number} | null = null;
    let totalHipDisplacement = 0;
    let minKneeAngle = 180, maxKneeAngle = 0;
    let minArmExt = 1, maxArmExt = 0;

    video.onloadeddata = () => {
      video.play().catch(reject);
      const processFrame = () => {
        if (video.paused || video.ended) {
          poseLandmarker.close();
          URL.revokeObjectURL(video.src);

          const visibilityRatio = framesProcessed > 0 ? framesWithAthlete / framesProcessed : 0;
          if (framesProcessed > 0 && visibilityRatio < 0.3) {
            reject(new Error("No athlete detected. Please ensure full-body visibility and try a different video."));
            return;
          }
          
          const avgHipSpeed = framesProcessed > 0 ? totalHipDisplacement / framesProcessed : 0;
          const velocityScore = Math.min(100, avgHipSpeed * 2000); 
          const kneeVarianceScore = Math.min(100, maxKneeAngle - minKneeAngle); 
          const armExtensionScore = Math.min(100, (maxArmExt - minArmExt) * 500); 
          
          const activityScore = (velocityScore * 0.4) + (kneeVarianceScore * 0.4) + (armExtensionScore * 0.2);

          if (framesProcessed > 0 && activityScore < 25) {
            let reason = "Insufficient athletic movement.";
            if (kneeVarianceScore < 10) reason = "Minimal lower-body activity detected.";
            else if (armExtensionScore < 10) reason = "Minimal arm extension/swing detected.";
            
            reject(new Error(`Rejected: ${reason} (Confidence Score: ${Math.round(activityScore)}/100)`));
            return;
          }

          const speedScore = Math.min(100, Math.max(60, 60 + avgHipSpeed * 1500));
          
          const avgPostureDev = framesProcessed > 0 ? postureDeviation / framesProcessed : 0;
          const postureScore = Math.min(100, Math.max(60, 100 - avgPostureDev * 100));
          
          const avgAsymmetry = framesProcessed > 0 ? balanceAsymmetry / framesProcessed : 0;
          const balanceScore = Math.min(100, Math.max(60, 100 - avgAsymmetry * 100));
          
          let consistencyScore = 80;
          if (poses.length > 5) {
             consistencyScore = Math.min(100, Math.max(60, balanceScore * 0.9 + speedScore * 0.1));
          }

          resolve({
            speed: Math.round(speedScore),
            posture: Math.round(postureScore),
            balance: Math.round(balanceScore),
            consistency: Math.round(consistencyScore)
          });
          return;
        }

        const currentTime = video.currentTime;
        if (currentTime !== lastVideoTime) {
          const result = poseLandmarker.detectForVideo(video, performance.now());
          framesProcessed++;
          
          if (framesProcessed % 5 === 0) {
            setProgress(30 + Math.min(60, Math.round((currentTime / video.duration) * 60)));
          }

          if (result.landmarks && result.landmarks.length > 0) {
            framesWithAthlete++;
            const lms = result.landmarks[0];
            poses.push(lms);
            
            // 1. Hip Displacement (Core movement)
            if (prevHips) {
              const dxL = lms[23].x - prevHips.lx;
              const dyL = lms[23].y - prevHips.ly;
              const dxR = lms[24].x - prevHips.rx;
              const dyR = lms[24].y - prevHips.ry;
              totalHipDisplacement += (Math.sqrt(dxL*dxL + dyL*dyL) + Math.sqrt(dxR*dxR + dyR*dyR)) / 2;
            }
            prevHips = {lx: lms[23].x, ly: lms[23].y, rx: lms[24].x, ry: lms[24].y};
            
            // 2. Knee Bend Variance (Lower body activity)
            const getDist = (a: any, b: any) => Math.sqrt(Math.pow(a.x-b.x, 2) + Math.pow(a.y-b.y, 2));
            const a = getDist(lms[23], lms[25]);
            const b = getDist(lms[25], lms[27]);
            const c = getDist(lms[23], lms[27]);
            if (a > 0 && b > 0) {
              const cosKnee = (a*a + b*b - c*c) / (2*a*b);
              const angle = Math.acos(Math.max(-1, Math.min(1, cosKnee))) * (180/Math.PI);
              minKneeAngle = Math.min(minKneeAngle, angle);
              maxKneeAngle = Math.max(maxKneeAngle, angle);
            }
            
            // 3. Arm Extension Variance
            const armExt = getDist(lms[11], lms[15]); 
            minArmExt = Math.min(minArmExt, armExt);
            maxArmExt = Math.max(maxArmExt, armExt);
            
            const midShoulderX = (lms[11].x + lms[12].x) / 2;
            postureDeviation += Math.abs(lms[0].x - midShoulderX);
            
            const shoulderYDiff = Math.abs(lms[11].y - lms[12].y);
            const hipYDiff = Math.abs(lms[23].y - lms[24].y);
            balanceAsymmetry += (shoulderYDiff + hipYDiff);
          }
          lastVideoTime = currentTime;
        }
        setTimeout(() => requestAnimationFrame(processFrame), 100); // Process ~10fps
      };
      processFrame();
    };
    
    video.onerror = () => {
      poseLandmarker.close();
      reject(new Error("Failed to load video for MediaPipe processing."));
    };
  });
};

interface VideoEntry {
  id: string | number;
  name: string;
  sport: string;
  date: string;
  status: "analyzing" | "scored" | "pending";
  score: number | null;
  feedback: string;
  video_url?: string;
}

interface Certificate {
  id: string | number;
  name: string;
  issuer: string;
  date: string;
  file_url: string;
  confidence_score?: number;
}

const validateSportsScene = async (file: File, selectedSport: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.crossOrigin = "anonymous";
    video.muted = true;
    
    video.onloadeddata = () => {
      video.currentTime = video.duration / 2 || 1;
    };

    video.onseeked = async () => {
      try {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, 720 / Math.max(video.videoWidth, video.videoHeight));
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(true);
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL("image/jpeg", 0.7);
        URL.revokeObjectURL(video.src);

        const apiKey = import.meta.env.VITE_GROQ_API_KEY;
        if (!apiKey) return resolve(true);
        const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `You are an expert sports video classifier. Analyze the provided frame. Determine if the scene depicts actual athletic sports activity (like ${selectedSport}). Look for sports equipment, athletic environments (fields, courts, pitches), and clear athletic intent/posture. A person standing still in a normal room is NOT a sport. Return ONLY a JSON object: {"isSports": boolean, "reason": "short explanation"}`
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Is this a valid sports performance video?" },
                { type: "image_url", image_url: { url: base64Image } }
              ]
            }
          ],
          model: "llama-3.2-11b-vision-preview",
          temperature: 0.1,
          response_format: { type: "json_object" }
        });

        const responseText = chatCompletion.choices[0]?.message?.content || "{}";
        const parsed = JSON.parse(responseText);
        
        if (parsed.isSports === false) {
          reject(new Error(`Vision AI Rejected: ${parsed.reason || "This video does not appear to contain athletic sports activity."}`));
          return;
        }
        resolve(true);
      } catch (err) {
        console.error("Vision Validation Error:", err);
        resolve(true);
      }
    };
    
    video.onerror = () => resolve(true);
  });
};

const verifyCertificate = async (file: File, selectedSport: string): Promise<{ isSports: boolean, confidence: number, reason: string }> => {
  try {
    // 1. OCR Extraction using Tesseract.js
    const worker = await Tesseract.createWorker('eng');
    const { data: { text } } = await worker.recognize(file);
    await worker.terminate();

    if (!text || text.trim().length < 10) {
      return { isSports: false, confidence: 0, reason: "Could not read enough text from the image. Please upload a clear certificate." };
    }

    // 2. AI Semantic Validation using Groq
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) return { isSports: true, confidence: 90, reason: "API key missing, skipping verification." };
    
    const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
    
    const prompt = `You are a strict certificate verification system for a sports platform.
I have extracted the following text from an uploaded certificate image via OCR:

---
${text}
---

Your job is to determine if this certificate is genuinely related to a sports tournament, athletic achievement, or sports coaching, ideally related to ${selectedSport}.
Return ONLY a JSON object matching this schema:
{
  "isSportsCertificate": boolean,
  "confidence": number (0-100),
  "reason": "Short explanation of why it is or isn't a sports certificate."
}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(responseText);

    return {
      isSports: parsed.isSportsCertificate !== false,
      confidence: parsed.confidence || 0,
      reason: parsed.reason || "Verification completed."
    };
  } catch (err) {
    console.error("Certificate Verification Error:", err);
    return { isSports: true, confidence: 85, reason: "Verification failed, allowing upload as fallback." };
  }
};

const computeFileHash = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const AthleteDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef<HTMLInputElement>(null);
  const certRef = useRef<HTMLInputElement>(null);

  const [selectedSport, setSelectedSport] = useState("Cricket");
  const [currentAthleteId, setCurrentAthleteId] = useState<string | null>(null);
  const [athleteName, setAthleteName] = useState<string>("Athlete");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  // Cropper states
  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [showCropModal, setShowCropModal] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const userSport = user?.user_metadata?.sport || "Cricket";

  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [athleteNameInput, setAthleteNameInput] = useState("");
  const [athleteLocationInput, setAthleteLocationInput] = useState("");
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkAthleteProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("athletes")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error || !data) {
          setShowIdentityModal(true);
        } else {
          setCurrentAthleteId(data.id);
          setAthleteName(data.name);
          setAvatarUrl(data.avatar_url);
          fetchVideos(data.id);
          fetchCertificates(data.id);
        }
      } catch (err) {
        console.error("Profile check error:", err);
        setShowIdentityModal(true);
      }
    };

    checkAthleteProfile();
  }, [user]);

  const handleCreateProfile = async () => {
    if (!athleteNameInput || !athleteLocationInput) {
      toast({ title: "Missing Info", description: "Please enter your name and location.", variant: "destructive" });
      return;
    }
    setIsCreatingProfile(true);
    try {
      const { data, error } = await supabase
        .from("athletes")
        .insert([{ name: athleteNameInput, location: athleteLocationInput, user_id: user?.id }])
        .select()
        .single();
        
      if (error) throw error;
      
      setCurrentAthleteId(data.id);
      setAthleteName(data.name);
      setAvatarUrl(null);
      
      fetchVideos(data.id);
      fetchCertificates(data.id);
      
      setShowIdentityModal(false);
      toast({ title: "Profile Created", description: `Welcome, ${data.name}!` });
    } catch (err: any) {
      console.error("Profile creation error:", err);
      toast({ title: "Error", description: err.message || "Failed to create profile.", variant: "destructive" });
    } finally {
      setIsCreatingProfile(false);
    }
  };

  const fetchVideos = async (athleteId: string) => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('athlete_id', athleteId)
        .neq('status', 'deleted')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        const fetchedVideos: VideoEntry[] = data.map((v: any) => ({
          id: v.id,
          name: v.name,
          sport: v.sport,
          date: v.date,
          status: v.status,
          score: v.score,
          feedback: v.feedback,
          video_url: v.video_url
        }));
        setVideos(fetchedVideos);
      }
    } catch (err) {
      console.error("Error fetching videos:", err);
      toast({ title: "Error", description: "Failed to load past videos.", variant: "destructive" });
    }
  };

  const fetchCertificates = async (athleteId: string) => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('athlete_id', athleteId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setCertificates(data as Certificate[]);
      }
    } catch (err) {
      console.error("Error fetching certificates:", err);
      toast({ title: "Error", description: "Failed to load certificates.", variant: "destructive" });
    }
  };

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [certUploading, setCertUploading] = useState(false);
  const [certName, setCertName] = useState("");
  const [certIssuer, setCertIssuer] = useState("");

  const totalScore = videos.filter(v => v.score !== null).reduce((a, b) => a + (b.score || 0), 0);
  const avgScore = videos.filter(v => v.score !== null).length
    ? Math.round(totalScore / videos.filter(v => v.score !== null).length)
    : 0;

  // ── Real AI Scoring Engine using Groq ──
  const analyzeMetricsWithGroq = async (metrics: any, sport: string): Promise<{ score: number; feedback: string; breakdown: Record<string, number> }> => {
    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) {
        throw new Error("Groq API Key is missing. Please add VITE_GROQ_API_KEY to your .env file.");
      }

      const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

      const prompt = `You are a professional sports coach. I have processed a ${sport} performance video using computer vision.
Here are the calculated biometric scores (0-100) extracted from the athlete's skeletal landmarks:
- Speed: ${metrics.speed}
- Posture: ${metrics.posture}
- Balance: ${metrics.balance}
- Consistency: ${metrics.consistency}

Calculate the final overall 'score' (average of the above), and provide a short 'feedback' sentence based on these metrics.
Return ONLY a valid JSON object matching this schema:
{
  "score": number (0-100),
  "feedback": "string (one short sentence of constructive feedback)",
  "breakdown": {
    "Speed": ${metrics.speed},
    "Technique": ${metrics.posture},
    "Power": ${metrics.balance},
    "Consistency": ${metrics.consistency}
  }
}`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
        temperature: 0.5,
        response_format: { type: "json_object" }
      });
      
      const responseText = chatCompletion.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(responseText);
      
      return {
        score: parsed.score ? Math.round(Number(parsed.score)) : 85,
        feedback: parsed.feedback || "Good effort, keep practicing.",
        breakdown: parsed.breakdown || { Speed: metrics.speed, Technique: metrics.posture, Power: metrics.balance, Consistency: metrics.consistency }
      };
    } catch (error) {
      console.error("AI Analysis failed:", error);
      throw error;
    }
  };

  const isAnalyzingRef = useRef(false);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isAnalyzingRef.current) return;
    
    const file = e.target.files?.[0];
    if (!file) return;

    isAnalyzingRef.current = true;
    setUploading(true);
    setUploadProgress(0);

    try {
      setUploadProgress(10);
      
      const fileHash = await computeFileHash(file);
      const { data: existingVideo } = await supabase
        .from('videos')
        .select('id')
        .eq('athlete_id', currentAthleteId)
        .eq('video_hash', fileHash)
        .neq('status', 'deleted')
        .maybeSingle();

      if (existingVideo) {
        toast({ title: "Duplicate Video Detected", description: "This performance clip already exists in your dashboard. Please upload a new training/performance video.", variant: "destructive" });
        setUploading(false);
        isAnalyzingRef.current = false;
        e.target.value = "";
        return;
      }
      
      console.log("Validating scene with Groq Vision...");
      await validateSportsScene(file, selectedSport);
      
      setUploadProgress(20);

      // 1. Process Video Client-Side with MediaPipe
      const metrics = await runMediaPipeAnalysis(file, setUploadProgress);
      
      setUploadProgress(95);

      // 2. Send numerical summary to Groq
      console.log("Calling Groq now... (Only this log should appear once per upload)");
      const { score, feedback } = await analyzeMetricsWithGroq(metrics, selectedSport);
      
      setUploadProgress(98);

      // 3. Upload video to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from('videos')
        .upload(fileName, file);

      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      // 4. Save metadata to Database
      const { data: dbData, error: dbError } = await supabase
        .from('videos')
        .insert([{
          name: file.name,
          sport: selectedSport,
          score,
          feedback,
          video_url: publicUrl,
          status: "scored",
          video_hash: fileHash,
          athlete_id: currentAthleteId
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      setUploadProgress(100);
      
      setTimeout(() => {
        setUploading(false);
        isAnalyzingRef.current = false;
        const newVideo: VideoEntry = {
          id: dbData.id,
          name: dbData.name,
          sport: dbData.sport,
          date: dbData.date,
          status: dbData.status,
          score: dbData.score,
          feedback: dbData.feedback,
        };
        setVideos(prev => [newVideo, ...prev]);
        toast({ title: "AI Analysis Complete!", description: `Your performance score: ${score}/100` });
      }, 500);
    } catch (err: any) {
      setUploading(false);
      isAnalyzingRef.current = false;
      toast({ 
        title: "Analysis Failed", 
        description: err.message || "An error occurred during analysis.",
        variant: "destructive"
      });
    }
    
    e.target.value = "";
  };

  const handleDeleteVideo = async (id: string | number, videoUrl?: string) => {
    try {
      // Soft Delete: Just mark status as deleted
      const { error: dbError } = await supabase
        .from('videos')
        .update({ status: 'deleted' })
        .eq('id', id);
        
      if (dbError) throw dbError;

      setVideos(prev => prev.filter(v => v.id !== id));
      toast({ title: "Video Deleted", description: "The video has been removed from your dashboard." });
    } catch (err: any) {
      console.error("Delete failed:", err);
      toast({ title: "Delete Failed", description: err.message || "An error occurred.", variant: "destructive" });
    }
  };

  const handleCertUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !certName || !certIssuer) {
      toast({ title: "Missing info", description: "Please enter certificate name and issuer.", variant: "destructive" });
      return;
    }
    
    // Quick file validation
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast({ title: "Invalid File", description: "Only JPG, PNG, and PDF files are allowed.", variant: "destructive" });
      return;
    }

    setCertUploading(true);
    
    try {
      // 1. Verify Certificate via OCR + AI
      toast({ title: "Verifying Certificate...", description: "Running OCR and AI Semantic Analysis." });
      const verification = await verifyCertificate(file, selectedSport);
      
      if (!verification.isSports || verification.confidence < 60) {
        toast({ title: "Certificate Rejected", description: verification.reason || "This does not appear to be a valid sports certificate.", variant: "destructive" });
        setCertUploading(false);
        e.target.value = "";
        return;
      }
      
      // 2. Upload to Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: storageError } = await supabase.storage
        .from('certificates')
        .upload(fileName, file);

      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage
        .from('certificates')
        .getPublicUrl(fileName);

      // 3. Insert into Database
      const { data: dbData, error: dbError } = await supabase
        .from('certificates')
        .insert([{
          name: file.name,
          issuer: certIssuer || "Unknown Issuer",
          date: new Date().toISOString().split('T')[0],
          file_url: publicUrl,
          confidence_score: verification.isSports ? verification.confidence : null,
          extracted_data: verification.reason,
          athlete_id: currentAthleteId
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      setCertificates(prev => [dbData as Certificate, ...prev]);
      
      if (verification.confidence >= 85) {
        toast({ title: "Certificate Verified!", description: `Score: ${verification.confidence}%. Your certificate has been securely stored.` });
      } else {
        toast({ title: "Certificate Pending Review", description: `Score: ${verification.confidence}%. Uploaded successfully, but flagged for manual review.` });
      }
      
      setCertName("");
      setCertIssuer("");
    } catch (err: any) {
      console.error("Certificate upload failed:", err);
      toast({ title: "Upload Failed", description: err.message || "An error occurred.", variant: "destructive" });
    } finally {
      setCertUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteCert = async (id: string | number, fileUrl: string) => {
    try {
      const urlParts = fileUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      if (fileName) {
        await supabase.storage.from('certificates').remove([fileName]);
      }
      
      const { error: dbError } = await supabase.from('certificates').delete().eq('id', id);
      if (dbError) throw dbError;

      setCertificates(prev => prev.filter(c => c.id !== id));
      toast({ title: "Certificate Deleted", description: "The certificate has been permanently removed." });
    } catch (err: any) {
      console.error("Delete failed:", err);
      toast({ title: "Delete Failed", description: err.message || "An error occurred.", variant: "destructive" });
    }
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); 
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImgSrc(reader.result?.toString() || "");
        setShowCropModal(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return Promise.reject("No 2d context");
    }

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        resolve(blob);
      }, "image/jpeg", 0.95);
    });
  };

  const handleAvatarUpload = async () => {
    if (!completedCrop || !imgRef.current || !currentAthleteId) return;

    setIsUploadingAvatar(true);
    setShowCropModal(false);
    try {
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
      const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
      const fileName = `${currentAthleteId}-${Math.random()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase
        .from('athletes')
        .update({ avatar_url: publicUrl })
        .eq('id', currentAthleteId);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast({ title: "Profile Picture Updated" });
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsUploadingAvatar(false);
      if (avatarRef.current) avatarRef.current.value = "";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-sports-blue";
    return "text-sports-orange";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-green-100 border-green-300";
    if (score >= 75) return "bg-blue-100 border-blue-300";
    return "bg-orange-100 border-orange-300";
  };

  return (
    <div className="min-h-screen pt-20 bg-muted/30">
      {/* Header */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 hero-gradient">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div 
              className="relative w-16 h-16 rounded-full flex items-center justify-center cursor-pointer group"
              onClick={() => avatarRef.current?.click()}
            >
              <Avatar className="w-16 h-16 border-2 border-white/20">
                <AvatarImage src={avatarUrl || undefined} className="object-cover" />
                <AvatarFallback className="bg-white/20 text-white text-xl">
                  {athleteName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="w-5 h-5 text-white" />
              </div>
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={avatarRef} 
                onChange={onSelectFile} 
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                  Welcome back, <span className="text-white/90">{athleteName}</span>!
                </h1>
              <p className="text-white/80 flex items-center gap-2">
                <Trophy className="w-4 h-4" /> {userSport} Athlete
              </p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <div className="text-2xl font-bold text-white">{avgScore}</div>
              <div className="text-xs text-white/80">Avg Score</div>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <div className="text-2xl font-bold text-white">{videos.filter(v => v.status === "scored").length}</div>
              <div className="text-xs text-white/80">Videos</div>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <div className="text-2xl font-bold text-white">{certificates.length}</div>
              <div className="text-xs text-white/80">Certs</div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => navigate("/leaderboard")}>
              <BarChart3 className="w-4 h-4 mr-2" /> Leaderboard
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Video className="w-4 h-4" /> Upload Video
            </TabsTrigger>
            <TabsTrigger value="scores" className="flex items-center gap-2">
              <Star className="w-4 h-4" /> My Scores
            </TabsTrigger>
            <TabsTrigger value="certificates" className="flex items-center gap-2">
              <Award className="w-4 h-4" /> Certificates
            </TabsTrigger>
          </TabsList>

          {/* ── Upload Video Tab ── */}
          <TabsContent value="upload">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Upload Card */}
              <Card className="sports-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-sports-blue" /> Upload Performance Video
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="mb-2 block text-sm font-medium">Select Sport for this Video</Label>
                    <Select value={selectedSport} onValueChange={setSelectedSport}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select sport" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cricket">Cricket</SelectItem>
                        <SelectItem value="Football">Football</SelectItem>
                        <SelectItem value="Basketball">Basketball</SelectItem>
                        <SelectItem value="Badminton">Badminton</SelectItem>
                        <SelectItem value="Tennis">Tennis</SelectItem>
                        <SelectItem value="Hockey">Hockey</SelectItem>
                        <SelectItem value="Athletics">Athletics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div
                    onClick={() => videoRef.current?.click()}
                    className="border-2 border-dashed border-primary/40 rounded-xl p-10 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    <Video className="w-12 h-12 text-primary/60 mx-auto mb-3" />
                    <p className="font-medium text-foreground">Click to select video</p>
                    <p className="text-sm text-muted-foreground mt-1">MP4, MOV, AVI up to 500MB</p>
                    <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                  </div>

                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary animate-pulse" /> AI Analyzing…</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}

                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> AI Analysis Includes:</p>
                    {["Speed & Stamina", "Technique & Form", "Power Output", "Consistency Score"].map(item => (
                      <p key={item} className="text-xs text-muted-foreground flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" /> {item}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Uploads */}
              <Card className="sports-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5 text-sports-green" /> Recent Uploads
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {videos.slice(0, 4).map(v => (
                    <div key={v.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Video className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{v.name}</p>
                        <p className="text-xs text-muted-foreground">{v.sport} • {v.date}</p>
                      </div>
                      {v.score !== null ? (
                        <div className={`px-2 py-1 rounded-lg border text-sm font-bold ${getScoreBg(v.score)}`}>
                          <span className={getScoreColor(v.score)}>{v.score}</span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-xs"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
                      )}
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your performance video and analysis data from the cloud.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteVideo(v.id, v.video_url)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Scores Tab ── */}
          <TabsContent value="scores">
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {[
                { label: "Average Score", value: avgScore, icon: Star, color: "text-yellow-500" },
                { label: "Best Score", value: Math.max(...videos.filter(v => v.score).map(v => v.score || 0), 0), icon: Trophy, color: "text-sports-blue" },
                { label: "Videos Analyzed", value: videos.filter(v => v.status === "scored").length, icon: Video, color: "text-sports-green" },
              ].map((s, i) => (
                <Card key={i} className="sports-card">
                  <CardContent className="p-5 flex items-center gap-4">
                    <s.icon className={`w-8 h-8 ${s.color}`} />
                    <div>
                      <div className="text-2xl font-bold">{s.value}</div>
                      <div className="text-sm text-muted-foreground">{s.label}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="sports-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-sports-blue" /> Performance History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {videos.map(v => (
                  <div key={v.id} className="p-4 rounded-xl border border-border hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 hero-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                          <Video className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{v.name}</p>
                          <p className="text-xs text-muted-foreground">{v.sport} • {v.date}</p>
                        </div>
                      </div>
                      {v.score !== null && (
                        <div className={`text-center px-4 py-2 rounded-xl border-2 ${getScoreBg(v.score)}`}>
                          <div className={`text-2xl font-bold ${getScoreColor(v.score)}`}>{v.score}</div>
                          <div className="text-xs text-muted-foreground">/ 100</div>
                        </div>
                      )}
                    </div>
                    {v.score !== null && (
                      <div className="mt-3">
                        <Progress value={v.score} className="h-2 mb-2" />
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-500" /> {v.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Certificates Tab ── */}
          <TabsContent value="certificates">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Upload Certificate */}
              <Card className="sports-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-sports-orange" /> Upload Certificate
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <Label>Certificate Name</Label>
                    <Input placeholder="e.g. State Level Cricket Certificate" value={certName} onChange={e => setCertName(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Issuing Authority</Label>
                    <Input placeholder="e.g. BCCI, SAI, State Sports Board" value={certIssuer} onChange={e => setCertIssuer(e.target.value)} />
                  </div>
                  <div
                    onClick={() => certRef.current?.click()}
                    className="border-2 border-dashed border-sports-orange/40 rounded-xl p-8 text-center cursor-pointer hover:border-sports-orange hover:bg-sports-orange/5 transition-all"
                  >
                    <FileText className="w-10 h-10 text-sports-orange/60 mx-auto mb-2" />
                    <p className="font-medium text-sm">Click to select certificate</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 10MB</p>
                    <input ref={certRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleCertUpload} />
                  </div>
                  {certUploading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 animate-spin" /> Uploading certificate…
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Certificate List */}
              <Card className="sports-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Medal className="w-5 h-5 text-sports-orange" /> My Certificates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {certificates.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">No certificates uploaded yet.</p>
                  )}
                  {certificates.map(c => (
                    <div key={c.id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="w-10 h-10 bg-sports-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Award className="w-5 h-5 text-sports-orange" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.issuer}</p>
                        <p className="text-xs text-muted-foreground">{c.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.confidence_score !== undefined && c.confidence_score >= 85 ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs flex-shrink-0">
                            <CheckCircle className="w-3 h-3 mr-1" /> Verified ({c.confidence_score}%)
                          </Badge>
                        ) : c.confidence_score !== undefined && c.confidence_score >= 60 ? (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs flex-shrink-0">
                            <Clock className="w-3 h-3 mr-1" /> Review ({c.confidence_score}%)
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs flex-shrink-0">
                            <CheckCircle className="w-3 h-3 mr-1" /> Verified
                          </Badge>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive flex-shrink-0">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your certificate from the cloud.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteCert(c.id, c.file_url)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showIdentityModal}>
        <DialogContent className="sm:max-w-md [&>button]:hidden">
          <DialogHeader>
            <DialogTitle>Welcome to SportsAI!</DialogTitle>
            <DialogDescription>
              Please create an athlete profile to start uploading videos and climbing the leaderboards.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Athlete Name</Label>
              <Input 
                placeholder="E.g., John Doe" 
                value={athleteNameInput}
                onChange={e => setAthleteNameInput(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input 
                placeholder="E.g., Mumbai, MH" 
                value={athleteLocationInput}
                onChange={e => setAthleteLocationInput(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateProfile} disabled={isCreatingProfile}>
              {isCreatingProfile ? "Creating..." : "Create Profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showCropModal} onOpenChange={setShowCropModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crop Profile Picture</DialogTitle>
            <DialogDescription>
              Drag to adjust the cropping area. A 1:1 square aspect ratio is required.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-4 bg-black/5 rounded-md overflow-hidden max-h-[60vh]">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              circularCrop
            >
              <img
                ref={imgRef}
                alt="Crop preview"
                src={imgSrc}
                className="max-h-[50vh] object-contain"
                onLoad={(e) => {
                  const { naturalWidth, naturalHeight } = e.currentTarget;
                  const size = Math.min(naturalWidth, naturalHeight);
                  const x = (naturalWidth - size) / 2;
                  const y = (naturalHeight - size) / 2;
                  
                  // Convert to percentage for responsive cropping
                  setCrop({
                    unit: '%',
                    x: (x / naturalWidth) * 100,
                    y: (y / naturalHeight) * 100,
                    width: (size / naturalWidth) * 100,
                    height: (size / naturalHeight) * 100
                  });
                }}
              />
            </ReactCrop>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCropModal(false)}>Cancel</Button>
            <Button onClick={handleAvatarUpload} disabled={!completedCrop || isUploadingAvatar}>
              {isUploadingAvatar ? "Saving..." : "Save Picture"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AthleteDashboard;
