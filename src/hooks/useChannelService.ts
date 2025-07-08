import { useState, useCallback, useMemo } from 'react';
import { Channel, ChannelService } from '../services/channelService';
import { env } from '../config/env';
import { useHttpResponse } from '../context/ResponseNotifier';
import { useAgents } from '../context/AgentsContext';
import { useAuth } from '../context/AuthContext';

export const useChannelService = (token: string) => {
  const { handleTokenExpirationError } = useAuth();
  const { notify } = useHttpResponse(); // Destructure handleTokenExpirationError
  const {
    syncAgentChannelCreation,
    syncAgentChannelDeletion,
    syncAgentChannelConnectionUpdate,
  } = useAgents();

  const [loading, setLoading] = useState(false);

  const service = useMemo(
    () => new ChannelService({ token, apiUrl: env.API_URL }),
    [token, env.API_URL]
  );

  const createChannel = useCallback(
    async (agentId: string, name: string, type: string) => {
      setLoading(true);
      try {
        const newChannel = (await service.createChannel(
          agentId,
          name,
          type
        )) as Channel;
        syncAgentChannelCreation(agentId, newChannel);
        notify('Channel created successfully!', 'success');
        return newChannel;
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
    [service, syncAgentChannelCreation, notify, handleTokenExpirationError]
  );

  const getQRCode = useCallback(
    async (channelId: string) => {
      setLoading(true);
      try {
        const result = await service.getQRCode(channelId);
        if (result.qrCode) {
          notify('QR Code generated!', 'success');
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
        return { qrCode: null };
      } finally {
        setLoading(false);
      }
    },
    [service, notify, handleTokenExpirationError]
  );

  const disconnectChannel = useCallback(
    async (agentId: string, channelId: string) => {
      setLoading(true);
      try {
        const success = await service.disconnectChannel(channelId);
        if (success) {
          syncAgentChannelConnectionUpdate(agentId, channelId, 'SCAN_QR_CODE');
          notify('Channel disconnected!', 'success');
        }
        return success;
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
        return false;
      } finally {
        setLoading(false);
      }
    },
    [
      service,
      syncAgentChannelConnectionUpdate,
      notify,
      handleTokenExpirationError,
    ]
  );

  const deleteChannel = useCallback(
    async (agentId: string, channelId: string) => {
      setLoading(true);
      try {
        const success = await service.deleteChannel(channelId);
        if (success) {
          syncAgentChannelDeletion(agentId, channelId);
          notify('Channel deleted!', 'success');
        }
        return success;
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
        return false;
      } finally {
        setLoading(false);
      }
    },
    [service, syncAgentChannelDeletion, notify, handleTokenExpirationError]
  );

  return {
    loading,
    createChannel,
    getQRCode,
    disconnectChannel,
    deleteChannel,
  };
};
