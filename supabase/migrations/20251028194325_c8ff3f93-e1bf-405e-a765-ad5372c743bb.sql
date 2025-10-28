-- Add login_count column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN login_count integer DEFAULT 0 NOT NULL;

-- Update the trigger function to increment login_count
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET last_login = now(),
      login_count = COALESCE(login_count, 0) + 1
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;