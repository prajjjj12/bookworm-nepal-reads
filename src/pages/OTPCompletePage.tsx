import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { CheckCircle, ArrowLeft } from 'lucide-react';

const OTPCompletePage = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const signupData = location.state;

  useEffect(() => {
    // Redirect if no signup data
    if (!signupData) {
      navigate('/auth');
    }
  }, [signupData, navigate]);

  const handleCompleteSignup = async () => {
    if (!signupData) return;
    
    setLoading(true);
    
    const { error } = await signUp(
      signupData.email, 
      signupData.password, 
      signupData.name, 
      signupData.phone, 
      signupData.location
    );
    
    if (error) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account Created Successfully!",
        description: "You can now sign in with your credentials.",
      });
      navigate('/auth', { 
        state: { 
          message: "Account created successfully! Please sign in." 
        }
      });
    }
    setLoading(false);
  };

  if (!signupData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/verify-otp', { state: signupData })}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to OTP Verification
          </Button>
          
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Email Verified!</CardTitle>
              <CardDescription>
                Your email has been successfully verified.
                <br />
                Click below to complete your account creation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Account Details:</h4>
                  <p className="text-sm"><strong>Name:</strong> {signupData.name}</p>
                  <p className="text-sm"><strong>Email:</strong> {signupData.email}</p>
                  <p className="text-sm"><strong>Phone:</strong> {signupData.phone}</p>
                  <p className="text-sm"><strong>District:</strong> {signupData.location}</p>
                </div>
                
                <Button 
                  onClick={handleCompleteSignup} 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Complete Account Creation'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default OTPCompletePage;