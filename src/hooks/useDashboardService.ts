import { useState, useCallback, useMemo } from 'react';
import { useHttpResponse } from '../context/ResponseNotifier';
import { useAuth } from '../context/AuthContext';

import { env } from '../config/env';
import { DashboardService } from '../services/dashboardService';

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
        const metrics = await service.getDashboardMetrics({ workspaceId, startDate, endDate });
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

  return {
    fetchDashboardMetrics,
    loading,
  };
};
