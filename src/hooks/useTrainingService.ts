import { useState, useCallback, useMemo } from 'react';
import {
  CreateTrainingDto,
  TrainingDto,
  TrainingService,
} from '../services/trainingService';
import { env } from '../config/env';
import { useHttpResponse } from '../context/ResponseNotifier';
import { useAgents } from '../context/AgentsContext';

export const useTrainingService = (token: string) => {
  const { notify } = useHttpResponse();
  const { syncAgentTrainings, syncAgentTrainingCreation, syncAgentTrainingDeletion } = useAgents();

  const [loading, setLoading] = useState(false);

  const service = useMemo(
    () => new TrainingService({ token, apiUrl: env.API_URL }),
    [token, env.API_URL]
  );

  const fetchTrainings = useCallback(
    async (agentId: string, page: number) => {
      try {
        setLoading(true);
        const response = await service.findAll(agentId, {
          page,
          pageSize: 10
        });
        syncAgentTrainings(agentId, response);

        return response;
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
    [service, syncAgentTrainings, notify]
  );

  const createTraining = useCallback(
    async (agentId: string, trainingData: CreateTrainingDto) => {
      try {
        setLoading(true);
        notify('Processing training material...', 'info');
        const newTraining = (await service.create(
          agentId,
          trainingData
        )) as TrainingDto;
        syncAgentTrainingCreation(agentId, newTraining);

        notify('Training created successfully!', 'success');
        return newTraining;
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
    [service, syncAgentTrainingCreation, notify]
  );

  const deleteTraining = useCallback(
    async (agentId: string, trainingId: string) => {
      setLoading(true);
      try {
        const success = await service.remove(trainingId);
        syncAgentTrainingDeletion(agentId, trainingId);

        if (success) {
          notify('Training deleted!', 'success');
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
    [service, syncAgentTrainingDeletion, notify]
  );

  return {
    fetchTrainings,
    createTraining,
    deleteTraining,
    loading
  };
};
