import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import env from '../config/env';
import { useHttpResponse } from './ResponseNotifier';
import { useAuth } from './AuthContext';
import { Channel } from '../services/channelService';
import { TrainingDto } from '../services/trainingService';

export enum AIModel {
  GPT_4 = 'GPT_4',
  GPT_4_O = 'GPT_4_O',
  GPT_4_O_MINI = 'GPT_4_O_MINI',
  GPT_4_1_MINI = 'GPT_4_1_MINI',
  GPT_4_1 = 'GPT_4_1',
}

export enum GroupingTime {
  NO_GROUP = 'NO_GROUP',
  FIVE_SEC = 'FIVE_SEC',
  TEN_SEC = 'TEN_SEC',
  THIRD_SEC = 'THIRD_SEC',
  ONE_MINUTE = 'ONE_MINUTE',
}

export interface AgentSettings {
  preferredModel: AIModel;
  timezone: string;
  enabledHumanTransfer: boolean;
  enabledReminder: boolean;
  splitMessages: boolean;
  enabledEmoji: boolean;
  limitSubjects: boolean;
  messageGroupingTime: GroupingTime;
}

export interface AgentWebhooks {
  onNewMessage: string | null;
  onLackKnowLedge: string | null;
  onTransfer: string | null;
  onFinishAttendance: string | null;
}

export enum AgentCommunicationType {
  FORMAL = 'FORMAL',
  NORMAL = 'NORMAL',
  RELAXED = 'RELAXED',
}

export enum AgentType {
  SUPPORT = 'SUPPORT',
  SALE = 'SALE',
  PERSONAL = 'PERSONAL',
}

export interface Agent {
  id: string;
  workspaceId: string;
  name: string;
  avatar?: string;
  behavior: string;
  communicationType: AgentCommunicationType;
  type: AgentType;
  jobName: string;
  jobSite: string;
  jobDescription: string;
  isActive: boolean;
  channels: Channel[];
  trainings: TrainingDto[];
}

export interface AgentWrapper {
  agent: Agent;
  settings: AgentSettings;
  webhooks: AgentWebhooks;
}

