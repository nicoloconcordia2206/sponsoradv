-- ====================================================================================================
-- Configurazione della tabella 'sponsorship_requests' (usata in SocialImpactPage)
-- ====================================================================================================

-- Abilita RLS sulla tabella sponsorship_requests
ALTER TABLE public.sponsorship_requests ENABLE ROW LEVEL SECURITY;

-- Rimuovi le policy esistenti per evitare conflitti durante la ricreazione
DROP POLICY IF EXISTS "Allow authenticated users to insert their own sponsorship requests" ON public.sponsorship_requests;
DROP POLICY IF EXISTS "Allow all authenticated users to view sponsorship requests" ON public.sponsorship_requests;
DROP POLICY IF EXISTS "Allow authenticated users to update their own sponsorship requests" ON public.sponsorship_requests;

-- Aggiungi colonne con NOT NULL e DEFAULT dove appropriato
ALTER TABLE public.sponsorship_requests
ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT 'Untitled Project';

ALTER TABLE public.sponsorship_requests
ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';

ALTER TABLE public.sponsorship_requests
ADD COLUMN IF NOT EXISTS amount numeric NOT NULL DEFAULT 0;

ALTER TABLE public.sponsorship_requests
ADD COLUMN IF NOT EXISTS purpose text NOT NULL DEFAULT '';

ALTER TABLE public.sponsorship_requests
ADD COLUMN IF NOT EXISTS city text NOT NULL DEFAULT '';

ALTER TABLE public.sponsorship_requests
ADD COLUMN IF NOT EXISTS zip text NOT NULL DEFAULT '';

ALTER TABLE public.sponsorship_requests
ADD COLUMN IF NOT EXISTS organization text NOT NULL DEFAULT 'Unknown Organization';

ALTER TABLE public.sponsorship_requests
ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL;

ALTER TABLE public.sponsorship_requests
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'Attiva';

ALTER TABLE public.sponsorship_requests
ADD COLUMN IF NOT EXISTS amount_funded numeric NOT NULL DEFAULT 0;

