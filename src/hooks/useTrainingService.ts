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
  const { setAgentTrainings, createAgentTraining, deleteAgentTraining } =
    useAgents();

  const [loading, setLoading] = useState(false);
  // const [page, setPage] = useState(1);
  // const [pageSize, setPageSize] = useState(10);
  // const [query, setQuery] = useState('');

  const service = useMemo(
    () => new TrainingService({ token, apiUrl: env.API_URL }),
    [token, env.API_URL]
  );
  const fetchTrainings = useCallback(
    async (agentId: string) => {
      try {
        setLoading(true);
        const response = await service.findAll(agentId, {
          page: 1,
          pageSize: 1000,
        });
        setAgentTrainings(agentId, response.data);

        return response.data;
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
    [service, setAgentTrainings, notify]
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
        createAgentTraining(agentId, newTraining);

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
    [service, createAgentTraining, notify]
  );

  const deleteTraining = useCallback(
    async (agentId: string, trainingId: string) => {
      setLoading(true);
      try {
        const success = await service.remove(trainingId);
        deleteAgentTraining(agentId, trainingId);

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
    [service, deleteAgentTraining, notify]
  );

  return {
    loading,
    fetchTrainings,
    createTraining,
    deleteTraining,
  };
};
