-- 1. Elimina il constraint esistente (sostituisci 'profiles_role_check' con il nome effettivo se diverso)
ALTER TABLE public.profiles
DROP CONSTRAINT profiles_role_check;

-- 2. Ricrea il constraint con i valori esatti che il tuo frontend invia
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('Azienda', 'Squadra', 'Influencer', 'Investitore'));