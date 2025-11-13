import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface User {
  id: string;
  username: string;
  email: string;
  tenant: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    authenticated: false,
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthState({ user: null, loading: false, authenticated: false });
        return;
      }

      const response = await fetch('/api/v1/identity/accounts/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const user = await response.json();
        setAuthState({ user, loading: false, authenticated: true });
      } else {
        localStorage.removeItem('token');
        setAuthState({ user: null, loading: false, authenticated: false });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({ user: null, loading: false, authenticated: false });
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/v1/identity/accounts/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        await checkAuth();
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({ user: null, loading: false, authenticated: false });
    router.push('/login');
  };

  return {
    ...authState,
    login,
    logout,
    checkAuth,
  };
}

