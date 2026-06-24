-- ============================================================
-- The Paper Nook — Supabase Setup
-- Run this in the Supabase SQL Editor (project > SQL Editor)
-- ============================================================

-- 1. Create the books table
CREATE TABLE IF NOT EXISTS public.books (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  isbn        TEXT,
  title       TEXT NOT NULL,
  author      TEXT,
  cover_url   TEXT,
  description TEXT,
  genre       TEXT,
  availability_status TEXT NOT NULL DEFAULT 'available'
    CHECK (availability_status IN ('available', 'reserved', 'sold')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3. Enable Row Level Security
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- 4. Public (unauthenticated) users can only READ
CREATE POLICY "public_read_books"
  ON public.books
  FOR SELECT
  USING (true);

-- 5. Only authenticated (admin) users can INSERT / UPDATE / DELETE
--    Supabase Auth ensures only your admin email can log in.
CREATE POLICY "admin_insert_books"
  ON public.books
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "admin_update_books"
  ON public.books
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "admin_delete_books"
  ON public.books
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================
-- OPTIONAL: seed a test book to verify everything is working
-- ============================================================
-- INSERT INTO public.books (isbn, title, author, cover_url, description, genre, availability_status)
-- VALUES (
--   '9780385333481',
--   'The Handmaid''s Tale',
--   'Margaret Atwood',
--   'https://covers.openlibrary.org/b/isbn/9780385333481-L.jpg',
--   'A gripping dystopian novel set in the theocratic Republic of Gilead.',
--   'Fiction',
--   'available'
-- );
