-- Create wallets table
CREATE TABLE public.wallets (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_earned NUMERIC DEFAULT 0 NOT NULL,
  pending_balance NUMERIC DEFAULT 0 NOT NULL,
  available_balance NUMERIC DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- Create secure policies for each operation
CREATE POLICY "wallets_select_policy" ON public.wallets
FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "wallets_insert_policy" ON public.wallets
FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "wallets_update_policy" ON public.wallets
FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "wallets_delete_policy" ON public.wallets
FOR DELETE TO authenticated USING (auth.uid() = id);