CREATE POLICY "Allow support bot to send messages" ON public.messages
FOR INSERT
WITH CHECK (sender_id = '00000000-0000-0000-0000-000000000001');