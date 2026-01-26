-- Aggiungi la colonna 'title' alla tabella 'sponsorship_requests'
ALTER TABLE public.sponsorship_requests
ADD COLUMN IF NOT EXISTS title text;

-- Aggiungi la colonna 'description' alla tabella 'sponsorship_requests'
ALTER TABLE public.sponsorship_requests
ADD COLUMN IF NOT EXISTS description text;

-- Aggiungi la colonna 'amount' alla tabella 'sponsorship_requests'
ALTER TABLE public.sponsorship_requests
ADD COLUMN IF NOT EXISTS amount numeric;

-- Aggiungi la colonna 'purpose' alla tabella 'sponsorship_requests'
ALTER TABLE public.sponsorship_requests
ADD COLUMN IF NOT EXISTS purpose text;

-- Aggiungi la colonna 'city' alla tabella 'sponsorship_requests'
ALTER TABLE public.sponsorship_requests
ADD COLUMN IF NOT EXISTS city text;

-- Aggiungi la colonna 'zip' alla tabella 'sponsorship_requests'
ALTER TABLE public.sponsorship_requests
ADD COLUMN IF NOT EXISTS zip text;

-- Aggiungi la colonna 'organization' alla tabella 'sponsorship_requests'
ALTER TABLE public.sponsorship_requests
ADD COLUMN IF NOT EXISTS organization text;

-- Aggiungi la colonna 'user_id' alla tabella 'sponsorship_requests'
-- e imposta una chiave esterna a auth.users
ALTER TABLE public.sponsorship_requests
ADD COLUMN IF NOT EXISTS user_id uuid;

ALTER TABLE public.sponsorship_requests
ADD CONSTRAINT fk_user
FOREIGN KEY (user_id)
REFERENCES auth.users (id)
ON DELETE CASCADE;

-- Aggiungi la colonna 'status' se non esiste, con un valore predefinito
ALTER TABLE public.sponsorship_requests
ADD COLUMN IF NOT EXISTS status text DEFAULT 'Attiva';

-- Aggiungi la colonna 'amount_funded' se non esiste, con un valore predefinito
ALTER TABLE public.sponsorship_requests
ADD COLUMN IF NOT EXISTS amount_funded numeric DEFAULT 0;

-- Crea una RLS policy per permettere agli utenti di inserire le proprie richieste di sponsorizzazione
CREATE POLICY "Allow authenticated users to insert their own sponsorship requests"
ON public.sponsorship_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Crea una RLS policy per permettere agli utenti di vedere tutte le richieste di sponsorizzazione
CREATE POLICY "Allow all authenticated users to view sponsorship requests"
ON public.sponsorship_requests
FOR SELECT
TO authenticated
USING (true);

-- Crea una RLS policy per permettere agli utenti di aggiornare le proprie richieste di sponsorizzazione
CREATE POLICY "Allow authenticated users to update their own sponsorship requests"
ON public.sponsorship_requests
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Abilita RLS sulla tabella sponsorship_requests
ALTER TABLE public.sponsorship_requests ENABLE ROW LEVEL SECURITY;