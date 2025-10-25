-- Add status column to profiles table
CREATE TYPE public.user_status AS ENUM ('pending', 'approved', 'declined');

ALTER TABLE public.profiles 
ADD COLUMN status user_status NOT NULL DEFAULT 'pending';

-- Update the handle_new_user function to set status to pending by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, status)
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'pending'
  );
  
  -- Assign 'user' role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$function$;

-- Update RLS policies to only allow approved users to access the app
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id AND status = 'approved');

-- Add policy for admins to update user status
CREATE POLICY "Admins can update user status" 
ON public.profiles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));