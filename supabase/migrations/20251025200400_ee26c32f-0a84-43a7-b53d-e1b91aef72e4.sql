-- Create a table to track app starts
CREATE TABLE public.app_statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.app_statistics ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view all statistics
CREATE POLICY "Admins can view all statistics" 
ON public.app_statistics 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Create policy for users to insert their own statistics
CREATE POLICY "Users can insert their own statistics" 
ON public.app_statistics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX idx_app_statistics_created_at ON public.app_statistics(created_at);
CREATE INDEX idx_app_statistics_event_type ON public.app_statistics(event_type);