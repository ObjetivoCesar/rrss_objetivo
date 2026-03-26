-- Migration: Create Media Assets Table
-- Purpose: Track photos and videos for the centralized gallery

CREATE TABLE IF NOT EXISTS public.media_assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    filename TEXT NOT NULL,
    url TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL, -- 'image', 'video'
    category TEXT DEFAULT 'general',
    size INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- Allow public read access (if needed) or restricted to service role
CREATE POLICY "Allow public read" ON public.media_assets FOR SELECT USING (true);
CREATE POLICY "Allow all to service role" ON public.media_assets USING (true);
