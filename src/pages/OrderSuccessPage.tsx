import { CheckCircle, Home, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { useNavigate, useLocation } from 'react-router-dom';

export const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderNumber, total } = location.state || {};

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">Order Placed Successfully!</h1>
            <p className="text-muted-foreground">
              Thank you for your order. We'll contact you soon to confirm delivery details.
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Order Number:</span>
                  <span className="font-semibold">{orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-semibold">Rs. {total?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span>Cash on Delivery</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-yellow-600 font-medium">Pending</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-accent/20 p-6 rounded-lg mb-8">
            <h3 className="font-semibold mb-2">What happens next?</h3>
            <ul className="text-sm text-muted-foreground text-left space-y-2">
              <li>• We'll contact you within 24 hours to confirm your order</li>
              <li>• Your books will be packed and shipped within 2-3 business days</li>
              <li>• You'll receive a call when your order is out for delivery</li>
              <li>• Pay the delivery person when you receive your books</li>
            </ul>
          </div>

          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/')} className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Continue Shopping
            </Button>
            <Button variant="outline" onClick={() => navigate('/cart')} className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              View Cart
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};