-- Temporarily disable RLS for orders to allow checkout functionality
-- This is for an e-commerce demo without authentication
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;