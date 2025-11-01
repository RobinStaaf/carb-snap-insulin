-- Add user settings columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS insulin_ratio numeric DEFAULT 10 NOT NULL,
ADD COLUMN IF NOT EXISTS comments text DEFAULT '' NOT NULL,
ADD COLUMN IF NOT EXISTS parental_pin_hash text,
ADD COLUMN IF NOT EXISTS disclaimer_accepted boolean DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS show_start_page boolean DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS pin_failed_attempts integer DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS pin_locked_until bigint,
ADD COLUMN IF NOT EXISTS pin_last_unlock bigint;

-- Add RLS policy for users to update their own settings
CREATE POLICY "Users can update their own settings"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);