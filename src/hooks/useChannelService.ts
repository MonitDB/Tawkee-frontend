import { useState, useCallback, useMemo } from 'react';
import { Channel, ChannelService } from '../services/channelService';
import { env } from '../config/env'; // adjust path as needed
import { useHttpResponse } from '../context/ResponseNotifier'; // adjust to your notification utility

export const useChannelService = (token: string) => {
  const { notify } = useHttpResponse();

  const [loading, setLoading] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentAgentId, setCurrentAgentId] = useState<string | null>(null);

  const service = useMemo(() => new ChannelService({ token, apiUrl: env.API_URL }), [token, env.API_URL]);

  const getChannelsForAgent = useCallback(async (agentId: string) => {
    setLoading(true);
    try {
      if (currentAgentId !== agentId) {
        setCurrentAgentId(agentId);
      }

      const list = await service.getChannelsForAgent(agentId);
      setChannels(list);
      return list;
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Unknown error', 'error');
      return [];
    } finally {
      setLoading(false);
    }
  }, [service, currentAgentId]);

  const createChannel = useCallback(async (agentId: string, name: string, type: string) => {
    setLoading(true);
    try {
      const newChannel = await service.createChannel(agentId, name, type);
      if (newChannel && currentAgentId === agentId) {
        setChannels(prev => [...prev, newChannel]);
      }
      notify('Channel created successfully!', 'success');
      return newChannel;
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Unknown error', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [service, currentAgentId]);

  const getQRCode = useCallback(async (channelId: string) => {
    setLoading(true);
    try {
      const result = await service.getQRCode(channelId);
      if (result.qrCode) {
        notify('QR Code generated!', 'success');
      }
      return result;
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Unknown error', 'error');
      return { qrCode: null };
    } finally {
      setLoading(false);
    }
  }, [service]);

  const disconnectChannel = useCallback(async (channelId: string) => {
    setLoading(true);
    try {
      const success = await service.disconnectChannel(channelId);
      if (success) {
        setChannels(prev =>
          prev.map(ch =>
            ch.id === channelId
              ? {
                  ...ch,
                  connected: false,
                  config: {
                    ...ch.config,
                    evolutionApi: {
                      ...ch.config.evolutionApi,
                      status: 'close',
                    },
                  },
                }
              : ch
          )
        );

        notify('Channel disconnected!', 'success');
      }
      return success;
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Unknown error', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const deleteChannel = useCallback(async (channelId: string) => {
    setLoading(true);
    try {
      const success = await service.deleteChannel(channelId);
      if (success) {
        setChannels(prev => prev.filter(ch => ch.id !== channelId));
        notify('Channel deleted!', 'success');
      }
      return success;
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Unknown error', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [service]);

  return {
    loading,
    channels,
    getChannelsForAgent,
    createChannel,
    getQRCode,
    disconnectChannel,
    deleteChannel
  };
};
