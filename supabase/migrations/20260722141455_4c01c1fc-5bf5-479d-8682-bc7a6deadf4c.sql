DROP POLICY IF EXISTS "Users can update their own settings" ON public.profiles;
CREATE POLICY "Users can update their own settings" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id AND status = 'approved'::user_status)
WITH CHECK (auth.uid() = id AND status = 'approved'::user_status);