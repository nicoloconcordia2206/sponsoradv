ALTER TABLE public.investments
ADD COLUMN investor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;