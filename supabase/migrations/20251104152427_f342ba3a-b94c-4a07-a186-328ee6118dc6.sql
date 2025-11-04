-- Add carb adjustment percentage to profiles
ALTER TABLE public.profiles 
ADD COLUMN carb_adjustment_percentage numeric NOT NULL DEFAULT 0 
CHECK (carb_adjustment_percentage >= -50 AND carb_adjustment_percentage <= 50);