ALTER TABLE public.proposals
ADD COLUMN contract_terms TEXT,
ADD COLUMN video_url TEXT,
ADD COLUMN spark_code TEXT,
ADD COLUMN feedback_notes TEXT,
ADD COLUMN payment_status TEXT DEFAULT 'unpaid';