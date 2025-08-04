import { Header } from '@/components/Header';
import { CategorySection } from '@/components/CategorySection';
import { useBooks } from '@/hooks/useBooks';

const GENRES = [
  'Fiction',
  'Non-Fiction', 
  'School Textbooks',
  'Self-Help & Motivational',
  "Children's Books"
];

export const HomePage = () => {
  const { books, loading, error, getBooksByGenre, getRecentBooks } = useBooks();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading books...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-destructive">Error loading books: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  const recentBooks = getRecentBooks(5);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to Bookworm Nepal
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover your next great read from our collection of Nepali and international books. 
            From classic literature to educational textbooks, we have something for every reader.
          </p>
        </section>

        {/* Recently Published Section */}
        {recentBooks.length > 0 && (
          <CategorySection 
            title="📚 Recently Published" 
            books={recentBooks}
          />
        )}

        {/* Category Sections */}
        {GENRES.map(genre => {
          const categoryBooks = getBooksByGenre(genre);
          return (
            <CategorySection 
              key={genre}
              title={genre}
              books={categoryBooks}
            />
          );
        })}

        {books.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No books available</h3>
            <p className="text-muted-foreground">
              Please check back later or contact the administrator to add books.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};