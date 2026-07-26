/*
# Atlas Life OS — Complete Database Schema

## Overview
Creates the full database structure for the Atlas Life OS personal management platform.
All tables use UUID primary keys, timestamps, and Row Level Security (RLS) so each
authenticated user can only access their own data.

## New Tables (9 total)

1. **profiles** — User profile data (name, height, weight goal, etc.)
2. **contas** — Financial accounts (bank, wallet, etc.)
3. **categorias** — Transaction categories (income/expense)
4. **transacoes** — Financial transactions
5. **objetivos** — Personal objectives/goals
6. **projetos** — Projects/initiatives
7. **tarefas** — Tasks (can link to projeto or objetivo)
8. **tags** — User-defined tags
9. **anexos** — File attachments (links to any entity)

## Security
- RLS enabled on ALL tables.
- 4 policies per table (SELECT, INSERT, UPDATE, DELETE) scoped to `authenticated`.
- Ownership check: `auth.uid() = user_id` on all tables.
- `profiles` uses `auth.uid() = id` (id IS the user_id).
- All owner columns default to `auth.uid()` so inserts work without passing user_id.

## Indexes
- Indexes on `user_id` for all tables.
- Indexes on foreign keys and frequently-queried columns.

## Important Notes
1. This schema requires Supabase Auth (email/password) to function.
2. The `user_id` column defaults to `auth.uid()` so frontend inserts can omit it.
3. CASCADE deletes: deleting a user cascades to all their data.
4. Deleting a conta cascades to its transacoes. Deleting a projeto cascades to its tarefas.
*/

-- ============================================================
-- 1. PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  height numeric(5,2),
  target_weight numeric(5,2),
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- ============================================================
-- 2. CONTAS
-- ============================================================
CREATE TABLE IF NOT EXISTS contas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#3b82f6',
  initial_balance numeric(14,2) NOT NULL DEFAULT 0,
  kind text NOT NULL DEFAULT 'conta',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_contas" ON contas;
CREATE POLICY "select_own_contas" ON contas FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_contas" ON contas;
CREATE POLICY "insert_own_contas" ON contas FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_contas" ON contas;
CREATE POLICY "update_own_contas" ON contas FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_contas" ON contas;
CREATE POLICY "delete_own_contas" ON contas FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_contas_user_id ON contas(user_id);

-- ============================================================
-- 3. CATEGORIAS
-- ============================================================
CREATE TABLE IF NOT EXISTS categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'expense',
  color text NOT NULL DEFAULT '#6366f1',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_categorias" ON categorias;
CREATE POLICY "select_own_categorias" ON categorias FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_categorias" ON categorias;
CREATE POLICY "insert_own_categorias" ON categorias FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_categorias" ON categorias;
CREATE POLICY "update_own_categorias" ON categorias FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_categorias" ON categorias;
CREATE POLICY "delete_own_categorias" ON categorias FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_categorias_user_id ON categorias(user_id);

-- ============================================================
-- 4. TRANSACOES
-- ============================================================
CREATE TABLE IF NOT EXISTS transacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  conta_id uuid NOT NULL REFERENCES contas(id) ON DELETE CASCADE,
  categoria_id uuid REFERENCES categorias(id) ON DELETE SET NULL,
  kind text NOT NULL DEFAULT 'expense',
  amount numeric(14,2) NOT NULL DEFAULT 0,
  date date NOT NULL DEFAULT CURRENT_DATE,
  description text NOT NULL DEFAULT '',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_transacoes" ON transacoes;
