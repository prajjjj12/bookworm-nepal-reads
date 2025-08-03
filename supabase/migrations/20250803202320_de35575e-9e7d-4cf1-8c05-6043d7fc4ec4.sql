-- Fix RLS policies for orders to allow proper order creation
-- First, drop the restrictive policies
DROP POLICY IF EXISTS "Orders are not publicly readable" ON public.orders;
DROP POLICY IF EXISTS "Order items are not publicly readable" ON public.order_items;

-- Create more permissive policies for order creation
-- Allow anyone to create orders (needed for checkout)
-- But keep reading restricted for privacy

-- Allow order creation without authentication
CREATE POLICY "Anyone can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

-- Allow order item creation without authentication  
CREATE POLICY "Anyone can create order items" 
ON public.order_items 
FOR INSERT 
WITH CHECK (true);

-- Keep reading restricted for privacy
CREATE POLICY "Orders are not publicly readable" 
ON public.orders 
FOR SELECT 
USING (false);

CREATE POLICY "Order items are not publicly readable" 
ON public.order_items 
FOR SELECT 
USING (false);