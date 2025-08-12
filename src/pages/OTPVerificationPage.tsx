import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { ArrowLeft } from 'lucide-react';

const OTPVerificationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const email = location.state?.email || '';
  const phone = location.state?.phone || '';

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      navigate('/');
      return;
    }

    // Redirect if no email in state (direct access)
    if (!email) {
      navigate('/auth');
      return;
    }
  }, [user, email, navigate]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simple OTP validation - always 1234 for this test project
    if (otp !== '1234') {
      toast({
        title: "Invalid OTP",
        description: "Please enter the correct OTP.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // OTP verified, proceed to complete signup
    toast({
      title: "OTP Verified!",
      description: "Redirecting to complete your account...",
    });

    // Redirect to completion page with all signup data
    navigate('/complete-signup', { 
      state: location.state
    });
    setLoading(false);
  };

  const handleResendOTP = () => {
    toast({
      title: "OTP Resent",
      description: "A new OTP has been sent to your email.",
    });
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/auth')}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign Up
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle>Verify Your Account</CardTitle>
              <CardDescription>
                We've sent a verification code to your email:
                <br />
                <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    value={otp}
                    onChange={(e) => {
                      // Only allow numbers and limit to 4 digits
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setOtp(value);
                    }}
                    placeholder="Enter code"
                    maxLength={4}
                    className="text-center text-2xl font-mono tracking-widest"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the 4-digit code sent to your email
                  </p>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading || otp.length !== 4}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
                
                <div className="text-center">
                  <Button 
                    type="button" 
                    variant="link" 
                    onClick={handleResendOTP}
                    className="text-sm"
                  >
                    Didn't receive the code? Resend OTP
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default OTPVerificationPage;