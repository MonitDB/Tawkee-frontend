import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
  RefObject,
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
  isLoggingOutRef: RefObject<boolean>;
  resetPassword: (input: PasswordResetInput) => Promise<Result>;
  updatePassword: (input: PasswordUpdateInput) => Promise<Result>;
  updateName: (formData: FormData) => Promise<Result>;
  updateWorkspaceName: (workspaceId: string, newName: string) => Promise<Result>;
  activateWorkspace: (workspaceId: string) => Promise<Result>;
  deactivateWorkspace: (workspaceId: string) => Promise<Result>;

  can: (action: string, resource: string) => boolean;
  handleTokenExpirationError: (errorMessage: string) => void;

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
  workspaceName: string;
  workspaceIsActive: boolean;

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
  updatedAt?: string;

  role: {
    name: string;
    description?: string;
  };

  rolePermissions: { action: string; resource: string; description: string }[];

  userPermissions: { action: string; resource: string; allowed: boolean }[];

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
    creditsLimitOverrides?: { value: number | 'UNLIMITED'; explicitlySet: boolean } | null;
    agentLimitOverrides?: { value: number | 'UNLIMITED'; explicitlySet: boolean } | null;
    trainingTextLimitOverrides?: { value: number | 'UNLIMITED'; explicitlySet: boolean } | null;
    trainingWebsiteLimitOverrides?: { value: number | 'UNLIMITED'; explicitlySet: boolean } | null;
    trainingVideoLimitOverrides?: { value: number | 'UNLIMITED'; explicitlySet: boolean } | null;
    trainingDocumentLimitOverrides?: { value: number | 'UNLIMITED'; explicitlySet: boolean } | null;
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

interface PasswordUpdateInput {
  currentPassword: string;
  newPassword: string;
}

// Create the Authentication Context with a default value
const AuthContext = createContext<AuthContextType | null>(null);

