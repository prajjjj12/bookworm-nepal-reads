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
      // Hash the password for comparison
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .eq('password_hash', hashHex)
        .single();

      if (error || !adminUser) {
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