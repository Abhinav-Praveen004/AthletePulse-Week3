-- Add status column to videos table for soft deletes
ALTER TABLE public.videos 
ADD COLUMN status text DEFAULT 'active';

-- Optionally, update existing rows to be active just in case
UPDATE public.videos SET status = 'active' WHERE status IS NULL;
