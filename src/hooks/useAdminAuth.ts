import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing admin session
    const adminSession = localStorage.getItem('adminSession');
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession);
        const now = Date.now();
        // Check if session is valid (24 hours)
        if (session.expires > now) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('adminSession');
        }
      } catch {
        localStorage.removeItem('adminSession');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('Login attempt:', { username, password });

      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .maybeSingle();

      console.log('Database query result:', { adminUser, error });

      if (error || !adminUser) {
        console.log('Login failed - no matching user found');
        return false;
      }

      // Create session (valid for 24 hours)
      const session = {
        userId: adminUser.id,
        username: adminUser.username,
        expires: Date.now() + (24 * 60 * 60 * 1000)
      };
      
      localStorage.setItem('adminSession', JSON.stringify(session));
      setIsAuthenticated(true);
      console.log('Login successful');
      return true;
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('adminSession');
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout
  };
};