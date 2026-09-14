-- ===================================================================
-- Supabase Schema for QRly - QR Code Generator
-- ===================================================================
-- Run this script in the Supabase SQL Editor (https://app.supabase.com)
-- to enable cloud synchronization for your QR codes and analytics.

-- 1. Create the qr_codes table
CREATE TABLE IF NOT EXISTS public.qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    type TEXT NOT NULL DEFAULT 'website',
    original_url TEXT NOT NULL,
    display_name TEXT NOT NULL DEFAULT 'QR Code',
    foreground_color TEXT NOT NULL DEFAULT '#000000',
    background_color TEXT NOT NULL DEFAULT '#ffffff',
    size INTEGER NOT NULL DEFAULT 512,
    margin INTEGER NOT NULL DEFAULT 2,
    error_correction TEXT NOT NULL DEFAULT 'M',
    has_logo BOOLEAN NOT NULL DEFAULT false,
    created_by TEXT DEFAULT 'anonymous',
    download_count INTEGER NOT NULL DEFAULT 0
);

-- 2. Create index on created_at for fast history retrieval
CREATE INDEX IF NOT EXISTS idx_qr_codes_created_at ON public.qr_codes (created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for public access (Anon key)
-- Allow anyone with anon key to insert new generated QR code records
CREATE POLICY "Allow public insert of QR codes"
    ON public.qr_codes
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Allow anyone with anon key to read recent QR codes
CREATE POLICY "Allow public read of QR codes"
    ON public.qr_codes
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Allow updating download count
CREATE POLICY "Allow public update of download count"
    ON public.qr_codes
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Allow deleting own QR code entries if needed
CREATE POLICY "Allow public delete of QR codes"
    ON public.qr_codes
    FOR DELETE
    TO anon, authenticated
    USING (true);
