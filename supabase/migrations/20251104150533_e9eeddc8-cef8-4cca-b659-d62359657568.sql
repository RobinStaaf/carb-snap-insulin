-- Add portion_size column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN portion_size text NOT NULL DEFAULT 'adult';

-- Add a check constraint to ensure only valid values
ALTER TABLE public.profiles
ADD CONSTRAINT portion_size_check CHECK (portion_size IN ('child', 'adult'));