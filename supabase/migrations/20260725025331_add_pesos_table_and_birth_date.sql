-- ============================================================
-- 1. ADD birth_date COLUMN TO profiles
-- ============================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_date date;

-- ============================================================
-- 2. PESOS (Weight entries) — Supabase-backed
-- ============================================================
CREATE TABLE IF NOT EXISTS pesos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  weight numeric(5,2) NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE pesos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_pesos" ON pesos;
CREATE POLICY "select_own_pesos" ON pesos FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_pesos" ON pesos;
CREATE POLICY "insert_own_pesos" ON pesos FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_pesos" ON pesos;
CREATE POLICY "update_own_pesos" ON pesos FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_pesos" ON pesos;
CREATE POLICY "delete_own_pesos" ON pesos FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_pesos_user_id ON pesos(user_id);
CREATE INDEX IF NOT EXISTS idx_pesos_date ON pesos(date);

DROP TRIGGER IF EXISTS trg_pesos_updated ON pesos;
CREATE TRIGGER trg_pesos_updated BEFORE UPDATE ON pesos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();