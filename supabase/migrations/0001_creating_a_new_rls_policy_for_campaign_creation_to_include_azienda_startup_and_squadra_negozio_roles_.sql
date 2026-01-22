CREATE POLICY "Companies can create campaigns." ON public.campaigns
FOR INSERT TO authenticated WITH CHECK (
  (
    (SELECT profiles.role FROM profiles WHERE (profiles.id = auth.uid())) = 'Azienda/Startup'::text
    OR
    (SELECT profiles.role FROM profiles WHERE (profiles.id = auth.uid())) = 'Squadra/Negozio'::text
  )
  AND (auth.uid() = user_id)
);