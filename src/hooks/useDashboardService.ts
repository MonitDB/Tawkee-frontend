import { useState, useCallback, useMemo } from 'react';
import { useHttpResponse } from '../context/ResponseNotifier';

import { env } from '../config/env';
import {
  DailyCreditBalanceItem,
  DashboardService,
} from '../services/dashboardService';
import { Workspace } from '../pages/Workspaces';
import { useAuth } from '../context/AuthContext';

export const useDashboardService = (token: string) => {
  const { handleTokenExpirationError } = useAuth();
  const { notify } = useHttpResponse(); // Destructure handleTokenExpirationError
  const [loading, setLoading] = useState(false);

  const service = useMemo(
    () =>
      new DashboardService({
        token,
        apiUrl: env.API_URL,
      }),
    [token, env.API_URL]
  );

  const fetchDashboardMetrics = useCallback(
    async (workspaceId: string | null, startDate: string, endDate: string) => {
      try {
        setLoading(true);
        const metrics = await service.getDashboardMetrics({
          workspaceId,
          startDate,
          endDate,
        });
        return metrics;
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
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [service, notify, handleTokenExpirationError]
  );

  const fetchDetailedWorkspace = useCallback(
    async (workspaceId: string): Promise<Workspace> => {
      try {
        setLoading(true);
        const data = await service.getDetailedWorkspace(workspaceId);
        return data;
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
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [service, notify, handleTokenExpirationError]
  );

  const fetchWorkspaceList = useCallback(
    async ({
      page = 1,
    }: {
      page: number;
    }): Promise<{
      data: Workspace[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }> => {
      try {
        setLoading(true);
        const response = await service.listWorkspaces({ page });
        return response;
      } catch (error: unknown) {
        const errorMessage = (error as Error).message;
        handleTokenExpirationError(errorMessage); // Handle token expiration error
        notify(errorMessage, 'error');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [service, notify, handleTokenExpirationError]
  );

  const fetchAllWorkspacesBasicInfo = useCallback(async (): Promise<
    { id: string; name: string; isActive: boolean; email: string | null }[]
  > => {
    try {
      setLoading(true);
      const data = await service.listAllWorkspacesBasicInfo();
      return data;
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
      throw error;
    } finally {
      setLoading(false);
    }
  }, [service, notify, handleTokenExpirationError]);

  const fetchDailyCreditBalance = useCallback(
    async (
      workspaceId: string,
      startDate?: string,
      endDate?: string
    ): Promise<DailyCreditBalanceItem[]> => {
      try {
        setLoading(true);
        const response = await service.getDailyCreditBalance(
          workspaceId,
          startDate,
          endDate
        );
        return response;
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
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [service, notify, handleTokenExpirationError]
  );

  const updateUserPermissions = useCallback(
    async ({
      userId,
      userPermissions,
    }: {
      userId: string;
      userPermissions: {
        allowed?: boolean;
        resource: string;
        action: string;
      }[];
    }) => {
      try {
        setLoading(true);
        // Call the service method to update user permissions
        const result = await service.updateUserPermissions({
          userId,
          userPermissions,
        });

        // If successful, notify the user
        notify('User permissions updated successfully!', 'success');
        return result;
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
        notify(errorMessage || 'Error updating user permissions', 'error');
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [service, notify, handleTokenExpirationError]
  );

  return {
    fetchDashboardMetrics,
    fetchDetailedWorkspace,
    fetchWorkspaceList,
    fetchAllWorkspacesBasicInfo,
    fetchDailyCreditBalance,
    updateUserPermissions,
    loading,
  };
};
