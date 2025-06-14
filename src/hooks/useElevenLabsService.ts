import { useState, useCallback, useMemo } from 'react';
import { ElevenLabsDataResponseDto, ElevenLabsService } from '../services/elevenLabsService';
import { env } from '../config/env';
import { useHttpResponse } from '../context/ResponseNotifier';
import { useAgents } from '../context/AgentsContext';
import { useAuth } from '../context/AuthContext';
import { ElevenLabsSettings } from '../pages/AgentDetails/components/dialogs/ElevenLabsSettingsDialog';

export const useElevenLabsService = (token: string) => {
  const { notify } = useHttpResponse();
  const { user } = useAuth();
  const {
    syncAgentElevenLabsStatus,
    syncAgentElevenLabsData
  } = useAgents();

  const [elevenLabsLoading, setElevenLabsLoading] = useState<boolean>(false);
  const [voicesLoading, setVoicesLoading] = useState<boolean>(false);

  const service = useMemo(
    () => new ElevenLabsService({ token, apiUrl: env.API_URL, userId: user?.id as string }),
    [token, env.API_URL]
  );

  const activateElevenLabs = useCallback(
    async (agentId: string, apiKey: string) => {
      try {
        setElevenLabsLoading(true);
        const response = await service.activateIntegration(agentId, { apiKey });
        syncAgentElevenLabsStatus({ agentId, connected: true });

        notify('ElevenLabs integration activated successfully!', 'success');
        return response;
      } catch (error: unknown) {
        notify(error as string, 'error');
        throw error;
      } finally {
        setElevenLabsLoading(false);
      }
    },
    [service, notify, syncAgentElevenLabsStatus]
  );

  const deactivateElevenLabs = useCallback(
    async (agentId: string) => {
      try {
        setElevenLabsLoading(true);
        const response = await service.deactivateIntegration(agentId);
        syncAgentElevenLabsStatus({ agentId, connected: false });

        notify('ElevenLabs integration deactivated successfully!', 'success');
        return response;
      } catch (error: unknown) {
        notify(error as string, 'error');
      } finally {
        setElevenLabsLoading(false);
      }
    },
    [service, notify, syncAgentElevenLabsStatus]
  );

  const fetchElevenLabsData = useCallback(
    async (agentId: string) => {
      try {
        setVoicesLoading(true);
        const response = await service.getData(agentId);
        syncAgentElevenLabsData({ agentId, params: response });

        return response;
      } catch (error: unknown) {
        notify(error as string, 'error');
      } finally {
        setVoicesLoading(false);
      }
    },
    [service, notify, syncAgentElevenLabsData]
  );

  const updateElevenLabsData = useCallback(
    async (agentId: string, params: Partial<ElevenLabsSettings>) => {
      try {
        setElevenLabsLoading(true);
        const response = await service.updateData(agentId, params);
        syncAgentElevenLabsData({ agentId, params });

        notify('ElevenLabs data updated successfully!', 'success');
        return response;
      } catch (error: unknown) {
        notify(error as string, 'error');
      } finally {
        setElevenLabsLoading(false);
      }
    },
    [service, notify, syncAgentElevenLabsData]
  );

  return {
    activateElevenLabs,
    deactivateElevenLabs,
    fetchElevenLabsData,
    updateElevenLabsData,
    elevenLabsLoading,
    voicesLoading,
  };
};