// Auth Provider Component
export function AuthProvider({ children }: AuthProviderProps) {
  const isLoggingOutRef = useRef(false);

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

        setWorkspacePlanCredits(creditsData.data.planCreditsRemaining ?? Infinity);
        setWorkspaceExtraCredits(creditsData.data.extraCreditsRemaining);
        syncWorkspaceSubscriptionUpdate(
          subscriptionData.data.subscription,
          subscriptionData.data.plan
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '';
        handleTokenExpirationError(errorMessage); // Handle token expiration error
        notify(errorMessage, 'error');
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

      handleTokenExpirationError(errorMessage); // Handle token expiration error
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

      handleTokenExpirationError(errorMessage); // Handle token expiration error
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
      isLoggingOutRef.current = true;
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

      handleTokenExpirationError(errorMessage); // Handle token expiration error
      notify(errorMessage, 'error');
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
      isLoggingOutRef.current = false;
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

      handleTokenExpirationError(errorMessage); // Handle token expiration error
      notify(errorMessage, 'error');
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async ({
    currentPassword,
    newPassword,
  }: PasswordUpdateInput): Promise<Result> => {
    if (!currentPassword || !newPassword) {
      notify('Both current and new passwords are required.', 'error');
      return {
        success: false,
        error: 'Both current and new passwords are required.',
      };
    }

    try {
      setLoading(true);

      const response = await fetch(`${env.API_URL}/auth/update-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        } as const,
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.success) {
        throw new Error(data.message || 'Password update failed');
      }

      notify('Password updated successfully!', 'success');
      return { success: true };
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred.';

      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else {
          errorMessage = error.message;
        }
      }

      handleTokenExpirationError(errorMessage);
      notify(errorMessage, 'error');

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const updateName = async (formData: FormData): Promise<Result> => {
    const firstName = formData.get('firstName')?.toString().trim();
    const lastName = formData.get('lastName')?.toString().trim();

    if (!firstName || !lastName) {
      notify('Both first name and last name are required.', 'error');
      return {
        success: false,
        error: 'Both first name and last name are required.',
      };
    }

    try {
      setLoading(true);

      const response = await fetch(`${env.API_URL}/auth/update-name`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error);
      if (!data.success) throw new Error(data.message || 'Failed to update name');

      // Assume updated avatar URL comes back as data.avatarUrl (optional)
      const updatedUser = {
        ...user,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        ...(data.avatar && { avatar: env.API_URL + data.avatar }),
      };

      setUser(updatedUser);
      localStorage.setItem('app:user', JSON.stringify(updatedUser));

      notify('Profile updated successfully!', 'success');
      return { success: true };

    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message.includes('Failed to fetch')
          ? 'Network error. Please check your internet connection.'
          : error.message;
      }

      handleTokenExpirationError(errorMessage);
      notify(errorMessage, 'error');

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const updateWorkspaceName = async (workspaceId: string, newName: string): Promise<Result> => {
    if (!newName.trim()) {
      notify('Workspace name cannot be empty.', 'error');
      return {
        success: false,
        error: 'Workspace name cannot be empty.',
      };
    }

    try {
      setLoading(true);

      const response = await fetch(`${env.API_URL}/workspaces/${workspaceId}/name`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName }),
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      if (workspaceId === user?.workspaceId) {
        // Atualiza o objeto do usuário com o novo nome da workspace, se o que estiver sendo atualizado é esse workspace
        const updatedUser: User = {
          ...user as User,
          workspaceName: data.data.workspaceName as string
        };
  
        setUser(updatedUser);
        localStorage.setItem('app:user', JSON.stringify(updatedUser));
      } 

      notify('Workspace name updated successfully!', 'success');
      return { success: true };
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message.includes('Failed to fetch')
          ? 'Network error. Please check your internet connection.'
          : error.message;
      }

      handleTokenExpirationError(errorMessage);
      notify(errorMessage, 'error');

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const activateWorkspace = async (workspaceId: string): Promise<Result> => {
    try {
      setLoading(true);

      const response = await fetch(`${env.API_URL}/workspaces/${workspaceId}/activate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      const updatedUser: User = {
        ...user as User,
        workspaceIsActive: true,
      };

      setUser(updatedUser);
      localStorage.setItem('app:user', JSON.stringify(updatedUser));

      notify('Workspace activated successfully!', 'success');
      return { success: true };

    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message.includes('Failed to fetch')
          ? 'Network error. Please check your internet connection.'
          : error.message;
      }

      handleTokenExpirationError(errorMessage);
      notify(errorMessage, 'error');
      return { success: false, error: errorMessage };

    } finally {
      setLoading(false);
    }
  };  

  const deactivateWorkspace = async (workspaceId: string): Promise<Result> => {
    try {
      setLoading(true);

      const response = await fetch(`${env.API_URL}/workspaces/${workspaceId}/deactivate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      const updatedUser: User = {
        ...user as User,
        workspaceIsActive: false,
      };

      setUser(updatedUser);
      localStorage.setItem('app:user', JSON.stringify(updatedUser));

      notify('Workspace deactivated successfully!', 'success');
      return { success: true };

    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message.includes('Failed to fetch')
          ? 'Network error. Please check your internet connection.'
          : error.message;
      }

      handleTokenExpirationError(errorMessage);
      notify(errorMessage, 'error');
      return { success: false, error: errorMessage };

    } finally {
      setLoading(false);
    }
  };

  const can = (action: string, resource: string): boolean => {
      if (!user) return false;

      // Check userPermissions first (higher precedence)
      const userPermission = user.userPermissions.find(
          (permission) => permission.resource === resource && permission.action === action
      );
      if (userPermission) {
          return userPermission.allowed;
      }

      // Check rolePermissions if no userPermissions
      const rolePermission = user.rolePermissions.find(
          (permission) => permission.resource === resource && permission.action === action
      );
      if (rolePermission) {
          return true;
      }

      return false;
  };

  const handleTokenExpirationError = (errorMessage: string) => {
    if (errorMessage.includes('Your session has been expired. Please log in again') || errorMessage.includes('jwt malformed')) {
      
      // Reset state
      localStorage.removeItem('app:user');
      localStorage.removeItem('app:auth-token');

      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setWorkspacePlanCredits(0);
      setWorkspaceExtraCredits(0);
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
    isLoggingOutRef,
    resetPassword,
    updatePassword,
    updateName,
    updateWorkspaceName,
    activateWorkspace,
    deactivateWorkspace,

    can,
    handleTokenExpirationError,

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
