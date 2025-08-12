import { Book } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { cosineSimilarity, createBookVector, createCombinedVector } from './similarity';

// Get user's purchase history for content-based recommendations
export async function getUserPurchaseHistory(userId: string): Promise<Book[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        order_items (
          books (*)
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching purchase history:', error);
      return [];
    }

    // Extract unique books from all orders
    const purchasedBooks: Book[] = [];
    const bookIds = new Set<string>();

    data?.forEach(order => {
      order.order_items?.forEach(item => {
        if (item.books && !bookIds.has(item.books.id)) {
          bookIds.add(item.books.id);
          purchasedBooks.push(item.books as Book);
        }
      });
    });

    return purchasedBooks;
  } catch (error) {
    console.error('Error in getUserPurchaseHistory:', error);
    return [];
  }
}

// Get personalized recommendations based on user's purchase history
export function getPersonalizedRecommendations(
  purchaseHistory: Book[], 
  allBooks: Book[], 
  cartBooks: Book[] = [], 
  limit: number = 5
): Book[] {
  if (purchaseHistory.length === 0 || allBooks.length === 0) return [];
  
  // Create combined vector from purchase history
  const historyVector = createCombinedVector(purchaseHistory);
  
  // Filter out books already purchased or in cart
  const excludeIds = new Set([
    ...purchaseHistory.map(book => book.id),
    ...cartBooks.map(book => book.id)
  ]);
  
  const availableBooks = allBooks.filter(book => !excludeIds.has(book.id));
  
  // Calculate similarity scores for each available book
  const similarities = availableBooks.map(book => ({
    book,
    similarity: cosineSimilarity(historyVector, createBookVector(book))
  }));
  
  // Sort by similarity (highest first) and return top recommendations
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map(item => item.book);
}