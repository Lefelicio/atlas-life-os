/*
# Seed Default Categories + Auto-Seed on Signup

## Summary
This migration fixes the Finance module where new and existing users had zero
categories, leaving the "Categoria" dropdown in the transaction dialog empty and
the "Salvar" button permanently disabled.

1. Seeds the 12 default categories for the single existing user
   (07919cb8-f23e-4579-a3a1-ea82fbbe1967) who currently has none.
2. Updates the `handle_new_user()` trigger so every newly registered user
   automatically receives the same 12 default categories on signup — once per
   user, idempotent.

## Default Categories
Receitas (income): Salário, Freelance, Investimentos, Outros
Despesas (expense): Alimentação, Moradia, Transporte, Saúde, Educação, Lazer, Compras, Outros

## Why in the trigger
The trigger runs as SECURITY DEFINER with search_path = public. It inserts rows
into `categorias` with user_id = NEW.id. Because the trigger fires on
auth.users INSERT, the new user has no session yet and cannot insert categories
themselves — the trigger must do it with elevated privileges.

## Idempotency
- For the existing user: `WHERE NOT EXISTS` guard prevents duplicates on re-run.
- For new users: the trigger fires once per signup; the INSERT uses
  ON CONFLICT DO NOTHING as a second safety net.
*/

-- 1. Seed default categories for the existing user (idempotent)
INSERT INTO public.categorias (user_id, name, kind, color)
SELECT
  '07919cb8-f23e-4579-a3a1-ea82fbbe1967'::uuid,
  name, kind, color
FROM (VALUES
  -- Receitas
  ('Salário',       'income',  '#10b981'),
  ('Freelance',     'income',  '#06b6d4'),
  ('Investimentos', 'income',  '#84cc16'),
  ('Outros',        'income',  '#6366f1'),
  -- Despesas
  ('Alimentação',   'expense', '#f59e0b'),
  ('Moradia',       'expense', '#3b82f6'),
  ('Transporte',    'expense', '#8b5cf6'),
  ('Saúde',         'expense', '#ec4899'),
  ('Educação',      'expense', '#f43f5e'),
  ('Lazer',         'expense', '#ef4444'),
  ('Compras',       'expense', '#6366f1'),
  ('Outros',        'expense', '#64748b')
) AS t(name, kind, color)
WHERE NOT EXISTS (
  SELECT 1 FROM public.categorias c
  WHERE c.user_id = '07919cb8-f23e-4579-a3a1-ea82fbbe1967'::uuid
);

-- 2. Update the handle_new_user trigger to also seed default categories
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''));

  INSERT INTO public.categorias (user_id, name, kind, color)
  SELECT NEW.id, name, kind, color
  FROM (VALUES
    ('Salário',       'income',  '#10b981'),
    ('Freelance',     'income',  '#06b6d4'),
    ('Investimentos', 'income',  '#84cc16'),
    ('Outros',        'income',  '#6366f1'),
    ('Alimentação',   'expense', '#f59e0b'),
    ('Moradia',       'expense', '#3b82f6'),
    ('Transporte',    'expense', '#8b5cf6'),
    ('Saúde',         'expense', '#ec4899'),
    ('Educação',      'expense', '#f43f5e'),
    ('Lazer',         'expense', '#ef4444'),
    ('Compras',       'expense', '#6366f1'),
    ('Outros',        'expense', '#64748b')
  ) AS t(name, kind, color)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$function$;