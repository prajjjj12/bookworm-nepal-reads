import { BookCard } from '@/components/BookCard';
import { Book } from '@/contexts/CartContext';

interface CategorySectionProps {
  title: string;
  books: Book[];
  showAll?: boolean;
}

export const CategorySection = ({ title, books, showAll = false }: CategorySectionProps) => {
  const displayBooks = showAll ? books : books.slice(0, 5);

  if (books.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <span className="text-sm text-muted-foreground">
          {books.length} {books.length === 1 ? 'book' : 'books'}
        </span>
      </div>
      
      <div className="book-grid">
        {displayBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
      
      {!showAll && books.length > 5 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Showing 5 of {books.length} books
          </p>
        </div>
      )}
    </section>
  );
};