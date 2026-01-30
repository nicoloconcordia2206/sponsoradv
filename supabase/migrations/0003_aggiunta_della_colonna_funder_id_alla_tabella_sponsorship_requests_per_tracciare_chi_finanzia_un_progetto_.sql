ALTER TABLE public.sponsorship_requests
ADD COLUMN funder_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;