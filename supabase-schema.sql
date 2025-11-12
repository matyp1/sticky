-- Supabase Database Schema for Sticky App

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Designs table
CREATE TABLE designs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  design_data JSONB DEFAULT '{}'::jsonb,
  image_url TEXT,
  cut_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  printful_order_id TEXT,
  stripe_payment_id TEXT,
  status TEXT DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX designs_user_id_idx ON designs(user_id);
CREATE INDEX designs_created_at_idx ON designs(created_at DESC);
CREATE INDEX orders_user_id_idx ON orders(user_id);
CREATE INDEX orders_design_id_idx ON orders(design_id);
CREATE INDEX orders_status_idx ON orders(status);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Designs policies
CREATE POLICY "Users can view their own designs"
  ON designs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own designs"
  ON designs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own designs"
  ON designs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own designs"
  ON designs FOR DELETE
  USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Storage bucket for design files
-- Run this in Supabase dashboard:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('designs', 'designs', true);

-- Storage policies for designs bucket
CREATE POLICY "Users can upload their own design files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'designs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view design files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'designs');

CREATE POLICY "Users can update their own design files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'designs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own design files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'designs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at
CREATE TRIGGER update_designs_updated_at
  BEFORE UPDATE ON designs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