export interface PaginatedAgentWrapper {
  agents: AgentWrapper[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export type AgentInput = Partial<
  Omit<Agent, 'id' | 'workspaceId' | 'isActive'>
>;

interface AgentsContextType {
  paginatedAgents: PaginatedAgentWrapper;
  loading: boolean;
  fetchAgents: () => Promise<void>;
  getAgentById: (id: string) => Promise<Agent | null>;
  createAgent: (
    input: AgentInput
  ) => Promise<{ success: boolean; id?: string }>;
  updateAgent: (id: string, input: AgentInput) => Promise<boolean>;
  deleteAgent: (id: string) => Promise<boolean>;
  activateAgent: (id: string) => Promise<boolean>;
  deactivateAgent: (id: string) => Promise<boolean>;
  getAgentSettings: (id: string) => Promise<AgentSettings | null>;
  updateAgentSettings: (
    id: string,
    settings: AgentSettings
  ) => Promise<boolean>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setQuery: (query: string) => void;

  createAgentChannel: (agentId: string, newChannel: Channel) => boolean;
  deleteAgentChannel: (agentId: string, channelId: string) => boolean;
  disconnectAgentChannel: (agentId: string, channelId: string) => boolean;

  setAgentTrainings: (agentId: string, trainings: TrainingDto[]) => boolean;
  createAgentTraining: (agentId: string, newTraining: TrainingDto) => boolean;
  deleteAgentTraining: (agentId: string, trainingId: string) => boolean;
}

interface AgentsProviderProps {
  children: ReactNode;
}

const AgentsContext = createContext<AgentsContextType | null>(null);

export function AgentsProvider({ children }: AgentsProviderProps) {
  const { user, token } = useAuth();
  const { notify } = useHttpResponse();

  const [paginatedAgents, setPaginatedAgents] = useState<PaginatedAgentWrapper>(
    {
      agents: [],
      meta: {
        total: 0,
        page: 1,
        pageSize: 3,
        totalPages: 0,
      },
    }
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const [query, setQuery] = useState('');

  const fetchAgents = async (): Promise<void> => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(query && { query }),
      });

      const response = await fetch(
        `${env.API_URL}/workspace/${user?.workspaceId}/agents?${queryParams}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          } as const,
        }
      );
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setPaginatedAgents({
        agents: data.data || [],
        meta: data.meta,
      });
    } catch (error) {
      notify(error instanceof Error ? error.message : '', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getAgentById = async (id: string): Promise<Agent | null> => {
    try {
      setLoading(true);
      const response = await fetch(`${env.API_URL}/agent/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        } as const,
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data.data;
    } catch (error) {
      notify(error instanceof Error ? error.message : '', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createAgent = async (
    input: AgentInput
  ): Promise<{ success: boolean; id?: string }> => {
    try {
      setLoading(true);
      const response = await fetch(
        `${env.API_URL}/workspace/${user?.workspaceId}/agents`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          } as const,
          body: JSON.stringify(input),
        }
      );

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setPaginatedAgents((prev) => ({
        ...prev,
        agents: [...prev.agents, data.data],
        meta: {
          ...prev.meta,
          total: prev.meta.total + 1,
        },
      }));

      notify('Agent created successfully!', 'success');
      return { success: true, id: data.data.agent.id };
    } catch (error) {
      notify(error instanceof Error ? error.message : '', 'error');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const updateAgent = async (
    id: string,
    input: AgentInput
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch(`${env.API_URL}/agent/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        } as const,
        body: JSON.stringify(input),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setPaginatedAgents((prev) => ({
        ...prev,
        agents: prev.agents.map((wrapper) =>
          wrapper.agent.id === id ? data.data : wrapper
        ),
      }));

      notify('Agent updated successfully!', 'success');
      return true;
    } catch (error) {
      notify(error instanceof Error ? error.message : '', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteAgent = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch(`${env.API_URL}/agent/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` } as const,
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setPaginatedAgents((prev) => ({
        ...prev,
        agents: prev.agents.filter((wrapper) => wrapper.agent.id !== id),
        meta: {
          ...prev.meta,
          total: prev.meta.total - 1,
        },
      }));

      notify('Agent deleted successfully!', 'success');
      return true;
    } catch (error) {
      notify(error instanceof Error ? error.message : '', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const activateAgent = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch(`${env.API_URL}/agent/${id}/active`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` } as const,
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setPaginatedAgents((prev) => ({
        ...prev,
        agents: prev.agents.map((wrapper) =>
          wrapper.agent.id === id
            ? {
                ...wrapper,
                agent: {
                  ...wrapper.agent,
                  isActive: true,
                },
              }
            : wrapper
        ),
      }));

      notify('Agent activated!', 'success');
      return true;
    } catch (error) {
      notify(error instanceof Error ? error.message : '', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deactivateAgent = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch(`${env.API_URL}/agent/${id}/inactive`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` } as const,
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      notify('Agent deactivated!', 'success');

      setPaginatedAgents((prev) => ({
        ...prev,
        agents: prev.agents.map((wrapper) =>
          wrapper.agent.id === id
            ? {
                ...wrapper,
                agent: {
                  ...wrapper.agent,
                  isActive: false,
                },
              }
            : wrapper
        ),
      }));

      return true;
    } catch (error) {
      notify(error instanceof Error ? error.message : '', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getAgentSettings = async (
    id: string
  ): Promise<AgentSettings | null> => {
    try {
      setLoading(true);
      const response = await fetch(`${env.API_URL}/agent/${id}/settings`, {
        headers: { Authorization: `Bearer ${token}` } as const,
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data.data;
    } catch (error) {
      notify(error instanceof Error ? error.message : '', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateAgentSettings = async (
    id: string,
    settings: AgentSettings
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch(`${env.API_URL}/agent/${id}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        } as const,
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setPaginatedAgents((prev) => ({
        ...prev,
        agents: prev.agents.map((wrapper) =>
          wrapper.agent.id === id
            ? { ...wrapper, settings: data.data }
            : wrapper
        ),
      }));

      notify('Settings updated successfully!', 'success');
      return true;
    } catch (error) {
      notify(error instanceof Error ? error.message : '', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createAgentChannel = (
    agentId: string,
    newChannel: Channel
  ): boolean => {
    try {
      setPaginatedAgents((prev) => {
        const updatedAgents = prev.agents.map((wrapper) => {
          if (wrapper.agent.id === agentId) {
            // Create a new channels array immutably
            const updatedChannels = [
              ...(wrapper.agent.channels || []),
              newChannel,
            ];
            return {
              ...wrapper,
              agent: {
                ...wrapper.agent,
                channels: updatedChannels,
              },
            };
          }
          return wrapper; // Return unchanged wrapper if ID doesn't match
        });

        // Return the updated state structure
        return {
          ...prev,
          agents: updatedAgents,
        };
      });

      return true; // Return true on successful state update
    } catch (error) {
      console.error('Error adding agent channel locally:', error);
      return false; // Return false if an error occurred
    }
  };

  const deleteAgentChannel = (agentId: string, channelId: string): boolean => {
    try {
      setPaginatedAgents((prev) => {
        const updatedAgents = prev.agents.map((wrapper) => {
          if (wrapper.agent.id === agentId) {
            // Remove deleted channel from array immutably
            const updatedChannels = wrapper.agent.channels.filter(
              (channel) => channel.id != channelId
            );
            return {
              ...wrapper,
              agent: {
                ...wrapper.agent,
                channels: updatedChannels,
              },
            };
          }
          return wrapper; // Return unchanged wrapper if ID doesn't match
        });

        // Return the updated state structure
        return {
          ...prev,
          agents: updatedAgents,
        };
      });

      return true; // Return true on successful state update
    } catch (error) {
      console.error('Error deleting agent channel locally:', error);
      return false; // Return false if an error occurred
    }
  };

  const disconnectAgentChannel = (
    agentId: string,
    channelId: string
  ): boolean => {
    try {
      setPaginatedAgents((prev) => {
        const updatedAgents = prev.agents.map((wrapper) => {
          if (wrapper.agent.id !== agentId) return wrapper;

          const updatedChannels = (wrapper.agent.channels || []).map(
            (channel) => {
              if (channel.id !== channelId) return channel;

              return {
                ...channel,
                connected: false,
                config: channel.config
                  ? {
                      ...channel.config,
                      wahaApi: channel.config.wahaApi
                        ? {
                            ...channel.config.wahaApi,
                            status: 'SCAN_QR_CODE',
                          }
                        : channel.config.wahaApi,
                    }
                  : channel.config,
              };
            }
          );

          return {
            ...wrapper,
            agent: {
              ...wrapper.agent,
              channels: updatedChannels,
            },
          };
        });

        return {
          ...prev,
          agents: updatedAgents,
        };
      });

      return true;
    } catch (error) {
      console.error('Error disconnecting agent channel locally:', error);
      return false;
    }
  };

  const setAgentTrainings = (
    agentId: string,
    trainings: TrainingDto[]
  ): boolean => {
    try {
      setPaginatedAgents((prev) => {
        const updatedAgents = prev.agents.map((wrapper) => {
          if (wrapper.agent.id === agentId) {
            // Create a new training array immutably
            return {
              ...wrapper,
              agent: {
                ...wrapper.agent,
                trainings,
              },
            };
          }
          return wrapper; // Return unchanged wrapper if ID doesn't match
        });

        // Return the updated state structure
        return {
          ...prev,
          agents: updatedAgents,
        };
      });

      return true; // Return true on successful state update
    } catch (error) {
      console.error('Error adding agent training locally:', error);
      return false; // Return false if an error occurred
    }
  };

  const createAgentTraining = (
    agentId: string,
    newTraining: TrainingDto
  ): boolean => {
    try {
      setPaginatedAgents((prev) => {
        const updatedAgents = prev.agents.map((wrapper) => {
          if (wrapper.agent.id === agentId) {
            // Create a new training array immutably
            const updatedTrainings = [
              ...(wrapper.agent.trainings || []),
              newTraining,
            ];
            return {
              ...wrapper,
              agent: {
                ...wrapper.agent,
                trainings: updatedTrainings,
              },
            };
          }
          return wrapper; // Return unchanged wrapper if ID doesn't match
        });

        // Return the updated state structure
        return {
          ...prev,
          agents: updatedAgents,
        };
      });

      return true; // Return true on successful state update
    } catch (error) {
      console.error('Error adding agent training locally:', error);
      return false; // Return false if an error occurred
    }
  };

  const deleteAgentTraining = (
    agentId: string,
    trainingId: string
  ): boolean => {
    try {
      setPaginatedAgents((prev) => {
        const updatedAgents = prev.agents.map((wrapper) => {
          if (wrapper.agent.id === agentId) {
            // Remove deleted training from array immutably
            const updatedTrainings = wrapper.agent.trainings.filter(
              (training) => training.id != trainingId
            );
            return {
              ...wrapper,
              agent: {
                ...wrapper.agent,
                trainings: updatedTrainings,
              },
            };
          }
          return wrapper; // Return unchanged wrapper if ID doesn't match
        });

        // Return the updated state structure
        return {
          ...prev,
          agents: updatedAgents,
        };
      });

      return true; // Return true on successful state update
    } catch (error) {
      console.error('Error deleting agent training locally:', error);
      return false; // Return false if an error occurred
    }
  };

  useEffect(() => {
    if (user) {
      fetchAgents();
    }
  }, [user, page, pageSize, query]);

  const contextValue: AgentsContextType = {
    paginatedAgents,
    loading,
    fetchAgents,
    getAgentById,
    createAgent,
    updateAgent,
    deleteAgent,
    activateAgent,
    deactivateAgent,
    getAgentSettings,
    updateAgentSettings,
    setPage,
    setPageSize,
    setQuery,

    createAgentChannel,
    deleteAgentChannel,
    disconnectAgentChannel,

    createAgentTraining,
    deleteAgentTraining,
    setAgentTrainings,
  };

  return (
    <AgentsContext.Provider value={contextValue}>
      {children}
    </AgentsContext.Provider>
  );
}

export const useAgents = (): AgentsContextType => {
  const context = useContext(AgentsContext);
  if (!context) {
    throw new Error('useAgents must be used within an AgentsProvider');
  }
  return context;
};
