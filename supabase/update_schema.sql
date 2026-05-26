-- Add user_id column to athletes table to link with Supabase Auth
ALTER TABLE public.athletes 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- (Optional) If you want to enforce RLS (Row Level Security) so athletes can only read/update their own data:
-- ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can insert their own profile" ON public.athletes FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update their own profile" ON public.athletes FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY "Anyone can view athletes" ON public.athletes FOR SELECT USING (true);
