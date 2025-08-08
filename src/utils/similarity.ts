import { Book } from '@/contexts/CartContext';

// Cosine similarity function
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

// Get all unique genres from books to create consistent feature vectors
const GENRES = [
  'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy',
  'Biography', 'History', 'Self-Help', 'Poetry', 'Horror', 'Children', 'Textbook', 'Science'
];

// Price ranges for feature encoding
const PRICE_RANGES = [
  { min: 0, max: 500 },
  { min: 500, max: 1000 },
  { min: 1000, max: 1500 },
  { min: 1500, max: 2000 },
  { min: 2000, max: Infinity }
];

// Create feature vector for a book
export function createBookVector(book: Book): number[] {
  const vector: number[] = [];
  
  // Genre features (one-hot encoding)
  GENRES.forEach(genre => {
    vector.push(book.genre === genre ? 1 : 0);
  });
  
  // Price range features (one-hot encoding)
  PRICE_RANGES.forEach(range => {
    vector.push(book.price >= range.min && book.price < range.max ? 1 : 0);
  });
  
  // Title length feature (normalized)
  vector.push(book.title.length / 100); // Normalize by dividing by 100
  
  // Author name length feature (normalized)
  vector.push(book.author.length / 50); // Normalize by dividing by 50
  
  return vector;
}

// Create combined vector from multiple books (for cart items)
export function createCombinedVector(books: Book[]): number[] {
  if (books.length === 0) return [];
  
  const vectors = books.map(createBookVector);
  const combinedVector: number[] = [];
  
  // Average each feature across all books
  for (let i = 0; i < vectors[0].length; i++) {
    const sum = vectors.reduce((acc, vector) => acc + vector[i], 0);
    combinedVector.push(sum / vectors.length);
  }
  
  return combinedVector;
}

// Get book recommendations based on cosine similarity
export function getRecommendationsBySimilarity(
  cartBooks: Book[], 
  allBooks: Book[], 
  limit: number = 5
): Book[] {
  if (cartBooks.length === 0 || allBooks.length === 0) return [];
  
  // Create combined vector from cart items
  const cartVector = createCombinedVector(cartBooks);
  
  // Filter out books already in cart
  const availableBooks = allBooks.filter(book => 
    !cartBooks.some(cartBook => cartBook.id === book.id)
  );
  
  // Calculate similarity scores for each available book
  const similarities = availableBooks.map(book => ({
    book,
    similarity: cosineSimilarity(cartVector, createBookVector(book))
  }));
  
  // Sort by similarity (highest first) and return top recommendations
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map(item => item.book);
}