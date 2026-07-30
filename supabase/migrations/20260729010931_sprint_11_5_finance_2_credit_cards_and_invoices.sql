/*
# Sprint 11.5 — Financeiro 2.0: Credit Cards, Invoices, Payment Methods

## Overview
Evolves the existing financial architecture to support credit card billing cycles
(invoices/faturas) and payment methods on transactions. All existing data is preserved:
old transactions default to "debit" payment method, and the existing balance logic
continues to work.

## Changes to existing tables
### transacoes
- `payment_method` text NOT NULL DEFAULT 'debit' — one of: debit, credit, pix, cash, boleto.
  Old rows default to 'debit' so existing behavior is unchanged.
- `card_id` uuid NULL — references cartoes(id) when payment_method = 'credit'.
  Allows linking a credit transaction to a specific card for invoice grouping.
- `fatura_id` uuid NULL — references faturas(id) when the transaction belongs to a paid invoice.
- `competence_month` text NULL — e.g. '2026-07'. Used to group credit purchases into billing cycles.

### cartoes (new table)
- Cards are now persisted in Supabase instead of local-only zustand state.
- Fields: id, user_id, account_id (links card to its parent account), name, bank, brand,
  limit_amount, closing_day, due_day, color, active, notes, created_at, updated_at.
- This replaces the local-only Card type while keeping the same shape.

## New tables
### cartoes
- Credit cards linked to accounts. One account can have zero, one, or many cards.
- RLS: owner-scoped (auth.uid() = user_id).

### faturas
- Credit card invoices (bills). Each belongs to a card and a competence month.
- Fields: id, user_id, card_id, competence_month, due_date, closing_date, amount,
  status (open/paid), paid_at, paid_from_account_id, paid_amount, created_at, updated_at.
- RLS: owner-scoped (auth.uid() = user_id).

## Security
- RLS enabled on cartoes and faturas.
- 4 policies per table (SELECT, INSERT, UPDATE, DELETE) scoped to authenticated, owner-checked.
- All owner columns default to auth.uid().

## Compatibility notes
1. Existing transactions keep working — payment_method defaults to 'debit'.
2. The existing accountBalance() logic in the frontend will be updated to skip
   'credit' expenses (they don't reduce account balance until the invoice is paid).
3. Old local-only cards (zustand) remain in localStorage but new cards go to Supabase.
   A migration step in the frontend reads old local cards and persists them to cartoes.
*/

-- ============================================================
-- 1. Add columns to transacoes
-- ============================================================
ALTER TABLE transacoes ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'debit';
ALTER TABLE transacoes ADD COLUMN IF NOT EXISTS card_id uuid;
ALTER TABLE transacoes ADD COLUMN IF NOT EXISTS fatura_id uuid;
ALTER TABLE transacoes ADD COLUMN IF NOT EXISTS competence_month text;

-- Add payment_method to the transaction indexes for filtering
CREATE INDEX IF NOT EXISTS idx_transacoes_payment_method ON transacoes(payment_method);
CREATE INDEX IF NOT EXISTS idx_transacoes_card_id ON transacoes(card_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_fatura_id ON transacoes(fatura_id);

-- ============================================================
-- 2. CARTOES (Credit cards — Supabase-backed)
-- ============================================================
CREATE TABLE IF NOT EXISTS cartoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES contas(id) ON DELETE CASCADE,
  name text NOT NULL,
  bank text NOT NULL DEFAULT '',
  brand text NOT NULL DEFAULT 'Outros',
  limit_amount numeric(14,2) NOT NULL DEFAULT 0,
  closing_day integer NOT NULL DEFAULT 1 CHECK (closing_day BETWEEN 1 AND 31),
  due_day integer NOT NULL DEFAULT 10 CHECK (due_day BETWEEN 1 AND 31),
  color text NOT NULL DEFAULT '#3b82f6',
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE cartoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_cartoes" ON cartoes;
CREATE POLICY "select_own_cartoes" ON cartoes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_cartoes" ON cartoes;
CREATE POLICY "insert_own_cartoes" ON cartoes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_cartoes" ON cartoes;
CREATE POLICY "update_own_cartoes" ON cartoes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_cartoes" ON cartoes;
CREATE POLICY "delete_own_cartoes" ON cartoes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_cartoes_user_id ON cartoes(user_id);
CREATE INDEX IF NOT EXISTS idx_cartoes_account_id ON cartoes(account_id);

-- Add FK from transacoes.card_id to cartoes.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'transacoes_card_id_fkey'
  ) THEN
    ALTER TABLE transacoes
      ADD CONSTRAINT transacoes_card_id_fkey
      FOREIGN KEY (card_id) REFERENCES cartoes(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================
-- 3. FATURAS (Credit card invoices)
-- ============================================================
CREATE TABLE IF NOT EXISTS faturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id uuid NOT NULL REFERENCES cartoes(id) ON DELETE CASCADE,
  competence_month text NOT NULL,
  due_date date,
  closing_date date,
  amount numeric(14,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'open',
  paid_at timestamptz,
  paid_from_account_id uuid REFERENCES contas(id) ON DELETE SET NULL,
  paid_amount numeric(14,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE faturas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_faturas" ON faturas;
CREATE POLICY "select_own_faturas" ON faturas FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_faturas" ON faturas;
CREATE POLICY "insert_own_faturas" ON faturas FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_faturas" ON faturas;
CREATE POLICY "update_own_faturas" ON faturas FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_faturas" ON faturas;
CREATE POLICY "delete_own_faturas" ON faturas FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_faturas_user_id ON faturas(user_id);
CREATE INDEX IF NOT EXISTS idx_faturas_card_id ON faturas(card_id);
CREATE INDEX IF NOT EXISTS idx_faturas_status ON faturas(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_faturas_card_competence ON faturas(card_id, competence_month);

-- Add FK from transacoes.fatura_id to faturas.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'transacoes_fatura_id_fkey'
  ) THEN
    ALTER TABLE transacoes
      ADD CONSTRAINT transacoes_fatura_id_fkey
      FOREIGN KEY (fatura_id) REFERENCES faturas(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================
-- 4. Triggers for updated_at on new tables
-- ============================================================
DROP TRIGGER IF EXISTS trg_cartoes_updated ON cartoes;
CREATE TRIGGER trg_cartoes_updated BEFORE UPDATE ON cartoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_faturas_updated ON faturas;
CREATE TRIGGER trg_faturas_updated BEFORE UPDATE ON faturas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
