import { useState, useCallback, useMemo } from 'react';
import { useHttpResponse } from '../context/ResponseNotifier';
import { useAuth } from '../context/AuthContext';

import { env } from '../config/env';
import { DailyCreditBalanceItem, DashboardService } from '../services/dashboardService';
import { Workspace } from '../pages/Workspaces';

export const useDashboardService = (token: string) => {
  const { user } = useAuth();
  const { notify } = useHttpResponse();
  const [loading, setLoading] = useState(false);

  const service = useMemo(
    () =>
      new DashboardService({
        token,
        apiUrl: env.API_URL,
      }),
    [token, env.API_URL, user?.id]
  );

  const fetchDashboardMetrics = useCallback(
    async (workspaceId: string, startDate: string, endDate: string) => {
      try {
        setLoading(true);
        const metrics = await service.getDashboardMetrics({
          workspaceId,
          startDate,
          endDate,
        });
        return metrics;
      } catch (error: unknown) {
        notify((error as Error).message, 'error');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [service, notify]
  );

  const fetchDetailedWorkspace = useCallback(
    async (workspaceId: string): Promise<Workspace> => {
      try {
        setLoading(true);
        const data = await service.getDetailedWorkspace(workspaceId);
        return data;
      } catch (error: unknown) {
        notify((error as Error).message, 'error');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [service, notify]
  );

  const fetchWorkspaceList = useCallback(
    async ({
      page = 1
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
        notify((error as Error).message, 'error');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [service, notify]
  );

  const fetchDailyCreditBalance = useCallback(
    async (
      workspaceId: string,
      startDate?: string,
      endDate?: string
    ): Promise<DailyCreditBalanceItem[]> => {
      try {
        setLoading(true);
        const response = await service.getDailyCreditBalance(workspaceId, startDate, endDate);
        return response;
      } catch (error: unknown) {
        notify((error as Error).message, 'error');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [service, notify]
  );

  return {
    fetchDashboardMetrics,
    fetchDetailedWorkspace,
    fetchWorkspaceList,
    fetchDailyCreditBalance,
    loading,
  };
};
