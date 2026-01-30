CREATE POLICY "Funders can update sponsorship request status and set funder_id" ON public.sponsorship_requests
FOR UPDATE TO authenticated
USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('Investitore', 'Azienda', 'Influencer')))
WITH CHECK (funder_id IS NULL OR funder_id = auth.uid());