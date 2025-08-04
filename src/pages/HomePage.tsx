import { Header } from '@/components/Header';
import { CategorySection } from '@/components/CategorySection';
import { BookCard } from '@/components/BookCard';
import { useBooks } from '@/hooks/useBooks';

const GENRES = [
  'Fiction',
  'Non-Fiction', 
  'School Textbooks',
  'Self-Help & Motivational',
  "Children's Books"
];

export const HomePage = () => {
  const { books, allBooks, loading, error, searchQuery, getBooksByGenre, getRecentBooks, handleSearch } = useBooks();

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
      <Header onSearch={handleSearch} />
      
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

        {/* Search Results */}
        {searchQuery ? (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Search Results for "{searchQuery}"
            </h2>
            {books.length > 0 ? (
              <div className="book-grid">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No books found matching your search.</p>
              </div>
            )}
          </section>
        ) : (
          <>
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
          </>
        )}

        {allBooks.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No books available</h3>
            <p className="text-muted-foreground">
              Please check back later or contact the administrator to add books.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 border-t mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              For any inquiries: <span className="font-medium">014459394</span> | 
              Email: <span className="font-medium">support@bookworm.com</span>
            </p>
            <p>© 2024 Bookworm Nepal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};