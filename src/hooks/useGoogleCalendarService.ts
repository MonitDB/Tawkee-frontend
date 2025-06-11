import { useState, useCallback, useMemo } from 'react';
import {
  GoogleCalendarService
} from '../services/googleCalendarService';
import { env } from '../config/env';
import { useHttpResponse } from '../context/ResponseNotifier';
import { useAgents } from '../context/AgentsContext';
import { ScheduleSettingsDto } from '../pages/AgentDetails/components/IntegrationsTabPanel';

export const useGoogleCalendarService = (token: string) => {
  const { notify } = useHttpResponse();
  const { syncAgentScheduleSettingsUpdate } = useAgents();

  const [loading, setLoading] = useState(false);

  const service = useMemo(
    () => new GoogleCalendarService({ token, apiUrl: env.API_URL }),
    [token, env.API_URL]
  );

  const createScheduleMeetingIntention = useCallback(
    async (agentId: string) => {
      try {
        setLoading(true);
        const intention = await service.createScheduleMeetingIntention(agentId);
        // syncAgentGoogleCalendarIntention(agentId, intention);

        notify('Google Calendar scheduling intention created successfully!', 'success');
        return intention;
      } catch (error) {
        notify(error instanceof Error ? error.message : 'Failed to create intention', 'error');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [service, notify]
  );

  const getAuthUrl = useCallback(
    async (agentId: string) => {
      try {
        setLoading(true);
        return await service.getAuthUrl(agentId);
      } catch (error) {
        notify(error instanceof Error ? error.message : 'Failed to generate auth URL', 'error');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [service, notify]
  );

  const checkAuthStatus = useCallback(
    async (agentId: string) => {
      try {
        setLoading(true);
        const status = await service.getAuthStatus(agentId);

        return status;
      } catch (error) {
        notify(error instanceof Error ? error.message : 'Failed to check auth status', 'error');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [service, notify]
  );

  const revokeTokens = useCallback(
    async (agentId: string) => {
      try {
        setLoading(true);
        const result = await service.revokeTokens(agentId);
        
        if (result.success) {
          notify('Google Calendar tokens revoked successfully!', 'success');
        } else {
          notify('Failed to revoke tokens', 'error');
        }
        
        return result;
      } catch (error) {
        notify(error instanceof Error ? error.message : 'Failed to revoke tokens', 'error');
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [service, notify]
  );

  const authenticateAgent = useCallback(
    async (agentId: string) => {
      try {
        const authData = await getAuthUrl(agentId);
        if (authData?.authUrl) {
          // Open auth URL in new window/tab
          window.open(authData.authUrl, '_blank', 'width=500,height=600');
          return authData;
        }
        return null;
      } catch (error) {
        notify('Failed to start authentication process', 'error');
        return null;
      }
    },
    [getAuthUrl, notify]
  );

  const refreshAuthStatus = useCallback(
    async (agentId: string) => {
      return await checkAuthStatus(agentId);
    },
    [checkAuthStatus]
  );

  const getScheduleSettings = useCallback(
    async (agentId: string) => {
      try {
        setLoading(true);
        const data = await service.getScheduleSettings(agentId);
        syncAgentScheduleSettingsUpdate({ agentId, scheduleSettings: data });
        return data;
      } catch (error) {
        notify(error instanceof Error ? error.message : 'Failed to get schedule settings', 'error');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [service, notify]
  );  

  const updateScheduleSettings = useCallback(
    async (agentId: string, scheduleSettings: ScheduleSettingsDto) => {
      try {
        setLoading(true);
        const data = await service.updateScheduleSettings(agentId, scheduleSettings);
        syncAgentScheduleSettingsUpdate({ agentId, scheduleSettings: data });
        return data;
      } catch (error) {
        notify(error instanceof Error ? error.message : 'Failed to update schedule settings', 'error');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [service, notify]
  );  

  return {
    // Main service methods
    createScheduleMeetingIntention,
    getAuthUrl,
    checkAuthStatus,
    revokeTokens,
    
    // Convenience methods
    authenticateAgent,
    getScheduleSettings,
    updateScheduleSettings,
    refreshAuthStatus,
    
    // Loading states
    loading
  };
};