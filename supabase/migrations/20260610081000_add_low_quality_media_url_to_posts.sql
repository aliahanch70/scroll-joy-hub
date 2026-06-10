-- Add low quality video path to posts
ALTER TABLE public.posts
  ADD COLUMN low_quality_media_url TEXT;

GRANT SELECT ON public.posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
