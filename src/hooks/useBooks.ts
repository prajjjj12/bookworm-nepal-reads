import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Book } from '@/contexts/CartContext';

export const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBooks(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const getBooksByGenre = (genre: string) => {
    return books.filter(book => book.genre === genre);
  };

  const getRecentBooks = (limit = 10) => {
    return books.slice(0, limit);
  };

  const searchBooks = (query: string) => {
    if (!query.trim()) return books;
    
    return books.filter(book => 
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      book.author.toLowerCase().includes(query.toLowerCase()) ||
      book.genre.toLowerCase().includes(query.toLowerCase())
    );
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredBooks = searchQuery ? searchBooks(searchQuery) : books;

  return {
    books: filteredBooks,
    allBooks: books,
    loading,
    error,
    searchQuery,
    getBooksByGenre: (genre: string) => {
      const booksToFilter = searchQuery ? searchBooks(searchQuery) : books;
      return booksToFilter.filter(book => book.genre === genre);
    },
    getRecentBooks: (limit = 10) => {
      const booksToFilter = searchQuery ? searchBooks(searchQuery) : books;
      return booksToFilter.slice(0, limit);
    },
    handleSearch,
    refetch: fetchBooks
  };
};