-- ============================================
-- USER EMAIL TABLE + AUTO-CAPTURE TRIGGER
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================

-- 1. Create user_email table
CREATE TABLE IF NOT EXISTS user_email (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_email_user_id ON user_email(user_id);
CREATE INDEX IF NOT EXISTS idx_user_email_email ON user_email(email_id);

-- 2. Enable RLS
ALTER TABLE user_email ENABLE ROW LEVEL SECURITY;

-- Policy: users can read only their own row
CREATE POLICY "Users can view own email" ON user_email
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: service role can insert/update (used by trigger)
CREATE POLICY "Service can manage emails" ON user_email
  FOR ALL USING (true) WITH CHECK (true);

-- 3. Trigger function: auto-insert email on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_email()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_email (user_id, email_id)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (user_id) DO UPDATE SET email_id = EXCLUDED.email_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger: fires after insert on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_email ON auth.users;
CREATE TRIGGER on_auth_user_created_email
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_email();

-- 5. Backfill existing users
INSERT INTO user_email (user_id, email_id)
SELECT id, email FROM auth.users
ON CONFLICT (user_id) DO UPDATE SET email_id = EXCLUDED.email_id;
