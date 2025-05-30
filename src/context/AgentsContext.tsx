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
import {
  defaultPaginatedResponse,
  PaginatedTrainingsResponseDto,
  TrainingDto,
} from '../services/trainingService';
import {
  ChatDto,
  InteractionWithMessagesDto,
  PaginatedInteractionsWithMessagesResponseDto,
  PaginatedResult,
} from '../services/chatService';
import { InteractionStatus } from '../services/chatService';

export enum AIModel {
  GPT_4 = 'GPT_4',
  GPT_4_O = 'GPT_4_O',
  GPT_4_O_MINI = 'GPT_4_O_MINI',
  GPT_4_1_MINI = 'GPT_4_1_MINI',
  GPT_4_1 = 'GPT_4_1',
  DEEPSEEK_CHAT = 'DEEPSEEK_CHAT',
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
  // messageGroupingTime: GroupingTime;
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

  paginatedTrainings: PaginatedTrainingsResponseDto;
  paginatedChats: PaginatedResult<ChatDto>;
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

  syncAgentChannelCreation: (agentId: string, newChannel: Channel) => boolean;
  syncAgentChannelDeletion: (agentId: string, channelId: string) => boolean;
  syncAgentChannelConnectionUpdate: (
    agentId: string,
    channelId: string,
    connectionStatus: string
  ) => boolean;

  syncAgentTrainings: (
    agentId: string,
    trainings: PaginatedTrainingsResponseDto
  ) => boolean;
  syncAgentTrainingCreation: (
    agentId: string,
    newTraining: TrainingDto
  ) => boolean;
  syncAgentTrainingDeletion: (agentId: string, trainingId: string) => boolean;

  syncAgentChats: (chats: PaginatedResult<ChatDto>) => boolean;
  syncAgentChatFinishStatus: (chatId: string, isFinished: boolean) => boolean;
  syncAgentChatRead: (chatId: string) => boolean;
  syncAgentChatHumanTalkStatus: (
    chatId: string,
    isHumanTalk: boolean
  ) => boolean;
  syncAgentChatDeletion: (chatId: string) => boolean;

  syncAgentChatInteractions: (
    chatId: string,
    interactions: PaginatedInteractionsWithMessagesResponseDto
  ) => boolean;
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

      console.log('Before setPaginatedAgents:', paginatedAgents.agents.length);

      setPaginatedAgents((prev) => {
        const updated = {
          ...prev,
          agents: prev.agents.map((wrapper) =>
            wrapper.agent.id === id
              ? { ...wrapper, settings: data.data }
              : wrapper
          ),
        };
        console.log('After setPaginatedAgents:', updated.agents.length);
        return updated;
      });

