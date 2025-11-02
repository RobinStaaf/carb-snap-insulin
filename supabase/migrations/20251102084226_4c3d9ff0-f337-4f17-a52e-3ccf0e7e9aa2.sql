-- Create membership applications table
CREATE TABLE public.membership_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.membership_applications ENABLE ROW LEVEL SECURITY;

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
ON public.membership_applications
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can update applications
CREATE POLICY "Admins can update applications"
ON public.membership_applications
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Anyone can insert an application (public endpoint)
CREATE POLICY "Anyone can submit applications"
ON public.membership_applications
FOR INSERT
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_membership_applications_status ON public.membership_applications(status);
CREATE INDEX idx_membership_applications_email ON public.membership_applications(email);