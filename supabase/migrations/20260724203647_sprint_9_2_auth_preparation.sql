/*
# Sprint 9.2 — Auth Preparation: Trigger, Storage, Constraints

## Overview
Prepares the database for production authentication by adding:
1. Auto-profile creation trigger on user signup
2. Storage bucket "atlas-files" with per-user RLS policies
3. CHECK constraints on all enum columns
4. UNIQUE constraints to prevent duplicates per user

## 1. Auto-Profile Trigger
- Creates function `handle_new_user()` that inserts a row into `profiles`
  when a new user signs up via Supabase Auth.
- Trigger `on_auth_user_created` fires `AFTER INSERT ON auth.users`.

## 2. Storage Bucket
- Creates bucket `atlas-files` (private, 50MB limit).
- 4 policies on `storage.objects` scoped to `authenticated`:
  - SELECT: user can read files they own
  - INSERT: user can upload files they own
  - UPDATE: user can modify files they own
  - DELETE: user can remove files they own
- All policies check `bucket_id = 'atlas-files' AND auth.uid() = owner`.

## 3. CHECK Constraints
Enum values sourced from the frontend TypeScript types:
- `transacoes.kind`: income, expense, transfer
- `categorias.kind`: income, expense
- `contas.kind`: conta
- `objetivos.category`: financeiro, saude, estudos, profissional, viagem, pessoal, outro
- `objetivos.status`: active, completed, paused
- `objetivos.kind`: financeiro, quantidade, recorrente, checkin, personalizado, auto, manual
- `tarefas.status`: pending, in_progress, completed
- `tarefas.priority`: baixa, media, alta
- `projetos.archived`: (boolean, no CHECK needed)

## 4. UNIQUE Constraints
- `contas`: UNIQUE(user_id, name) — no duplicate account names per user
- `categorias`: UNIQUE(user_id, name, kind) — same name allowed across income/expense
- `tags`: UNIQUE(user_id, name) — no duplicate tag names per user

## Important Notes
1. No existing table structure altered — only constraints and triggers added.
2. No new tables created.
3. All statements are idempotent (safe to re-run).
4. Storage bucket is private (not publicly accessible).
*/

-- ============================================================
-- 1. AUTO-PROFILE TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 2. STORAGE BUCKET + POLICIES
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('atlas-files', 'atlas-files', false, 52428800)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "select_own_files" ON storage.objects;
CREATE POLICY "select_own_files" ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'atlas-files' AND auth.uid() = owner);

DROP POLICY IF EXISTS "insert_own_files" ON storage.objects;
CREATE POLICY "insert_own_files" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'atlas-files' AND auth.uid() = owner);

DROP POLICY IF EXISTS "update_own_files" ON storage.objects;
CREATE POLICY "update_own_files" ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'atlas-files' AND auth.uid() = owner)
  WITH CHECK (bucket_id = 'atlas-files' AND auth.uid() = owner);

DROP POLICY IF EXISTS "delete_own_files" ON storage.objects;
CREATE POLICY "delete_own_files" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'atlas-files' AND auth.uid() = owner);

-- ============================================================
-- 3. CHECK CONSTRAINTS
-- ============================================================

-- transacoes.kind
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_transacoes_kind') THEN
    ALTER TABLE transacoes ADD CONSTRAINT check_transacoes_kind
      CHECK (kind IN ('income', 'expense', 'transfer'));
  END IF;
END $$;

-- categorias.kind
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_categorias_kind') THEN
    ALTER TABLE categorias ADD CONSTRAINT check_categorias_kind
      CHECK (kind IN ('income', 'expense'));
  END IF;
END $$;

-- contas.kind
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_contas_kind') THEN
    ALTER TABLE contas ADD CONSTRAINT check_contas_kind
      CHECK (kind IN ('conta'));
  END IF;
END $$;

-- objetivos.category
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_objetivos_category') THEN
    ALTER TABLE objetivos ADD CONSTRAINT check_objetivos_category
      CHECK (category IN ('financeiro', 'saude', 'estudos', 'profissional', 'viagem', 'pessoal', 'outro'));
  END IF;
END $$;

-- objetivos.status
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_objetivos_status') THEN
    ALTER TABLE objetivos ADD CONSTRAINT check_objetivos_status
      CHECK (status IN ('active', 'completed', 'paused'));
  END IF;
END $$;

-- objetivos.kind
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_objetivos_kind') THEN
    ALTER TABLE objetivos ADD CONSTRAINT check_objetivos_kind
      CHECK (kind IN ('financeiro', 'quantidade', 'recorrente', 'checkin', 'personalizado', 'auto', 'manual'));
  END IF;
END $$;

-- tarefas.status
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_tarefas_status') THEN
    ALTER TABLE tarefas ADD CONSTRAINT check_tarefas_status
      CHECK (status IN ('pending', 'in_progress', 'completed'));
  END IF;
END $$;

-- tarefas.priority
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_tarefas_priority') THEN
    ALTER TABLE tarefas ADD CONSTRAINT check_tarefas_priority
      CHECK (priority IN ('baixa', 'media', 'alta'));
  END IF;
END $$;

-- ============================================================
-- 4. UNIQUE CONSTRAINTS
-- ============================================================

-- contas: unique (user_id, name)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_contas_user_name') THEN
    ALTER TABLE contas ADD CONSTRAINT unique_contas_user_name UNIQUE (user_id, name);
  END IF;
END $$;

-- categorias: unique (user_id, name, kind)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_categorias_user_name_kind') THEN
    ALTER TABLE categorias ADD CONSTRAINT unique_categorias_user_name_kind UNIQUE (user_id, name, kind);
  END IF;
END $$;

-- tags: unique (user_id, name)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_tags_user_name') THEN
    ALTER TABLE tags ADD CONSTRAINT unique_tags_user_name UNIQUE (user_id, name);
  END IF;
END $$;
