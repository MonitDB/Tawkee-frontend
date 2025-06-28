import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import env from '../config/env';
import { useHttpResponse } from './ResponseNotifier';

interface AuthContextType {
  token: string | null;
  user: User | null;
  latestProvider: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<Result>;
  register: (credentials: RegisterCredentials) => Promise<Result>;
  profile: (token: string) => Promise<Result>;
  logout: () => void;
  resetPassword: (input: PasswordResetInput) => Promise<Result>;

  workspacePlanCredits: number;
  workspaceExtraCredits: number;
  syncWorkspaceCreditsUpdate: (planCredits: number, extraCredits: number) => boolean;
  syncWorkspaceSubscriptionUpdate: (subscription: User['subscription'], plan: User['plan']) => boolean;
  syncWorkspaceSmartRechargeUpdate: (data: any) => boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface Result {
  success: boolean;
  error?: string;
}

interface RegisterCredentials extends LoginCredentials {
  name: string;
  workspaceName: string;
}

interface PasswordResetInput {
  password: string;
  resetToken: string;
}

// export type User = Omit<RegisterCredentials, 'password'> & { id: string, workspaceId: string, provider: 'google' | 'facebook' | 'password' };
export interface User {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  provider?: 'google' | 'facebook' | 'password';
  emailVerified?: boolean;

  workspacePlanCredits: number;
  workspaceExtraCredits: number;

  firstName?: string;
  lastName?: string;
  avatar?: string;

  createdAt?: string;

  smartRecharge?: {
    threshold: number;
    rechargeAmount: number;
    active: boolean;
  };

  subscription?: {
    status: string;
    currentPeriodEnd: string;
    trialEnd?: string;
    customStripePriceId?: string | null;
    featureOverrides?: string[] | null;
    creditsLimitOverrides?: number | null;
    agentLimitOverrides?: number | null;
    trainingTextLimitOverrides?: number | null;
    trainingWebsiteLimitOverrides?: number | null;
    trainingVideoLimitOverrides?: number | null;
    trainingDocumentLimitOverrides?: number | null;
    cancelAtPeriodEnd: boolean | null,
    canceledAt: string | null,
  };

  plan?: {
    agentLimit: number;
    amount: number;
    creditsLimit: number;
    currency: string;
    description: string;
    features?: string[];
    id: string;
    interval: string;
    intervalCount: number;
    isEnterprise: boolean;
    name: string;
    trainingDocumentLimit: number;
    trainingTextLimit: number;
    trainingVideoLimit: number;
    trainingWebsiteLimit: number;
    trialDays: number;
  };

  stripePriceDetails?: {
    id: string;
    amount: number;
    currency: string;
    interval: string;
    intervalCount: number;
  };
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create the Authentication Context with a default value
const AuthContext = createContext<AuthContextType | null>(null);

// Auth Provider Component
export function AuthProvider({ children }: AuthProviderProps) {
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

  const [workspacePlanCredits, setWorkspacePlanCredits] = useState<number>(user?.workspacePlanCredits || 0);
  const [workspaceExtraCredits, setWorkspaceExtraCredits] = useState<number>(user?.workspaceExtraCredits || 0);

  // On component mount, check if token exists in localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('app:auth-token');
    const storedUser = JSON.parse(
      localStorage.getItem('app:user') as string
    ) as User;
    const latestProvider = localStorage.getItem('app:latest-provider') || null;

    if (storedToken || storedUser) {
      setToken(storedToken);
      setUser(storedUser);
      setIsAuthenticated(true);
    }

    setLatestProvider(latestProvider);
    setLoading(false);
  }, []);

