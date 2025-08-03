-- Completely fix the RLS policies for orders
-- First drop all existing policies on orders table
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Orders are not publicly readable" ON public.orders;

-- Disable RLS temporarily to clear any conflicts
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS  
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create a simple permissive INSERT policy that allows anyone to create orders
CREATE POLICY "Allow order creation" 
ON public.orders 
FOR INSERT 
TO public
WITH CHECK (true);

-- Keep reading restricted for privacy
CREATE POLICY "Restrict order reading" 
ON public.orders 
FOR SELECT 
TO public
USING (false);