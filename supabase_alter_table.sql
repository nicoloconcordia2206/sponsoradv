-- 1. Elimina il constraint esistente
ALTER TABLE public.profiles
DROP CONSTRAINT profiles_role_check;

-- 2. Ricrea il constraint con tutti i ruoli validi, incluso 'Investitore'
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('Azienda', 'Squadra', 'Influencer', 'Investitore'));