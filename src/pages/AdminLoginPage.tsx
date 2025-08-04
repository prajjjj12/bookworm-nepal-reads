import { useState, useEffect } from 'react';
import { Lock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export const AdminLoginPage = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, login } = useAdminAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const success = await login(credentials.username, credentials.password);
    
    if (success) {
      toast.success('Login successful!');
      navigate('/admin/dashboard');
    } else {
      toast.error('Invalid username or password');
    }
    
    setSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Bookworm</h1>
          </div>
          <h2 className="text-xl font-semibold text-foreground">Admin Panel</h2>
          <p className="text-muted-foreground">Please login to continue</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Admin Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>

          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button variant="ghost" onClick={() => navigate('/')}>
            Back to Store
          </Button>
        </div>
      </div>
    </div>
  );
};