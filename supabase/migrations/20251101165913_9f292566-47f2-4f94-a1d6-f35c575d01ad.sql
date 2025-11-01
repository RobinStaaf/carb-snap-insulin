-- Create table for storing meal calculation results
CREATE TABLE public.meal_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  image_url TEXT NOT NULL,
  carbs_estimate NUMERIC NOT NULL,
  insulin_dose NUMERIC NOT NULL,
  insulin_ratio NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own meal logs" 
ON public.meal_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meal logs" 
ON public.meal_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal logs" 
ON public.meal_logs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal logs" 
ON public.meal_logs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX idx_meal_logs_user_timestamp ON public.meal_logs(user_id, timestamp DESC);