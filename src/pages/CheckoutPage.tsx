import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Header } from '@/components/Header';
import { BookCard } from '@/components/BookCard';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useBooks } from '@/hooks/useBooks';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getRecommendationsBySimilarity, cosineSimilarity, createBookVector, createCombinedVector } from '@/utils/similarity';

const NEPAL_DISTRICTS = [
  'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Chitwan', 'Pokhara', 'Butwal', 'Biratnagar',
  'Janakpur', 'Dharan', 'Birgunj', 'Hetauda', 'Dhangadhi', 'Bharatpur', 'Lumbini',
  'Nepalgunj', 'Gorkha', 'Lamjung', 'Tanahun', 'Syangja', 'Parbat', 'Baglung',
  'Myagdi', 'Mustang', 'Manang', 'Rasuwa', 'Nuwakot', 'Dhading', 'Makwanpur',
  'Sindhuli', 'Ramechhap', 'Dolakha', 'Sindhupalchok', 'Kavrepalanchok'
];

export const CheckoutPage = () => {
  const { state, dispatch } = useCart();
  const { user, profile } = useAuth();
  const { allBooks } = useBooks();
  const navigate = useNavigate();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      toast.error('Please sign in to proceed with checkout');
      navigate('/auth');
      return;
    }
  }, [user, navigate]);
  
  const [formData, setFormData] = useState({
    buyerName: profile?.name || '',
    buyerPhone: profile?.phone || '',
    buyerAddress: '',
    buyerDistrict: profile?.location || ''
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        buyerName: profile.name || prev.buyerName,
        buyerPhone: profile.phone || prev.buyerPhone,
        buyerDistrict: profile.location || prev.buyerDistrict
      }));
    }
  }, [profile]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getRecommendedBooks = async () => {
    if (!user || state.items.length === 0 || allBooks.length === 0) return [];
    
    try {
      // Get user's purchase history
      const { data, error } = await supabase
        .from('orders')
        .select(`
          order_items (
            books (*)
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching purchase history:', error);
        return getRecommendationsBySimilarity(state.items, allBooks, 5);
      }

      // Extract purchased books
      const purchasedBooks: any[] = [];
      const bookIds = new Set<string>();

      data?.forEach(order => {
        order.order_items?.forEach(item => {
          if (item.books && !bookIds.has(item.books.id)) {
            bookIds.add(item.books.id);
            purchasedBooks.push(item.books);
          }
        });
      });

      if (purchasedBooks.length === 0) {
        // No purchase history, use cart-based recommendations
        return getRecommendationsBySimilarity(state.items, allBooks, 5);
      }

      // Use purchase history for recommendations
      const historyVector = createCombinedVector(purchasedBooks);
      
      // Filter out books already purchased or in cart
      const excludeIds = new Set([
        ...purchasedBooks.map(book => book.id),
        ...state.items.map(book => book.id)
      ]);
      
      const availableBooks = allBooks.filter(book => !excludeIds.has(book.id));
      
      // Calculate similarity scores
      const similarities = availableBooks.map(book => ({
        book,
        similarity: cosineSimilarity(historyVector, createBookVector(book))
      }));
      
      return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5)
        .map(item => item.book);
    } catch (error) {
      console.error('Error in getRecommendedBooks:', error);
      return getRecommendationsBySimilarity(state.items, allBooks, 5);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.buyerName || !formData.buyerPhone || !formData.buyerAddress || !formData.buyerDistrict) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate phone number (exactly 10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.buyerPhone)) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Starting order submission...', formData, state);
      
      // Create order
      const orderPayload = {
        buyer_name: formData.buyerName,
        buyer_phone: formData.buyerPhone,
        buyer_address: formData.buyerAddress,
        buyer_district: formData.buyerDistrict,
        total_amount: state.total,
        status: 'Pending',
        user_id: user?.id
      };
      
      console.log('Order payload:', orderPayload);
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();

      console.log('Order creation result:', { orderData, orderError });

      if (orderError) {
        console.error('Order error details:', orderError);
        throw orderError;
      }

      // Create order items
      const orderItems = state.items.map(item => ({
        order_id: orderData.id,
        book_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      console.log('Order items payload:', orderItems);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      console.log('Order items result:', { itemsError });

      if (itemsError) {
        console.error('Items error details:', itemsError);
        throw itemsError;
      }

      // Clear cart and redirect
      dispatch({ type: 'CLEAR_CART' });
      toast.success(`Order ${orderData.order_number} placed successfully!`);
      navigate('/order-success', { 
        state: { 
          orderNumber: orderData.order_number,
          total: state.total 
        } 
      });
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [recommendedBooks, setRecommendedBooks] = useState<any[]>([]);

  useEffect(() => {
    getRecommendedBooks().then(setRecommendedBooks);
  }, [user, state.items, allBooks]);

  if (state.items.length === 0) {
    navigate('/cart');
    return null;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Button>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Delivery Information Form */}
          <div className="col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="buyerName">Full Name *</Label>
                    <Input
                      id="buyerName"
                      value={formData.buyerName}
                      onChange={(e) => handleInputChange('buyerName', e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="buyerPhone">Phone Number *</Label>
                    <Input
                      id="buyerPhone"
                      value={formData.buyerPhone}
                      onChange={(e) => {
                        // Only allow numbers and limit to 10 digits
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        handleInputChange('buyerPhone', value);
                      }}
                      placeholder="9841234567"
                      maxLength={10}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter 10-digit phone number (numbers only)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="buyerDistrict">District *</Label>
                    <Select onValueChange={(value) => handleInputChange('buyerDistrict', value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your district" />
                      </SelectTrigger>
                      <SelectContent>
                        {NEPAL_DISTRICTS.map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="buyerAddress">Full Address *</Label>
                    <Input
                      id="buyerAddress"
                      value={formData.buyerAddress}
                      onChange={(e) => handleInputChange('buyerAddress', e.target.value)}
                      placeholder="Enter your complete address"
                      required
                    />
                  </div>

                  <div className="pt-4">
                    <div className="bg-accent/20 p-4 rounded-md mb-4">
                      <h3 className="font-semibold mb-2">Payment Method</h3>
                      <p className="text-sm text-muted-foreground">
                        ✅ Cash on Delivery (COD) - Pay when you receive your books
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Placing Order...' : `Place Order - Rs. ${state.total.toLocaleString()}`}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.title} x{item.quantity}</span>
                      <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <hr />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>Rs. {state.total.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            {recommendedBooks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📚 Books You May Also Like</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Personalized recommendations based on your purchase history and current cart
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendedBooks.slice(0, 3).map((book) => (
                      <div key={book.id} className="border rounded-md p-3">
                        <div className="flex gap-3">
                          <div className="w-12 h-16 bg-muted rounded flex-shrink-0 flex items-center justify-center">
                            {book.cover_image ? (
                              <img 
                                src={book.cover_image} 
                                alt={book.title}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <span className="text-xs">📚</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium line-clamp-2">{book.title}</h4>
                            <p className="text-xs text-muted-foreground">{book.author}</p>
                            <p className="text-sm font-semibold text-primary">Rs. {book.price.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};