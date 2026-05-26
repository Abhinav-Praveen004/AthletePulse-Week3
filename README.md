# AthletePulse: Week 3 - Production Identity & Leaderboard Systems

Welcome to Week 3 of the AthletePulse remote internship project! This week focused heavily on migrating from mocked data to secure, production-grade systems, including robust Authentication, personalized user identities, and dynamic leaderboards.

## 🚀 Key Features Implemented

### 1. Complete Authentication Architecture
- **Supabase Auth**: Replaced insecure `localStorage` state with a production-ready cloud authentication system.
- **Global Auth Context**: Built an `AuthContext` provider that seamlessly wraps the app, guards protected routes, and syncs authenticated `user_id`s directly to the PostgreSQL `athletes` table.

### 2. Custom Profile Pictures (Avatars)
- **Interactive Cropper**: Integrated `react-image-crop` to provide a highly polished UI that forces a 1:1 aspect ratio when selecting a profile picture.
- **Secure Cloud Storage**: Configured Row-Level Security (RLS) policies allowing users to securely upload, update, and read custom avatar images from a dedicated `avatars` storage bucket.
- **Dynamic Leaderboard Rendering**: Leaderboards and dashboards now display the user's custom avatar, with a beautiful initials-based fallback for those without one.

### 3. Active Duplicate Detection & Soft Deletes
- **Per-Athlete Scoping**: Redesigned the anti-spam video hashing system. Instead of blocking duplicate hashes globally across the entire database, the system now scopes duplicate detection exclusively to the current athlete, allowing teammates to share footage.
- **Soft Delete Architecture**: Deleting a video no longer triggers a hard `DELETE` query. Instead, it updates the row to `status = 'deleted'`. This preserves historical performance analytics while hiding the video from the UI, and intelligently allows the athlete to re-upload that exact same video later without triggering the duplicate blocker.

### 4. Advanced Dynamic Leaderboards
- **Database Hydration**: Replaced all mocked leaderboard arrays. Rankings are now populated by querying the database in real-time.
- **Hybrid Scoring Engine**: Designed a complex weighted algorithm that ranks athletes using 70% of their best video score combined with 30% of their top-5 average score.
- **Verified Badging**: Athletes who upload certificates passing the OCR/Vision AI check (>85% confidence) automatically receive a "Verified Athlete" blue checkmark on the leaderboards.

## 🛠 Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui, react-image-crop
- **Computer Vision**: MediaPipe (Pose Landmarker), Tesseract.js (OCR)
- **Generative AI**: Groq (LLaMA-3.1-8b, LLaMA-3.2-11b-Vision)
- **Backend/DB**: Supabase (PostgreSQL, Storage, Auth)