      notify('Settings updated successfully!', 'success');
      return true;
    } catch (error) {
      notify(error instanceof Error ? error.message : '', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const syncAgentChannelCreation = (
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

  const syncAgentChannelDeletion = (
    agentId: string,
    channelId: string
  ): boolean => {
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

  const syncAgentChannelConnectionUpdate = (
    agentId: string,
    channelId: string,
    connectionStatus: string
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
                connected: connectionStatus === 'WORKING',
                config: channel.config
                  ? {
                      ...channel.config,
                      wahaApi: channel.config.wahaApi
                        ? {
                            ...channel.config.wahaApi,
                            status: connectionStatus,
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
      console.error(
        'Error updating agent channel connection status locally:',
        error
      );
      return false;
    }
  };

  const syncAgentTrainings = (
    agentId: string,
    paginatedTrainings: PaginatedTrainingsResponseDto
  ): boolean => {
    try {
      setPaginatedAgents((prev) => {
        const updatedAgents = prev.agents.map((wrapper) => {
          if (wrapper.agent.id === agentId) {
            return {
              ...wrapper,
              agent: {
                ...wrapper.agent,
                paginatedTrainings,
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
      console.error('Error updating agent trainings locally:', error);
      return false; // Return false if an error occurred
    }
  };

  const syncAgentTrainingCreation = (
    agentId: string,
    newTraining: TrainingDto
  ): boolean => {
    try {
      setPaginatedAgents((prev) => {
        const updatedAgents = prev.agents.map((wrapper) => {
          if (wrapper.agent.id === agentId) {
            const currentPaginatedTrainings =
              wrapper.agent.paginatedTrainings || defaultPaginatedResponse;

            // Create updated trainings array
            const updatedTrainings = [
              ...currentPaginatedTrainings.data,
              newTraining,
            ];

            // Update pagination meta
            const updatedMeta = {
              ...currentPaginatedTrainings.meta,
              total: currentPaginatedTrainings.meta.total + 1,
              itemCount: updatedTrainings.length,
            };

            return {
              ...wrapper,
              agent: {
                ...wrapper.agent,
                paginatedTrainings: {
                  data: updatedTrainings,
                  meta: updatedMeta,
                },
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

  const syncAgentTrainingDeletion = (
    agentId: string,
    trainingId: string
  ): boolean => {
    try {
      setPaginatedAgents((prev) => {
        const updatedAgents = prev.agents.map((wrapper) => {
          if (wrapper.agent.id === agentId) {
            const currentPaginatedTrainings =
              wrapper.agent.paginatedTrainings || defaultPaginatedResponse;

            // Remove deleted training from array immutably
            const updatedTrainings = currentPaginatedTrainings.data.filter(
              (training) => training.id !== trainingId
            );

            // Update pagination meta
            const updatedMeta = {
              ...currentPaginatedTrainings.meta,
              total: Math.max(0, currentPaginatedTrainings.meta.total - 1),
              itemCount: updatedTrainings.length,
            };

            return {
              ...wrapper,
              agent: {
                ...wrapper.agent,
                paginatedTrainings: {
                  data: updatedTrainings,
                  meta: updatedMeta,
                },
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

  const syncAgentChats = (
    paginatedChats: PaginatedResult<ChatDto>
  ): boolean => {
    try {
      setPaginatedAgents((prev) => {
        const chats = paginatedChats.data;
        const inputMeta = paginatedChats.meta;

        // Group incoming chats by agent ID
        const chatsByAgentId = chats.reduce(
          (acc, chat) => {
            if (!acc[chat.agentId]) {
              acc[chat.agentId] = [];
            }
            acc[chat.agentId].push(chat);
            return acc;
          },
          {} as Record<string, ChatDto[]>
        );

        // Create a map of existing agents by ID for quick lookup
        const existingAgentsMap = new Map(
          prev.agents.map((wrapper) => [wrapper.agent.id, wrapper])
        );

        // Update existing agents
        const updatedAgents = prev.agents.map((wrapper) => {
          const agentId = wrapper.agent.id;
          const newChatsForAgent = chatsByAgentId[agentId] || [];

          // Get existing chats for the agent, default to empty array if not present
          const existingChats = wrapper.agent.paginatedChats?.data || [];

          // If no new chats for this agent, and we assume no meta update is needed if no data change,
          // return the wrapper as is. If meta should always update, adjust this.
          if (newChatsForAgent.length === 0) {
            return wrapper;
          }

          // Create a map for quick lookup of new chats by id
          const newChatsMap = new Map(
            newChatsForAgent.map((chat) => [chat.id, chat])
          );

          // Replace existing chats with matching new ones, keep others
          const updatedExistingChats = existingChats.map((chat) =>
            newChatsMap.has(chat.id) ? newChatsMap.get(chat.id)! : chat
          );

          // Add new chats that didn't exist before
          const existingChatIds = new Set(existingChats.map((chat) => chat.id));
          const newChatsToAdd = newChatsForAgent.filter(
            (chat) => !existingChatIds.has(chat.id)
          );

          const mergedChats = [...updatedExistingChats, ...newChatsToAdd];

          return {
            ...wrapper,
            agent: {
              ...wrapper.agent,
              paginatedChats: {
                data: mergedChats,
                meta: inputMeta, // Store the meta from the input PaginatedResult
              },
            },
          };
        });

        // Create new agents for any remaining chat agents that don't exist yet
        const newAgentWrappers: AgentWrapper[] = [];
        Object.keys(chatsByAgentId).forEach((agentId) => {
          if (!existingAgentsMap.has(agentId)) {
            // This agent doesn't exist yet, create it
            const agentChats = chatsByAgentId[agentId];

            // Get agent name from first chat (assuming all chats for same agent have same name)
            const agentName = agentChats[0]?.agentName || `Agent ${agentId}`;
            const workspaceId = user?.workspaceId || '';

            // Create default agent with paginatedChats
            const newAgent: Omit<Agent, 'chats'> & {
              paginatedChats: PaginatedResult<ChatDto>;
            } = {
              id: agentId,
              workspaceId: workspaceId,
              name: agentName,
              avatar: undefined,
              behavior: '',
              communicationType: AgentCommunicationType.NORMAL,
              type: AgentType.SUPPORT,
              jobName: '',
              jobSite: '',
              jobDescription: '',
              isActive: true,
              channels: [],
              paginatedTrainings: {
                data: [],
                meta: {
                  page: 1,
                  pageSize: 10,
                  total: 0,
                  totalPages: 1,
                },
              },
              // Initialize paginatedChats for the new agent
              paginatedChats: {
                data: agentChats,
                meta: inputMeta, // Store the meta from the input PaginatedResult
              },
            };

            // Create default settings
            const defaultSettings: AgentSettings = {
              preferredModel: 'GPT4' as AIModel,
              timezone: '(GMT+00:00) London',
              enabledHumanTransfer: false,
              enabledReminder: false,
              splitMessages: false,
              enabledEmoji: false,
              limitSubjects: false,
            };

            // Create default webhooks
            const defaultWebhooks: AgentWebhooks = {
              onNewMessage: null,
              onLackKnowLedge: null,
              onTransfer: null,
              onFinishAttendance: null,
            };

            newAgentWrappers.push({
              agent: newAgent as Agent, // Cast needed because Agent type might still include 'chats'
              settings: defaultSettings,
              webhooks: defaultWebhooks,
            });
          }
        });

        // Combine updated existing agents with new agents
        const allAgents = [...updatedAgents, ...newAgentWrappers];

        return {
          ...prev,
          agents: allAgents,
        };
      });

      return true;
    } catch (error) {
      console.error('Error updating agent chats locally:', error);
      return false;
    }
  };

  const syncAgentChatFinishStatus = (
    chatId: string,
    isFinished: boolean
  ): boolean => {
    try {
      setPaginatedAgents((prev) => {
        const updatedAgents = prev.agents.map((agentWrapper) => {
          const updatedPaginatedChats = {
            ...agentWrapper.agent.paginatedChats,
            data: agentWrapper.agent.paginatedChats?.data.map((chat) => {
              if (chat.id === chatId) {
                return {
                  ...chat,
                  finished: isFinished,
                  read: isFinished,
                };
              }
              return chat;
            }),
          };

          const updatedAgent = {
            ...agentWrapper.agent,
            paginatedChats: updatedPaginatedChats,
          };

          return {
            ...agentWrapper,
            agent: updatedAgent,
          };
        });

        return {
          ...prev,
          agents: updatedAgents,
        };
      });

      return true;
    } catch (error) {
      console.error('Error updating chat resolved status locally:', error);
      return false;
    }
  };

  const syncAgentChatRead = (chatId: string): boolean => {
    try {
      setPaginatedAgents((prev) => {
        const updatedAgents = prev.agents.map((agentWrapper) => {
          const updatedPaginatedChats = {
            ...agentWrapper.agent.paginatedChats,
            data: agentWrapper.agent.paginatedChats?.data.map((chat) => {
              if (chat.id === chatId) {
                return {
                  ...chat,
                  read: true,
                  unReadCount: 0,
                };
              }
              return chat;
            }),
          };

          const updatedAgent = {
            ...agentWrapper.agent,
            paginatedChats: updatedPaginatedChats,
          };

          return {
            ...agentWrapper,
            agent: updatedAgent,
          };
        });

        return {
          ...prev,
          agents: updatedAgents,
        };
      });

      return true;
    } catch (error) {
      console.error('Error updating chat resolved status locally:', error);
      return false;
    }
  };

  const syncAgentChatHumanTalkStatus = (
    chatId: string,
    isHumanTalk: boolean
  ): boolean => {
    try {
      setPaginatedAgents((prev) => {
        const updatedAgents = prev.agents.map((agentWrapper) => {
          const updatedPaginatedChats = {
            ...agentWrapper.agent.paginatedChats,
            data: agentWrapper.agent.paginatedChats?.data.map((chat) => {
              if (chat.id === chatId) {
                return {
                  ...chat,
                  humanTalk: isHumanTalk,
                  finished: false,
                  // Atualiza também a interação mais recente
                  paginatedInteractions: chat.paginatedInteractions
                    ? {
                        ...chat.paginatedInteractions,
                        data: chat.paginatedInteractions.data.map(
                          (interaction, index, arr) => {
                            if (interaction.chatId === chatId) {
                              // Atualiza a mais recente: a última no array ou por startAt mais recente.
                              const isMostRecent =
                                index === arr.length - 1 ||
                                interaction.startAt ===
                                  Math.max(
                                    ...arr.map((i) =>
                                      new Date(i.startAt).getTime()
                                    )
                                  ).toString();
                              if (isMostRecent) {
                                return {
                                  ...interaction,
                                  status: 'WAITING' as InteractionStatus,
                                };
                              }
                            }
                            return interaction;
                          }
                        ),
                      }
                    : chat.paginatedInteractions,
                };
              }
              return chat;
            }),
          };

          const updatedAgent = {
            ...agentWrapper.agent,
            paginatedChats: updatedPaginatedChats,
          };

          return {
            ...agentWrapper,
            agent: updatedAgent,
          };
        });

        return {
          ...prev,
          agents: updatedAgents,
        };
      });

      return true;
    } catch (error) {
      console.error('Error updating chat resolved status locally:', error);
      return false;
    }
  };

  const syncAgentChatDeletion = (chatId: string): boolean => {
    try {
      setPaginatedAgents((prev) => {
        // Map through each agent wrapper in the previous state
        const updatedAgents = prev.agents.map((agentWrapper) => {
          // Check if paginatedChats and its data array exist for the current agent
          if (!agentWrapper.agent.paginatedChats?.data) {
            // If not, return the agent wrapper unchanged
            return agentWrapper;
          }

          // Filter the chats: keep only those whose ID does NOT match the chatId to be deleted
          const filteredChats = agentWrapper.agent.paginatedChats.data.filter(
            (chat) => chat.id !== chatId
          );

          // If the length of the filtered array is the same as the original,
          // it means the chat wasn't found in this agent's list, so no update needed for this agent.
          if (
            filteredChats.length ===
            agentWrapper.agent.paginatedChats.data.length
          ) {
            return agentWrapper;
          }

          // Create the updated paginatedChats object with the filtered data
          const updatedPaginatedChats = {
            ...agentWrapper.agent.paginatedChats,
            data: filteredChats,
            meta: {
              ...agentWrapper.agent.paginatedChats.meta,
              total: agentWrapper.agent.paginatedChats.meta.total - 1,
            },
          };

          // Create the updated agent object with the modified paginatedChats
          const updatedAgent = {
            ...agentWrapper.agent,
            paginatedChats: updatedPaginatedChats,
          };

          // Return the updated agent wrapper
          return {
            ...agentWrapper,
            agent: updatedAgent,
          };
        });

        // Return the updated state object with the modified agents list
        return {
          ...prev,
          agents: updatedAgents,
        };
      });

      // Indicate that the operation likely succeeded (state update was dispatched)
      return true;
    } catch (error) {
      // Log any error that occurred during the process and indicate failure
      console.error('Error removing chat locally:', error);
      return false;
    }
  };

  const syncAgentChatInteractions = (
    chatId: string,
    paginatedInteractions: PaginatedInteractionsWithMessagesResponseDto
  ): boolean => {
    try {
      setPaginatedAgents((prev) => {
        const interactions = paginatedInteractions.data;
        const inputMeta = paginatedInteractions.meta;

        // Update existing agents
        const updatedAgents = prev.agents.map((wrapper) => {
          // Ensure we are working with the adjusted agent structure
          const agent = wrapper.agent;

          // Find the chat within this agent that matches the chatId
          const existingChats = agent?.paginatedChats?.data || [];
          const chatIndex =
            existingChats?.findIndex((chat) => chat.id === chatId) || -1;

          // If this agent doesn't have the chat we're looking for, return as is
          if (chatIndex === -1) {
            return wrapper;
          }

          const targetChat = existingChats[chatIndex];
          // Get existing interactions from the paginated structure
          const existingInteractions =
            targetChat.paginatedInteractions?.data || [];

          // Create a map for quick lookup of new interactions by id
          const newInteractionsMap = new Map(
            interactions.map((interaction) => [interaction.id, interaction])
          );

          // Replace existing interactions with matching new ones, keep others
          const updatedExistingInteractions = existingInteractions.map(
            (interaction) =>
              newInteractionsMap.has(interaction.id)
                ? newInteractionsMap.get(interaction.id)!
                : interaction
          );

          // Add new interactions that didn't exist before
          const existingInteractionIds = new Set(
            existingInteractions.map((interaction) => interaction.id)
          );
          const newInteractionsToAdd = interactions.filter(
            (interaction) => !existingInteractionIds.has(interaction.id)
          );

          const mergedInteractionsData = [
            ...updatedExistingInteractions,
            ...newInteractionsToAdd,
          ];

          // Create the new paginatedInteractions object for the chat
          const newPaginatedInteractions: PaginatedResult<InteractionWithMessagesDto> =
            {
              data: mergedInteractionsData,
              meta: inputMeta, // Store the meta from the input
            };

          // Update the specific chat with the new paginatedInteractions structure
          const updatedChats = [...existingChats];
          updatedChats[chatIndex] = {
            ...targetChat,
            paginatedInteractions: newPaginatedInteractions,
          };

          // Update the agent's paginatedChats data
          const updatedAgentPaginatedChats: PaginatedResult<ChatDto> = {
            ...agent.paginatedChats,
            data: updatedChats,
          };

          return {
            ...wrapper,
            agent: {
              ...agent,
              paginatedChats: updatedAgentPaginatedChats,
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
      console.error('Error updating agent chat interactions locally:', error);
      return false;
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

    syncAgentChannelCreation,
    syncAgentChannelDeletion,
    syncAgentChannelConnectionUpdate,

    syncAgentTrainingCreation,
    syncAgentTrainingDeletion,
    syncAgentTrainings,

    syncAgentChats,
    syncAgentChatRead,
    syncAgentChatFinishStatus,
    syncAgentChatHumanTalkStatus,
    syncAgentChatDeletion,

    syncAgentChatInteractions,
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
