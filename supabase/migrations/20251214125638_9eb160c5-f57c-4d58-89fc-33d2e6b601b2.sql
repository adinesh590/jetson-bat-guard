-- Add new columns to battery_logs table
ALTER TABLE public.battery_logs 
ADD COLUMN soh numeric NULL,
ADD COLUMN mosfet_states text NULL,
ADD COLUMN cycle_count integer NULL;