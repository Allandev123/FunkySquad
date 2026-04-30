-- Ensure projects.order_index exists (portfolio + admin sort field).
-- Safe to run multiple times.

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS order_index integer DEFAULT 0;

-- Copy legacy display_order → order_index only when that column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'projects'
      AND column_name = 'display_order'
  ) THEN
    EXECUTE 'UPDATE public.projects SET order_index = COALESCE(order_index, display_order, 0)';
  END IF;
END $$;
