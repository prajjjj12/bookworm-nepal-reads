import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Book, useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

interface BookCardProps {
  book: Book;
}

const getGenreColor = (genre: string) => {
  switch (genre.toLowerCase()) {
    case 'fiction':
      return 'genre-fiction';
    case 'non-fiction':
      return 'genre-non-fiction';
    case 'school textbooks':
      return 'genre-textbooks';
    case 'self-help & motivational':
      return 'genre-self-help';
    case "children's books":
      return 'genre-children';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
};

export const BookCard = ({ book }: BookCardProps) => {
  const { dispatch } = useCart();

  const handleAddToCart = () => {
    dispatch({ type: 'ADD_TO_CART', payload: book });
    toast.success(`"${book.title}" added to cart`);
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
      <CardContent className="p-4 flex-1">
        <div className="aspect-[3/4] bg-muted rounded-md mb-3 flex items-center justify-center">
          {book.cover_image ? (
            <img 
              src={book.cover_image} 
              alt={book.title}
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-2">📚</div>
              <div className="text-xs">No Image</div>
            </div>
          )}
        </div>
        
        <Badge className={`genre-tag ${getGenreColor(book.genre)} mb-2`}>
          {book.genre}
        </Badge>
        
        <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2 min-h-[2.5rem]">
          {book.title}
        </h3>
        
        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
          by {book.author}
        </p>
        
        <p className="text-lg font-bold text-primary">
          Rs. {book.price.toLocaleString()}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleAddToCart}
          className="w-full flex items-center gap-2 group-hover:bg-primary/90"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};