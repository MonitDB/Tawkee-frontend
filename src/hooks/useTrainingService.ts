import { useState, useCallback, useMemo } from 'react';
import {
  CreateTrainingDto,
  defaultPaginatedResponse,
  TrainingDto,
  TrainingService,
} from '../services/trainingService';
import { env } from '../config/env';
import { useHttpResponse } from '../context/ResponseNotifier';
import { useAgents } from '../context/AgentsContext';
import { useAuth } from '../context/AuthContext';

export const useTrainingService = (token: string) => {
  const { handleTokenExpirationError } = useAuth();
  const { notify } = useHttpResponse(); // Destructure handleTokenExpirationError
  const {
    syncAgentTrainings,
    syncAgentTrainingCreation,
    syncAgentTrainingDeletion,
  } = useAgents();

  const [loading, setLoading] = useState(false);
  const [createTrainingLoading, setCreateTrainingLoading] = useState(false);

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
          pageSize: 10,
        });
        syncAgentTrainings(agentId, response);

        return response;
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
        return defaultPaginatedResponse;
      } finally {
        setLoading(false);
      }
    },
    [service, syncAgentTrainings, notify, handleTokenExpirationError]
  );

  const createTraining = useCallback(
    async (agentId: string, trainingData: CreateTrainingDto) => {
      try {
        setCreateTrainingLoading(true);
        const newTraining = (await service.create(
          agentId,
          trainingData
        )) as TrainingDto;
        syncAgentTrainingCreation(agentId, newTraining);

        notify('Training created successfully!', 'success');
        return newTraining;
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
        setCreateTrainingLoading(false);
      }
    },
    [service, syncAgentTrainingCreation, notify, handleTokenExpirationError]
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
    [service, syncAgentTrainingDeletion, notify, handleTokenExpirationError]
  );

  return {
    fetchTrainings,
    createTraining,
    deleteTraining,
    loading,
    createTrainingLoading,
  };
};
