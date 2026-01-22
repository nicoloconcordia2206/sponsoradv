-- Tabella 'profiles' per salvare il ruolo dell'utente
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    role TEXT CHECK (role IN ('Azienda', 'Influencer', 'Squadra/Negozio', 'Investitore')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Politiche RLS per 'profiles'
-- Gli utenti possono vedere il proprio profilo
CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
-- Gli utenti possono creare il proprio profilo (al momento della registrazione)
CREATE POLICY "Users can create their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
-- Gli utenti possono aggiornare il proprio profilo
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);


-- Tabella 'campaigns' per i brief video delle aziende
CREATE TABLE public.campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    budget NUMERIC NOT NULL,
    company TEXT,
    deadline DATE,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Politiche RLS per 'campaigns'
-- Tutti possono vedere le campagne disponibili
CREATE POLICY "All users can view campaigns." ON public.campaigns FOR SELECT USING (TRUE);
-- Solo le aziende possono creare campagne
CREATE POLICY "Companies can create campaigns." ON public.campaigns FOR INSERT WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Azienda' AND auth.uid() = user_id);
-- Solo le aziende proprietarie possono aggiornare le proprie campagne
CREATE POLICY "Owners can update their campaigns." ON public.campaigns FOR UPDATE USING (auth.uid() = user_id);
-- Solo le aziende proprietarie possono eliminare le proprie campagne
CREATE POLICY "Owners can delete their campaigns." ON public.campaigns FOR DELETE USING (auth.uid() = user_id);


-- Tabella 'proposals' per le candidature degli influencer
CREATE TABLE public.proposals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_brief_id UUID REFERENCES public.campaigns ON DELETE CASCADE NOT NULL,
    jobTitle TEXT NOT NULL,
    socialLink TEXT,
    status TEXT CHECK (status IN ('Inviata', 'Accettata', 'Rifiutata')) DEFAULT 'Inviata' NOT NULL,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Politiche RLS per 'proposals'
-- Gli influencer possono vedere le proprie proposte
CREATE POLICY "Influencers can view their own proposals." ON public.proposals FOR SELECT USING (auth.uid() = user_id);
-- Le aziende possono vedere le proposte per le proprie campagne
CREATE POLICY "Companies can view proposals for their campaigns." ON public.proposals FOR SELECT USING (EXISTS (SELECT 1 FROM public.campaigns WHERE id = job_brief_id AND user_id = auth.uid()));
-- Solo gli influencer possono creare proposte
CREATE POLICY "Influencers can create proposals." ON public.proposals FOR INSERT WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Influencer' AND auth.uid() = user_id);
-- Le aziende proprietarie della campagna possono aggiornare lo stato delle proposte
CREATE POLICY "Companies can update proposal status." ON public.proposals FOR UPDATE USING (EXISTS (SELECT 1 FROM public.campaigns WHERE id = job_brief_id AND user_id = auth.uid()));
-- Gli influencer possono eliminare le proprie proposte (se non accettate)
CREATE POLICY "Influencers can delete their own proposals." ON public.proposals FOR DELETE USING (auth.uid() = user_id AND status = 'Inviata');


-- Tabella 'sponsorship_requests' per le richieste di fondi di squadre e negozi
CREATE TABLE public.sponsorship_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    amountNeeded NUMERIC NOT NULL,
    purpose TEXT,
    city TEXT,
    zip TEXT,
    organization TEXT,
    status TEXT CHECK (status IN ('Attiva', 'Finanziata')) DEFAULT 'Attiva' NOT NULL,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Politiche RLS per 'sponsorship_requests'
-- Tutti possono vedere le richieste di sponsorizzazione
CREATE POLICY "All users can view sponsorship requests." ON public.sponsorship_requests FOR SELECT USING (TRUE);
-- Solo Squadre/Negozi possono creare richieste
CREATE POLICY "Teams/Shops can create sponsorship requests." ON public.sponsorship_requests FOR INSERT WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Squadra/Negozio' AND auth.uid() = user_id);
-- Solo i proprietari possono aggiornare le proprie richieste
CREATE POLICY "Owners can update their sponsorship requests." ON public.sponsorship_requests FOR UPDATE USING (auth.uid() = user_id);
-- Solo i proprietari possono eliminare le proprie richieste
CREATE POLICY "Owners can delete their sponsorship requests." ON public.sponsorship_requests FOR DELETE USING (auth.uid() = user_id);


-- Tabella 'investments' per le idee di business e le quote offerte
CREATE TABLE public.investments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    sector TEXT,
    description TEXT,
    roi TEXT, -- Potrebbe essere un valore calcolato o una stima
    capital NUMERIC NOT NULL,
    equity NUMERIC NOT NULL,
    status TEXT CHECK (status IN ('Disponibile', 'In Trattativa', 'Finanziata')) DEFAULT 'Disponibile' NOT NULL,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Politiche RLS per 'investments'
-- Tutti possono vedere le opportunità di investimento
CREATE POLICY "All users can view investments." ON public.investments FOR SELECT USING (TRUE);
-- Solo le aziende possono creare opportunità di investimento
CREATE POLICY "Companies can create investments." ON public.investments FOR INSERT WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Azienda' AND auth.uid() = user_id);
-- Solo i proprietari possono aggiornare le proprie opportunità
CREATE POLICY "Owners can update their investments." ON public.investments FOR UPDATE USING (auth.uid() = user_id);
-- Solo i proprietari possono eliminare le proprie opportunità
CREATE POLICY "Owners can delete their investments." ON public.investments FOR DELETE USING (auth.uid() = user_id);


-- Tabella 'messages' per la chat interna
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read BOOLEAN DEFAULT FALSE
);

-- Politiche RLS per 'messages'
-- Gli utenti possono vedere i messaggi in cui sono mittenti o destinatari
CREATE POLICY "Users can view their own messages." ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
-- Gli utenti possono inviare messaggi
CREATE POLICY "Users can send messages." ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
-- Gli utenti possono marcare come letti i messaggi che hanno ricevuto
CREATE POLICY "Users can mark received messages as read." ON public.messages FOR UPDATE USING (auth.uid() = receiver_id);