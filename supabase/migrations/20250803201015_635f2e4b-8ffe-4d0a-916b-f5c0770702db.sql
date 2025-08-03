-- Create books table
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  genre TEXT NOT NULL CHECK (genre IN ('Fiction', 'Non-Fiction', 'School Textbooks', 'Self-Help & Motivational', 'Children''s Books')),
  price DECIMAL(10,2) NOT NULL,
  cover_image TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE DEFAULT 'ORD-' || substr(gen_random_uuid()::text, 1, 8),
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  buyer_address TEXT NOT NULL,
  buyer_district TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Shipped', 'Delivered')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_users table
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for books (public read access)
CREATE POLICY "Books are viewable by everyone" 
ON public.books 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can modify books" 
ON public.books 
FOR ALL 
USING (false);

-- Create policies for orders (public can create, no read access for now)
CREATE POLICY "Anyone can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Orders are not publicly readable" 
ON public.orders 
FOR SELECT 
USING (false);

-- Create policies for order_items (public can create)
CREATE POLICY "Anyone can create order items" 
ON public.order_items 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Order items are not publicly readable" 
ON public.order_items 
FOR SELECT 
USING (false);

-- Create policies for admin_users (no public access)
CREATE POLICY "Admin users are not publicly accessible" 
ON public.admin_users 
FOR ALL 
USING (false);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample books
INSERT INTO public.books (title, author, genre, price, description) VALUES
-- Fiction
('Palpasa Café', 'Narayan Wagle', 'Fiction', 450.00, 'A love story set during the Maoist insurgency in Nepal'),
('Seto Dharti', 'Amar Neupane', 'Fiction', 380.00, 'A classic Nepali novel about rural life and social change'),
('Shirishko Phool', 'Parijat', 'Fiction', 320.00, 'A timeless Nepali literary masterpiece'),
('China Harayeko Manchhe', 'Hari Bansha Acharya', 'Fiction', 400.00, 'A humorous take on Nepali society and relationships'),
('The Alchemist', 'Paulo Coelho', 'Fiction', 650.00, 'A philosophical novel about following your dreams'),

-- Non-Fiction
('Khalangama Hamala', 'Radha Paudel', 'Non-Fiction', 550.00, 'A powerful memoir about resilience and social change'),
('Antarmanko Yatra', 'Jagadish Ghimire', 'Non-Fiction', 480.00, 'A spiritual journey of self-discovery'),
('I Am Malala', 'Malala Yousafzai', 'Non-Fiction', 720.00, 'The story of the girl who stood up for education'),
('Sapiens', 'Yuval Noah Harari', 'Non-Fiction', 890.00, 'A brief history of humankind'),
('Bhagavad Gita (Nepali Translation)', 'Translated by Krishna Uprety', 'Non-Fiction', 420.00, 'Ancient wisdom in Nepali language'),

-- School Textbooks
('Mathematics Grade 12', 'CDC Nepal', 'School Textbooks', 350.00, 'Official textbook for Grade 12 Mathematics'),
('Science Grade 10', 'NEB Curriculum', 'School Textbooks', 280.00, 'Comprehensive science textbook for Grade 10'),
('Nepali Grade 9', 'CDC Nepal', 'School Textbooks', 250.00, 'Nepali language textbook for Grade 9'),
('English Compulsory Grade 11', 'NEB', 'School Textbooks', 300.00, 'English textbook for Grade 11 students'),
('Moral Education Grade 8', 'CDC', 'School Textbooks', 180.00, 'Moral education curriculum for Grade 8'),

-- Self-Help & Motivational
('Aatmagyan', 'Yogi Vikashananda', 'Self-Help & Motivational', 380.00, 'Spiritual wisdom and self-realization'),
('Jeet ko Rahashya', 'Shiv Khera (Nepali)', 'Self-Help & Motivational', 450.00, 'Secrets of success in Nepali'),
('The Subtle Art of Not Giving a F*ck', 'Mark Manson', 'Self-Help & Motivational', 680.00, 'A counterintuitive approach to living a good life'),
('Think and Grow Rich', 'Napoleon Hill', 'Self-Help & Motivational', 520.00, 'Classic book on wealth and success'),
('Gauri - Biography of Dr. Sanduk Ruit', 'Various Authors', 'Self-Help & Motivational', 620.00, 'Inspiring biography of a Nepali eye surgeon'),

-- Children's Books
('Kopila', 'Gorkhapatra Magazine', 'Children''s Books', 150.00, 'Collection of stories for children'),
('Pancha Tantra Stories', 'Nepali adaptation', 'Children''s Books', 220.00, 'Traditional moral stories for kids'),
('Thulo Manche', 'Neelam Karki Niharika', 'Children''s Books', 280.00, 'Inspiring stories for young readers'),
('Bani Ramro Banau', 'Various Authors', 'Children''s Books', 180.00, 'Moral stories in simple Nepali'),
('The Very Hungry Caterpillar', 'Eric Carle', 'Children''s Books', 450.00, 'Classic children''s picture book');

-- Insert default admin user (username: admin, password: admin123)
INSERT INTO public.admin_users (username, password_hash) VALUES
('admin', '$2b$10$8K1p/dHbvq0eQ5pR3sA5COZtFgJm5HJ0rR2aMcx9V5KlLjz4Oe4lC');