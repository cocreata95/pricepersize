-- ============================================
-- PricePerSize Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. RECEIPTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  store_name TEXT,
  purchase_date DATE,
  total_amount DECIMAL(10, 2),
  
  ai_confidence DECIMAL(3, 2),
  extraction_status TEXT DEFAULT 'processing'
    CHECK (extraction_status IN ('processing', 'completed', 'failed')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_purchase_date ON receipts(user_id, purchase_date DESC);

-- ============================================
-- 2. PANTRY ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pantry_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receipt_id UUID REFERENCES receipts(id) ON DELETE SET NULL,
  
  item_name TEXT NOT NULL,
  brand TEXT,
  size DECIMAL(10, 2),
  unit TEXT,
  
  status TEXT DEFAULT 'have'
    CHECK (status IN ('have', 'used_up')),
  purchase_date DATE,
  marked_used_date DATE,
  
  confidence DECIMAL(3, 2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pantry_items_user_id ON pantry_items(user_id);
CREATE INDEX IF NOT EXISTS idx_pantry_items_status ON pantry_items(user_id, status);
CREATE INDEX IF NOT EXISTS idx_pantry_items_name ON pantry_items(user_id, item_name);

-- Full-text search index for fuzzy matching
CREATE INDEX IF NOT EXISTS idx_pantry_items_search ON pantry_items 
  USING GIN (to_tsvector('english', item_name || ' ' || COALESCE(brand, '')));

-- ============================================
-- 3. PRICE HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receipt_id UUID REFERENCES receipts(id) ON DELETE SET NULL,
  
  item_name TEXT NOT NULL,
  brand TEXT,
  size DECIMAL(10, 2),
  unit TEXT,
  
  price DECIMAL(10, 2) NOT NULL,
  price_per_unit DECIMAL(10, 2),
  
  store_name TEXT,
  purchase_date DATE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_history_user_id ON price_history(user_id);
CREATE INDEX IF NOT EXISTS idx_price_history_item ON price_history(user_id, item_name, purchase_date DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_date ON price_history(user_id, purchase_date DESC);

-- ============================================
-- 4. USER PREFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  reminders_enabled BOOLEAN DEFAULT true,
  shopping_day_pattern TEXT[],
  shopping_time_pattern TIME,
  reminder_offset_hours INTEGER DEFAULT 2,
  
  push_notifications_enabled BOOLEAN DEFAULT true,
  email_notifications_enabled BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. SHOPPING PATTERNS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS shopping_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  shopping_date DATE NOT NULL,
  shopping_time TIME,
  day_of_week INTEGER,
  store_name TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shopping_patterns_user ON shopping_patterns(user_id, shopping_date DESC);

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_patterns ENABLE ROW LEVEL SECURITY;

-- Receipts policies
CREATE POLICY "Users can view own receipts" ON receipts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own receipts" ON receipts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own receipts" ON receipts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own receipts" ON receipts
  FOR DELETE USING (auth.uid() = user_id);

-- Pantry items policies
CREATE POLICY "Users can manage own pantry" ON pantry_items
  FOR ALL USING (auth.uid() = user_id);

-- Price history policies
CREATE POLICY "Users can view own price history" ON price_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own price history" ON price_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can manage own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Shopping patterns policies
CREATE POLICY "Users can manage own shopping patterns" ON shopping_patterns
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 7. SERVICE ROLE BYPASS (for Edge Functions)
-- ============================================
-- Edge Functions use SERVICE_ROLE_KEY which bypasses RLS automatically.
-- No extra policies needed for the scan-receipt function.
