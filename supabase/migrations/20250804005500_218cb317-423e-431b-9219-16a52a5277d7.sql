-- Create default admin user with hashed password
-- Password: admin123 (SHA-256 hashed)

INSERT INTO public.admin_users (username, password_hash) 
VALUES ('admin', 'ee3d3654d2b2e25d1c6d0b88b8e84b04cf644ede0b5a1a45e6c99f3e2e7df1f3')
ON CONFLICT (username) DO NOTHING;