-- Fix the admin_users RLS policy to allow authentication
DROP POLICY IF EXISTS "Admin users are not publicly accessible" ON public.admin_users;

-- Create a policy that allows reading for authentication purposes
CREATE POLICY "Allow admin authentication" 
ON public.admin_users 
FOR SELECT 
USING (true);

-- Ensure we have an admin user
INSERT INTO public.admin_users (username, password) 
VALUES ('admin', 'admin123')
ON CONFLICT (username) DO UPDATE 
SET password = 'admin123';