-- Aggiungi la chiave esterna se non esiste
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_sponsorship_request_user' AND conrelid = 'public.sponsorship_requests'::regclass) THEN
        ALTER TABLE public.sponsorship_requests
        ADD CONSTRAINT fk_sponsorship_request_user
        FOREIGN KEY (user_id)
        REFERENCES auth.users (id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- Crea RLS policies
CREATE POLICY "Allow authenticated users to insert their own sponsorship requests"
ON public.sponsorship_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow all authenticated users to view sponsorship requests"
ON public.sponsorship_requests
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to update their own sponsorship requests"
ON public.sponsorship_requests
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- ====================================================================================================
-- Configurazione della tabella 'campaigns' (usata in CreatorHubPage)
-- ====================================================================================================

-- Abilita RLS sulla tabella campaigns
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Rimuovi le policy esistenti per evitare conflitti durante la ricreazione
DROP POLICY IF EXISTS "Allow authenticated users to insert their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Allow all authenticated users to view campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Allow authenticated users to update their own campaigns" ON public.campaigns;

-- Aggiungi colonne con NOT NULL e DEFAULT dove appropriato
ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT 'Untitled Campaign';

ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';

ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS budget numeric NOT NULL DEFAULT 0;

ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS deadline date NOT NULL DEFAULT CURRENT_DATE;

ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS company text NOT NULL DEFAULT 'Unknown Company';

ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL;

-- Aggiungi la chiave esterna se non esiste
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_campaign_user' AND conrelid = 'public.campaigns'::regclass) THEN
        ALTER TABLE public.campaigns
        ADD CONSTRAINT fk_campaign_user
        FOREIGN KEY (user_id)
        REFERENCES auth.users (id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- Crea RLS policies
CREATE POLICY "Allow authenticated users to insert their own campaigns"
ON public.campaigns
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow all authenticated users to view campaigns"
ON public.campaigns
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to update their own campaigns"
ON public.campaigns
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- ====================================================================================================
-- Configurazione della tabella 'investments' (usata in InvestmentFloorPage)
-- ====================================================================================================

-- Abilita RLS sulla tabella investments
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Rimuovi le policy esistenti per evitare conflitti durante la ricreazione
DROP POLICY IF EXISTS "Allow authenticated users to insert their own investments" ON public.investments;
DROP POLICY IF EXISTS "Allow all authenticated users to view investments" ON public.investments;
DROP POLICY IF EXISTS "Allow authenticated users to update their own investments" ON public.investments;

-- Aggiungi colonne con NOT NULL e DEFAULT dove appropriato
ALTER TABLE public.investments
ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT 'Untitled Startup';

ALTER TABLE public.investments
ADD COLUMN IF NOT EXISTS sector text NOT NULL DEFAULT '';

ALTER TABLE public.investments
ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';

ALTER TABLE public.investments
ADD COLUMN IF NOT EXISTS roi text NOT NULL DEFAULT 'N/A'; -- ROI è una stringa nell'app

ALTER TABLE public.investments
ADD COLUMN IF NOT EXISTS capital numeric NOT NULL DEFAULT 0;

ALTER TABLE public.investments
ADD COLUMN IF NOT EXISTS equity numeric NOT NULL DEFAULT 0;

ALTER TABLE public.investments
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'Disponibile';

ALTER TABLE public.investments
ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL;

-- Aggiungi la chiave esterna se non esiste
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_investment_user' AND conrelid = 'public.investments'::regclass) THEN
        ALTER TABLE public.investments
        ADD CONSTRAINT fk_investment_user
        FOREIGN KEY (user_id)
        REFERENCES auth.users (id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- Crea RLS policies
CREATE POLICY "Allow authenticated users to insert their own investments"
ON public.investments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow all authenticated users to view investments"
ON public.investments
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to update their own investments"
ON public.investments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- ====================================================================================================
-- Configurazione della tabella 'proposals' (usata in CreatorHubPage e DashboardPage)
-- ====================================================================================================

-- Abilita RLS sulla tabella proposals
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Rimuovi le policy esistenti per evitare conflitti durante la ricreazione
DROP POLICY IF EXISTS "Allow authenticated users to insert their own proposals" ON public.proposals;
DROP POLICY IF EXISTS "Allow all authenticated users to view proposals" ON public.proposals;
DROP POLICY IF EXISTS "Allow authenticated users to update their own proposals" ON public.proposals;

-- Aggiungi colonne con NOT NULL e DEFAULT dove appropriato
ALTER TABLE public.proposals
ADD COLUMN IF NOT EXISTS job_brief_id uuid NOT NULL; -- Assumendo che job_brief_id sia un UUID che si collega a campaigns.id

ALTER TABLE public.proposals
ADD COLUMN IF NOT EXISTS jobTitle text NOT NULL DEFAULT '';

ALTER TABLE public.proposals
ADD COLUMN IF NOT EXISTS socialLink text NOT NULL DEFAULT '';

ALTER TABLE public.proposals
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'Inviata';

ALTER TABLE public.proposals
ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL;

-- Aggiungi le chiavi esterne se non esistono
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proposal_user' AND conrelid = 'public.proposals'::regclass) THEN
        ALTER TABLE public.proposals
        ADD CONSTRAINT fk_proposal_user
        FOREIGN KEY (user_id)
        REFERENCES auth.users (id)
        ON DELETE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proposal_job_brief' AND conrelid = 'public.proposals'::regclass) THEN
        ALTER TABLE public.proposals
        ADD CONSTRAINT fk_proposal_job_brief
        FOREIGN KEY (job_brief_id)
        REFERENCES public.campaigns (id) -- Collegamento alla tabella campaigns
        ON DELETE CASCADE;
    END IF;
END $$;

-- Crea RLS policies
CREATE POLICY "Allow authenticated users to insert their own proposals"
ON public.proposals
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow all authenticated users to view proposals"
ON public.proposals
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to update their own proposals"
ON public.proposals
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- ====================================================================================================
-- Configurazione della tabella 'profiles' (per full_name e username)
-- ====================================================================================================

-- Abilita RLS sulla tabella profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Aggiungi colonne a profiles table se non esistono
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS full_name text;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username text;

-- Assicurati che la colonna 'role' esista e abbia un default se necessario
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role text DEFAULT 'Influencer'; -- O un ruolo predefinito adatto

-- Le policy RLS per 'profiles' dovrebbero già esistere o essere gestite dal trigger 'handle_new_user'.
-- Se necessario, puoi aggiungere o modificare le policy qui, ad esempio:
-- DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.profiles;
-- CREATE POLICY "Allow users to view their own profile"
-- ON public.profiles
-- FOR SELECT
-- TO authenticated
-- USING (auth.uid() = id);

-- DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
-- CREATE POLICY "Allow users to update their own profile"
-- ON public.profiles
-- FOR UPDATE
-- TO authenticated
-- USING (auth.uid() = id);

-- ====================================================================================================
-- Configurazione della tabella 'messages' (usata in ChatDialog)
-- ====================================================================================================

-- Abilita RLS sulla tabella messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Rimuovi le policy esistenti per evitare conflitti durante la ricreazione
DROP POLICY IF EXISTS "Allow authenticated users to send messages" ON public.messages;
DROP POLICY IF EXISTS "Allow authenticated users to view their messages" ON public.messages;

-- Aggiungi colonne con NOT NULL e DEFAULT dove appropriato
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS sender_id uuid NOT NULL;

ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS receiver_id uuid NOT NULL;

ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS text text NOT NULL DEFAULT '';

ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS timestamp timestamp with time zone NOT NULL DEFAULT now();

ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS read boolean NOT NULL DEFAULT false;

-- Aggiungi le chiavi esterne se non esistono
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_message_sender' AND conrelid = 'public.messages'::regclass) THEN
        ALTER TABLE public.messages
        ADD CONSTRAINT fk_message_sender
        FOREIGN KEY (sender_id)
        REFERENCES auth.users (id)
        ON DELETE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_message_receiver' AND conrelid = 'public.messages'::regclass) THEN
        ALTER TABLE public.messages
        ADD CONSTRAINT fk_message_receiver
        FOREIGN KEY (receiver_id)
        REFERENCES auth.users (id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- Crea RLS policies
CREATE POLICY "Allow authenticated users to send messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Allow authenticated users to view their messages"
ON public.messages
FOR SELECT
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- ====================================================================================================
-- Configurazione della tabella 'notifications' (usata in UserProfileWalletPage)
-- ====================================================================================================

-- Abilita RLS sulla tabella notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Rimuovi le policy esistenti per evitare conflitti durante la ricreazione
DROP POLICY IF EXISTS "Allow authenticated users to insert their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow authenticated users to view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow authenticated users to update their own notifications" ON public.notifications;

-- Aggiungi colonne con NOT NULL e DEFAULT dove appropriato
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS message text NOT NULL DEFAULT '';

ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS timestamp timestamp with time zone NOT NULL DEFAULT now();

ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS read boolean NOT NULL DEFAULT false;

ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL;

-- Aggiungi la chiave esterna se non esiste
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_notification_user' AND conrelid = 'public.notifications'::regclass) THEN
        ALTER TABLE public.notifications
        ADD CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id)
        REFERENCES auth.users (id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- Crea RLS policies
CREATE POLICY "Allow authenticated users to insert their own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to view their own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to update their own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- ====================================================================================================
-- Configurazione della tabella 'transactions' (usata in UserProfileWalletPage)
-- ====================================================================================================

-- Abilita RLS sulla tabella transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Rimuovi le policy esistenti per evitare conflitti durante la ricreazione
DROP POLICY IF EXISTS "Allow authenticated users to insert their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow authenticated users to view their own transactions" ON public.transactions;

-- Aggiungi colonne con NOT NULL e DEFAULT dove appropriato
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';

ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS amount numeric NOT NULL DEFAULT 0;

ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'debit'; -- 'credit' o 'debit'

ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS date date NOT NULL DEFAULT CURRENT_DATE;

ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL;

-- Aggiungi la chiave esterna se non esiste
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_transaction_user' AND conrelid = 'public.transactions'::regclass) THEN
        ALTER TABLE public.transactions
        ADD CONSTRAINT fk_transaction_user
        FOREIGN KEY (user_id)
        REFERENCES auth.users (id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- Crea RLS policies
CREATE POLICY "Allow authenticated users to insert their own transactions"
ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to view their own transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);