  // On component mount:
  // 1. fetch up-to-date workspace credits if authenticated
  // 2. fetch up-to-date subscription and plan data if authenticated
  useEffect(() => {
    const fetchWorkspaceData = async (workspaceId: string) => {
      try {
        const [creditsResponse, subscriptionResponse] = await Promise.all([
          fetch(`${env.API_URL}/credits/remaining/${workspaceId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            } as const,
          }),
          fetch(`${env.API_URL}/stripe/billing/status/${workspaceId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            } as const,
          }),
        ]);

        const [creditsData, subscriptionData] = await Promise.all([
          creditsResponse.json(),
          subscriptionResponse.json(),
        ]);

        if (creditsData.error) throw new Error(creditsData.error);
        if (subscriptionData.error) throw new Error(subscriptionData.error);

        setWorkspacePlanCredits(creditsData.data.planCreditsRemaining);
        setWorkspaceExtraCredits(creditsData.data.extraCreditsRemaining);
        syncWorkspaceSubscriptionUpdate(
          subscriptionData.data.subscription,
          subscriptionData.data.plan
        );
      } catch (error) {
        console.error('Error fetching workspace data:', error);
      }
    };

    if (user?.workspaceId) {
      fetchWorkspaceData(user.workspaceId);
    }
  }, [user?.workspaceId]);
  

  const login = async (credentials: LoginCredentials): Promise<Result> => {
    try {
      setLoading(true);
      const response = await fetch(`${env.API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        } as const,
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      notify('Login successful!', 'success');

      const newToken = data.data.token;
      const userData: User = data.data.user;

      // Store token in localStorage
      localStorage.setItem('app:auth-token', newToken);
      // Store user in localStorage
      localStorage.setItem('app:user', JSON.stringify(userData));
      // Store latest provider in localStorage
      localStorage.setItem('app:latest-provider', userData.provider as string);

      // Update state
      setToken(newToken);
      setUser(userData);
      setLatestProvider(userData.provider as string);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error: unknown) {
      let errorMessage = 'A unexpected error occurred.';

      // Check if error is an instance of Error to safely access the message
      if (error instanceof Error) {
        // Handling network failures or fetch-specific errors
        if (error.message.includes('Failed to fetch')) {
          errorMessage =
            'Network error. Please check your internet connection.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      } else {
        errorMessage = 'An unknown error occurred.';
      }

      notify(errorMessage, 'error');
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    credentials: RegisterCredentials
  ): Promise<Result> => {
    try {
      setLoading(true);
      const response = await fetch(`${env.API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        } as const,
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      notify(
        'Successful registration! Please check your email inbox!',
        'success'
      );
      const { token: newToken } = data.data;
      const userData: User = data.data.user;

      // Store token in localStorage
      localStorage.setItem('app:auth-token', newToken);
      // Store user in localStorage
      localStorage.setItem('app:user', JSON.stringify(userData));
      // Store latest provider in localStorage
      localStorage.setItem('app:latest-provider', userData.provider as string);

      // Update state
      setToken(newToken);
      setUser(userData);
      setLatestProvider(userData.provider as string);

      setIsAuthenticated(true);

      return { success: true };
    } catch (error: unknown) {
      let errorMessage = 'A unexpected error occurred.';

      // Check if error is an instance of Error to safely access the message
      if (error instanceof Error) {
        // Handling network failures or fetch-specific errors
        if (error.message.includes('Failed to fetch')) {
          errorMessage =
            'Network error. Please check your internet connection.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      } else {
        errorMessage = 'An unknown error occurred.';
      }

      notify(errorMessage, 'error');
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const profile = async (token: string): Promise<Result> => {
    try {
      setLoading(true);
      const response = await fetch(`${env.API_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        } as const,
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
      localStorage.setItem('app:latest-provider', userData.provider as string);

      // Update state
      setToken(token);
      setUser(userData);
      setLatestProvider(userData.provider as string);

      setIsAuthenticated(true);

      return { success: true };
    } catch (error: unknown) {
      let errorMessage = 'A unexpected error occurred.';

      // Check if error is an instance of Error to safely access the message
      if (error instanceof Error) {
        // Handling network failures or fetch-specific errors
        if (error.message.includes('Failed to fetch')) {
          errorMessage =
            'Network error. Please check your internet connection.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      } else {
        errorMessage = 'An unknown error occurred.';
      }

      notify(errorMessage, 'error');
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<Result> => {
    if (!token) {
      notify('You are not logged in!', 'error');
      return {
        success: false,
        error: 'You are not logged in!',
      };
    }

    try {
      setLoading(true);
      const response = await fetch(`${env.API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        } as const,
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      notify('Successful logout!', 'success');
      // Remove token and user from localStorage
      localStorage.removeItem('app:auth-token');
      localStorage.removeItem('app:user');

      // Reset state
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setWorkspacePlanCredits(0);
      setWorkspaceExtraCredits(0);

      return { success: true };
    } catch (error: unknown) {
      let errorMessage = 'A unexpected error occurred.';

      // Check if error is an instance of Error to safely access the message
      if (error instanceof Error) {
        // Handling network failures or fetch-specific errors
        if (error.message.includes('Failed to fetch')) {
          errorMessage =
            'Network error. Please check your internet connection.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      } else {
        errorMessage = 'An unknown error occurred.';
      }

      notify(errorMessage, 'error');
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async ({
    password,
    resetToken,
  }: PasswordResetInput): Promise<Result> => {
    if (!password || !resetToken) {
      notify('You must provide a password and token!', 'error');
      return {
        success: false,
        error: 'You must provide a password and token!',
      };
    }

    try {
      setLoading(true);
      const response = await fetch(`${env.API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        } as const,
        body: JSON.stringify({ newPassword: password, token: resetToken }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.success) {
        throw new Error(data.message);
      }

      notify(data.message, 'success');
      return { success: true };
    } catch (error: unknown) {
      let errorMessage = 'A unexpected error occurred.';

      // Check if error is an instance of Error to safely access the message
      if (error instanceof Error) {
        // Handling network failures or fetch-specific errors
        if (error.message.includes('Failed to fetch')) {
          errorMessage =
            'Network error. Please check your internet connection.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      } else {
        errorMessage = 'An unknown error occurred.';
      }

      notify(errorMessage, 'error');
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const syncWorkspaceCreditsUpdate = (planCredits: number, extraCredits: number) => {
    if (!user) return false;

    setWorkspacePlanCredits(planCredits);
    setWorkspaceExtraCredits(extraCredits);

    return true;
  };

  const syncWorkspaceSubscriptionUpdate = (
    subscription: User['subscription'],
    plan: User['plan']
  ): boolean => {
    if (!user) return false;

    const updatedUser: User = {
      ...user,
      subscription,
      plan,
    };

    setUser(updatedUser);
    localStorage.setItem('app:user', JSON.stringify(updatedUser));
    return true;
  };

  const syncWorkspaceSmartRechargeUpdate = (
    data: User['smartRecharge']
  ): boolean => {
    if (!user) return false;

    const updatedUser: User = {
      ...user,
      smartRecharge: {
        threshold: data?.threshold as number,
        rechargeAmount: data?.rechargeAmount as number,
        active: data?.active as boolean
      }
    };

    setUser(updatedUser);
    localStorage.setItem('app:user', JSON.stringify(updatedUser));
    return true;
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
    logout,
    resetPassword,

    workspacePlanCredits,
    workspaceExtraCredits,
    syncWorkspaceCreditsUpdate,

    syncWorkspaceSubscriptionUpdate,
    syncWorkspaceSmartRechargeUpdate
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default AuthContext;