CREATE POLICY "select_own_transacoes" ON transacoes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_transacoes" ON transacoes;
CREATE POLICY "insert_own_transacoes" ON transacoes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_transacoes" ON transacoes;
CREATE POLICY "update_own_transacoes" ON transacoes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_transacoes" ON transacoes;
CREATE POLICY "delete_own_transacoes" ON transacoes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_transacoes_user_id ON transacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_conta_id ON transacoes(conta_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_categoria_id ON transacoes(categoria_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_date ON transacoes(date);
CREATE INDEX IF NOT EXISTS idx_transacoes_kind ON transacoes(kind);

-- ============================================================
-- 5. OBJETIVOS
-- ============================================================
CREATE TABLE IF NOT EXISTS objetivos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'pessoal',
  status text NOT NULL DEFAULT 'active',
  kind text NOT NULL DEFAULT 'manual',
  deadline date,
  current_value numeric(14,2),
  target_value numeric(14,2),
  current_count integer,
  target_count integer,
  unit text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE objetivos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_objetivos" ON objetivos;
CREATE POLICY "select_own_objetivos" ON objetivos FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_objetivos" ON objetivos;
CREATE POLICY "insert_own_objetivos" ON objetivos FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_objetivos" ON objetivos;
CREATE POLICY "update_own_objetivos" ON objetivos FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_objetivos" ON objetivos;
CREATE POLICY "delete_own_objetivos" ON objetivos FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_objetivos_user_id ON objetivos(user_id);
CREATE INDEX IF NOT EXISTS idx_objetivos_status ON objetivos(status);

-- ============================================================
-- 6. PROJETOS
-- ============================================================
CREATE TABLE IF NOT EXISTS projetos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_amount numeric(14,2) NOT NULL DEFAULT 0,
  current_amount numeric(14,2) NOT NULL DEFAULT 0,
  deadline date,
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_projetos" ON projetos;
CREATE POLICY "select_own_projetos" ON projetos FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_projetos" ON projetos;
CREATE POLICY "insert_own_projetos" ON projetos FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_projetos" ON projetos;
CREATE POLICY "update_own_projetos" ON projetos FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_projetos" ON projetos;
CREATE POLICY "delete_own_projetos" ON projetos FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_projetos_user_id ON projetos(user_id);

-- ============================================================
-- 7. TAREFAS
-- ============================================================
CREATE TABLE IF NOT EXISTS tarefas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  projeto_id uuid REFERENCES projetos(id) ON DELETE CASCADE,
  objetivo_id uuid REFERENCES objetivos(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending',
  priority text NOT NULL DEFAULT 'media',
  due_date date,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_tarefas" ON tarefas;
CREATE POLICY "select_own_tarefas" ON tarefas FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_tarefas" ON tarefas;
CREATE POLICY "insert_own_tarefas" ON tarefas FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_tarefas" ON tarefas;
CREATE POLICY "update_own_tarefas" ON tarefas FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_tarefas" ON tarefas;
CREATE POLICY "delete_own_tarefas" ON tarefas FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tarefas_user_id ON tarefas(user_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_projeto_id ON tarefas(projeto_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_objetivo_id ON tarefas(objetivo_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_status ON tarefas(status);
CREATE INDEX IF NOT EXISTS idx_tarefas_due_date ON tarefas(due_date);

-- ============================================================
-- 8. TAGS
-- ============================================================
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#6366f1',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_tags" ON tags;
CREATE POLICY "select_own_tags" ON tags FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_tags" ON tags;
CREATE POLICY "insert_own_tags" ON tags FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_tags" ON tags;
CREATE POLICY "update_own_tags" ON tags FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_tags" ON tags;
CREATE POLICY "delete_own_tags" ON tags FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);

-- ============================================================
-- 9. ANEXOS
-- ============================================================
CREATE TABLE IF NOT EXISTS anexos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size bigint,
  mime_type text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE anexos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_anexos" ON anexos;
CREATE POLICY "select_own_anexos" ON anexos FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_anexos" ON anexos;
CREATE POLICY "insert_own_anexos" ON anexos FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_anexos" ON anexos;
CREATE POLICY "update_own_anexos" ON anexos FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_anexos" ON anexos;
CREATE POLICY "delete_own_anexos" ON anexos FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_anexos_user_id ON anexos(user_id);
CREATE INDEX IF NOT EXISTS idx_anexos_entity ON anexos(entity_type, entity_id);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION (shared by all tables)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  t text;
  tables text[] := ARRAY['profiles','contas','categorias','transacoes','objetivos','projetos','tarefas','tags','anexos'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated ON %s;', t, t);
    EXECUTE format('CREATE TRIGGER trg_%s_updated BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION update_updated_at();', t, t);
  END LOOP;
END $$;
