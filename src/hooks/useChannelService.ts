import { useState, useCallback, useMemo } from 'react';
import { Channel, ChannelService } from '../services/channelService';
import { env } from '../config/env';
import { useHttpResponse } from '../context/ResponseNotifier';
import { useAgents } from '../context/AgentsContext';

export const useChannelService = (token: string) => {
  const { notify } = useHttpResponse();
  const { createAgentChannel, deleteAgentChannel, disconnectAgentChannel } =
    useAgents();

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
        createAgentChannel(agentId, newChannel);

        notify('Channel created successfully!', 'success');
        return newChannel;
      } catch (error) {
        notify(
          error instanceof Error ? error.message : 'Unknown error',
          'error'
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [service, createAgentChannel, notify]
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
        notify(
          error instanceof Error ? error.message : 'Unknown error',
          'error'
        );
        return { qrCode: null };
      } finally {
        setLoading(false);
      }
    },
    [service]
  );

  const disconnectChannel = useCallback(
    async (agentId: string, channelId: string) => {
      setLoading(true);
      try {
        const success = await service.disconnectChannel(channelId);
        if (success) {
          disconnectAgentChannel(agentId, channelId);
          notify('Channel disconnected!', 'success');
        }
        return success;
      } catch (error) {
        notify(
          error instanceof Error ? error.message : 'Unknown error',
          'error'
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [service]
  );

  const deleteChannel = useCallback(
    async (agentId: string, channelId: string) => {
      setLoading(true);
      try {
        const success = await service.deleteChannel(channelId);
        if (success) {
          deleteAgentChannel(agentId, channelId);
          notify('Channel deleted!', 'success');
        }
        return success;
      } catch (error) {
        notify(
          error instanceof Error ? error.message : 'Unknown error',
          'error'
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [service, deleteAgentChannel, notify]
  );

  return {
    loading,
    createChannel,
    getQRCode,
    disconnectChannel,
    deleteChannel,
  };
};
