import { useState, useCallback, useMemo } from 'react';
import { GoogleCalendarService } from '../services/googleCalendarService';
import { env } from '../config/env';
import { useHttpResponse } from '../context/ResponseNotifier';
import { useAgents } from '../context/AgentsContext';
import { ScheduleSettingsDto } from '../pages/AgentDetails/components/dialogs/GoogleCalendarConfigDialog';
import { useAuth } from '../context/AuthContext';

export const useGoogleCalendarService = (token: string) => {
  const { handleTokenExpirationError } = useAuth();
  const { notify } = useHttpResponse(); // Destructure handleTokenExpirationError
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

        notify(
          'Google Calendar scheduling intention created successfully!',
          'success'
        );
        return intention;
      } catch (error) {
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
        return null;
      } finally {
        setLoading(false);
      }
    },
    [service, notify, handleTokenExpirationError]
  );

  const getAuthUrl = useCallback(
    async (agentId: string) => {
      try {
        setLoading(true);
        return await service.getAuthUrl(agentId);
      } catch (error) {
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
        return null;
      } finally {
        setLoading(false);
      }
    },
    [service, notify, handleTokenExpirationError]
  );

  const checkAuthStatus = useCallback(
    async (agentId: string) => {
      try {
        setLoading(true);
        const status = await service.getAuthStatus(agentId);

        return status;
      } catch (error) {
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
        return null;
      } finally {
        setLoading(false);
      }
    },
    [service, notify, handleTokenExpirationError]
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
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [service, notify, handleTokenExpirationError]
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
        return null;
      } finally {
        setLoading(false);
      }
    },
    [service, notify, syncAgentScheduleSettingsUpdate, handleTokenExpirationError]
  );

  const updateScheduleSettings = useCallback(
    async (agentId: string, scheduleSettings: ScheduleSettingsDto) => {
      try {
        setLoading(true);
        const data = await service.updateScheduleSettings(
          agentId,
          scheduleSettings
        );
        syncAgentScheduleSettingsUpdate({ agentId, scheduleSettings: data });
        return data;
      } catch (error) {
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
        return null;
      } finally {
        setLoading(false);
      }
    },
    [service, notify, syncAgentScheduleSettingsUpdate, handleTokenExpirationError]
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
    loading,
  };
};
