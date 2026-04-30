-- Hero slideshow: mark rows that appear in the Netflix-style featured carousel.
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS projects_is_featured_order_idx
  ON public.projects (is_featured, order_index ASC)
  WHERE is_featured = true;
