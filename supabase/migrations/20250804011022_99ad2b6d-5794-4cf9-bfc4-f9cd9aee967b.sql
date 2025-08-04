-- Update admin user to use plaintext password for simplicity
UPDATE public.admin_users 
SET password_hash = 'admin123'
WHERE username = 'admin';

-- Rename the column to be more accurate
ALTER TABLE public.admin_users 
RENAME COLUMN password_hash TO password;