import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import env from '../config/env';
import { useHttpResponse } from './ResponseNotifier';

interface AuthContextType {
  token: string | null;
  user: User | null;
  latestProvider: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  register: (credentials: RegisterCredentials) => Promise<LoginResult>;
  profile: (token: string) => Promise<LoginResult>;

  logout: () => void;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResult {
  success: boolean;
  error?: string;
}

interface RegisterCredentials extends LoginCredentials {
  name: string;
  workspaceName?: string;
}

export type User = Omit<RegisterCredentials, 'password'> & { id: string, workspaceId: string, provider: 'google' | 'facebook' | 'password' };

interface AuthProviderProps {
  children: ReactNode;
}

// Create the Authentication Context with a default value
const AuthContext = createContext<AuthContextType | null>(null);

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { notify } = useHttpResponse();
 
  // State to hold JWT token
  const [token, setToken] = useState<string | null>(null);
  // State to hold User non-sensitive data
  const [user, setUser] = useState<User | null>(null);
  // State to track if user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  // Optional loading state for initial auth check
  const [loading, setLoading] = useState<boolean>(true);
  // State to track latest provider
  const [latestProvider, setLatestProvider] = useState<string | null>(null);

  // On component mount, check if token exists in localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('app:auth-token');
    const storedUser = JSON.parse(localStorage.getItem('app:user') as string) as User;
    const latestProvider = localStorage.getItem('app:latest-provider') || null;

    if (storedToken || storedUser) {
      setToken(storedToken);
      setUser(storedUser);
      setIsAuthenticated(true);
    }

    setLatestProvider(latestProvider);
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<LoginResult> => {
    try {
      setLoading(true);
      const response = await fetch(`${env.API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      notify('Login successful!', 'success');

      const { token: newToken } = data.data;
      const userData: User = data.data.user;

      // Store token in localStorage
      localStorage.setItem('app:auth-token', newToken);
      // Store user in localStorage
      localStorage.setItem('app:user', JSON.stringify(userData));
      // Store latest provider in localStorage
      localStorage.setItem('app:latest-provider', userData.provider);

      // Update state
      setToken(newToken);
      setUser(userData);
      setLatestProvider(userData.provider);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      notify(error instanceof Error ? error.message : "", 'error');

      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<LoginResult> => {
    try {
      setLoading(true);
      const response = await fetch(`${env.API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      notify('Succesful registration!', 'success');
      const { token: newToken } = data.data;
      const userData: User = data.data.user;

      // Store token in localStorage
      localStorage.setItem('app:auth-token', newToken);
      // Store user in localStorage
      localStorage.setItem('app:user', JSON.stringify(userData));
      // Store latest provider in localStorage
      localStorage.setItem('app:latest-provider', userData.provider);

      // Update state
      setToken(newToken);
      setUser(userData);
      setLatestProvider(userData.provider);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      notify(error instanceof Error ? error.message : '', 'error');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      };
    } finally {
      setLoading(false);
    }
  };

  const profile = async (token: string): Promise<LoginResult> => {
    try {
      setLoading(true);
      let response = await fetch(`${env.API_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const userData: User = data.data;

      // Store token in localStorage
      localStorage.setItem('app:auth-token', token);
      // Store user in localStorage
      localStorage.setItem('app:user', JSON.stringify(userData));
      // Store latest provider in localStorage
      localStorage.setItem('app:latest-provider', userData.provider);

      // Update state
      setToken(token);
      setUser(userData);
      setLatestProvider(userData.provider);
      setIsAuthenticated(true);

      return { success: true };

    } catch (error) {
      notify(error instanceof Error ? error.message : '', 'error');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      };
    } finally {
      setLoading(false);
    }
  } 

  // Logout function - clears token and resets state
  const logout = async (): Promise<LoginResult> => {
    if (!token) {
      return { 
        success: false, 
        error: 'You are not logged in!' 
      };
    }

    try {
      setLoading(true);
      const response = await fetch(`${env.API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      notify('Succesful logout!', 'success');
      // Remove token and user from localStorage
      localStorage.removeItem('app:auth-token');
      localStorage.removeItem('app:user');
      
      // Reset state
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);

      return { success: true };
    
    } catch(error) {
      notify(error instanceof Error ? error.message : '', 'error');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      };
    } finally {
      setLoading(false);
    }
  };

  // The context value object that will be provided
  const authContextValue: AuthContextType = {
    token,
    user,
    latestProvider,
    isAuthenticated,
    loading,
    login,
    register,
    profile,
    logout
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;