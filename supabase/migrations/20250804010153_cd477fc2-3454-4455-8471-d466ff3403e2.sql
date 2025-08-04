-- Update admin user with correct SHA-256 hash for password 'admin123'
UPDATE public.admin_users 
SET password_hash = 'ee3d3654d2b2e25d1c6d0b88b8e84b04cf644ede0b5a1a45e6c99f3e2e7df1f3'
WHERE username = 'admin';