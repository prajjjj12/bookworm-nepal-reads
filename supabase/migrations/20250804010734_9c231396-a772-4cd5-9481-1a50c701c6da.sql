-- Update admin user with the correct SHA-256 hash that matches what the code generates
UPDATE public.admin_users 
SET password_hash = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'
WHERE username = 'admin';

-- Also use maybeSingle to avoid the .single() error
-- This query is just to verify the update worked
SELECT username, password_hash FROM admin_users WHERE username = 'admin';