-- Create control_commands table to store MOSFET control commands
CREATE TABLE public.control_commands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  command_type TEXT NOT NULL,
  mosfet_name TEXT,
  mosfet_state BOOLEAN,
  data JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  executed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.control_commands ENABLE ROW LEVEL SECURITY;

-- Admins and operators can create commands
CREATE POLICY "Admins and operators can create commands"
ON public.control_commands
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operator'::app_role)
);

-- All authenticated users can view commands
CREATE POLICY "All authenticated users can view commands"
ON public.control_commands
FOR SELECT
USING (true);

-- Admins and operators can update command status
CREATE POLICY "Admins and operators can update commands"
ON public.control_commands
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'operator'::app_role)
);

-- Create index for efficient querying
CREATE INDEX idx_control_commands_status ON public.control_commands(status, created_at DESC);
CREATE INDEX idx_control_commands_created_at ON public.control_commands(created_at DESC);