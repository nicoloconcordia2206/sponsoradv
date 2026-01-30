CREATE POLICY "Investors can update pitch status and set investor_id" ON public.investments
FOR UPDATE TO authenticated
USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'Investitore'))
WITH CHECK (investor_id IS NULL OR investor_id = auth.uid());