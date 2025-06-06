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
  PaginationMeta,
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
  syncAgentMessageChatUpdate: (chat: ChatDto) => boolean;
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

          if (newChatsForAgent.length === 0) {
            return {
              ...wrapper,
              agent: {
                ...wrapper.agent,
                paginatedChats: {
                  data: existingChats,
                  meta: wrapper.agent.paginatedChats?.meta || inputMeta
                },
              },
            };
          }

          // Create a set of existing chat IDs for quick lookup
          const existingChatIds = new Set(existingChats.map((chat) => chat.id));

          // Filter out new chats that already exist (preserve existing chats)
          const newChatsToAdd = newChatsForAgent.filter(
            (chat) => !existingChatIds.has(chat.id)
          );

          // Merge existing chats with only the truly new chats
          const mergedChats = [...existingChats, ...newChatsToAdd];

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

          // --- Determinar chatIndex manualmente --- 
          let chatIndex = -1;
          // console.log(`DEBUG MAP [Agent: ${agent?.id}]: Iniciando busca manual por chatId: ${chatId}`);
          for (let i = 0; i < existingChats.length; i++) {
            const currentChatId = existingChats[i]?.id;
            // Adicionar trim() para robustez contra espaços ocultos/invisíveis
            if (currentChatId?.trim() === chatId?.trim()) {
              chatIndex = i;
              // console.log(`DEBUG MAP [Agent: ${agent?.id}]: Match encontrado manualmente no índice ${i}`);
              break; // Encontrou, pode parar o loop
            }
          }
          // console.log(`DEBUG MAP [Agent: ${agent?.id}]: Resultado da busca manual: chatIndex = ${chatIndex}`);
          // --- Fim da busca manual ---

          // Remover a linha original do findIndex:
          // const chatIndex = existingChats?.findIndex((chat) => chat.id === chatId) || -1;

          // A lógica continua a partir daqui usando o chatIndex encontrado manualmente
          if (chatIndex === -1) {
            // console.log(`DEBUG MAP [Agent: ${agent?.id}]: chatIndex é -1 (busca manual), retornando wrapper original.`);
            return wrapper;
          }

          // --- ESTA PARTE SÓ SERÁ EXECUTADA SE chatIndex NÃO FOR -1 ---
          // console.log(`DEBUG: Found chat ${chatId} in agent ${agent.id} at index ${chatIndex}`);

          const targetChat = existingChats[chatIndex];
          const existingInteractions =
            targetChat.paginatedInteractions?.data || [];

          const newInteractionsMap = new Map(
            interactions.map((interaction) => [interaction.id, interaction])
          );

          const updatedExistingInteractions = existingInteractions.map(
            (interaction) =>
              newInteractionsMap.has(interaction.id)
                ? newInteractionsMap.get(interaction.id)!
                : interaction
          );

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

          const newPaginatedInteractions: PaginatedResult<InteractionWithMessagesDto> =
            {
              data: mergedInteractionsData,
              meta: inputMeta,
            };

          // console.log(`DEBUG [Agent: ${agent.id}, Chat: ${chatId}]: newPaginatedInteractions a ser atribuído:`, JSON.stringify(newPaginatedInteractions));

          const updatedChats = [...existingChats];
          updatedChats[chatIndex] = {
            ...targetChat,
            paginatedInteractions: newPaginatedInteractions,
          };

          // console.log(`DEBUG [Agent: ${agent.id}, Chat: ${chatId}]: updatedChats[${chatIndex}] após atribuição:`, JSON.stringify(updatedChats[chatIndex]));

          const updatedAgentPaginatedChats: PaginatedResult<ChatDto> = {
            ...(agent.paginatedChats || {}),
            data: updatedChats,
            meta: agent.paginatedChats?.meta || { total: updatedChats.length, page: 1, pageSize: updatedChats.length, totalPages: 1 }
          };

          // console.log(`DEBUG [Agent: ${agent.id}, Chat: ${chatId}]: updatedAgentPaginatedChats final:`, JSON.stringify(updatedAgentPaginatedChats));

          const updatedAgent = {
            ...agent,
            paginatedChats: updatedAgentPaginatedChats,
          };

          // console.log(`DEBUG [Agent: ${agent.id}, Chat: ${chatId}]: Agente final a ser retornado pelo map:`, JSON.stringify(updatedAgent));

          return {
            ...wrapper,
            agent: updatedAgent,
          };
        });

        // --- LOGS FINAIS ANTES DE RETORNAR O NOVO ESTADO ---
        // Tentar encontrar os índices novamente para o log final, ciente que findIndex pode falhar
        // const agentIndex = updatedAgents.findIndex(wrapper => wrapper.agent.paginatedChats?.data.some(chat => chat.id === chatId));
        // let finalChatIndex = -1;
        // if (agentIndex !== -1) {
        //     finalChatIndex = updatedAgents[agentIndex]?.agent?.paginatedChats?.data.findIndex(chat => chat.id === chatId);
        // }

        // console.log(`FINAL CHECK - Indices encontrados (pós-map): Agent Index: ${agentIndex}, Chat Index: ${finalChatIndex}`);

        // if (agentIndex !== -1 && finalChatIndex !== -1) { // Usar os índices encontrados pós-map para o log final
        //   const finalAgentWrapper = updatedAgents[agentIndex];
        //   const finalAgentObject = finalAgentWrapper?.agent;
        //   const finalPaginatedChats = finalAgentObject?.paginatedChats;
        //   const finalChatObject = finalPaginatedChats?.data[finalChatIndex];

        //   console.log(
        //     'FINAL CHECK [Direto]: Objeto Chat completo antes de retornar:',
        //     finalChatObject
        //   );
        //   console.log(
        //     'FINAL CHECK [Direto]: Propriedade paginatedInteractions antes de retornar:',
        //     finalChatObject?.paginatedInteractions
        //   );
        //   console.log(
        //     'FINAL CHECK [Stringify]: Propriedade paginatedInteractions antes de retornar:',
        //     JSON.stringify(finalChatObject?.paginatedInteractions)
        //   );

        // } else {
        //   // Se o findIndex pós-map falhar, tentar logar com base no que *deveria* ter sido atualizado
        //   const potentiallyUpdatedAgentWrapper = updatedAgents.find(wrapper => wrapper.agent.id === '71e36e97-1f60-4091-aea5-c48df30ee107'); // Usar ID do agente problemático para log
        //   const potentiallyUpdatedChat = potentiallyUpdatedAgentWrapper?.agent?.paginatedChats?.data.find(chat => chat.id === chatId);
        //   console.log('FINAL CHECK (Fallback): Agente ou Chat não encontrado via findIndex pós-map. Verificando objeto potencialmente atualizado:', JSON.stringify(potentiallyUpdatedChat?.paginatedInteractions));
        // }

        // console.log('FINAL CHECK: Estrutura completa (updatedAgents) antes de retornar:', JSON.stringify(updatedAgents));

        return {
          ...prev,
          agents: updatedAgents,
        };
      });

      return true;
    } catch (error) {
      console.error("Error updating agent chat interactions locally:", error);
      return false;
    }
  };

  const syncAgentMessageChatUpdate = (chat: ChatDto): boolean => {
    let updateApplied = false;
    try {
      setPaginatedAgents((prev) => {
        const agentId = chat.agentId;
        const chatId = chat.id;

        const agentIndex = prev.agents.findIndex(wrapper => wrapper.agent.id === agentId);

        if (agentIndex === -1) {
          console.warn(`Agent with ID ${agentId} not found. Skipping chat update for chat ID ${chatId}.`);
          updateApplied = false;
          return prev;
        }

        const agentWrapper = prev.agents[agentIndex];
        const existingPaginatedChats = agentWrapper.agent.paginatedChats || { data: [], meta: { page: 1, pageSize: 10, total: 0, totalPages: 1 } };
        const existingChats = existingPaginatedChats.data;
        const chatIndex = existingChats.findIndex(c => c.id === chatId);

        let updatedAgentChatsData: ChatDto[];
        let updatedAgentChatsMeta: PaginationMeta = { ...existingPaginatedChats.meta };
        const chatPageSize = Math.max(1, updatedAgentChatsMeta.pageSize);

        if (chatIndex !== -1) {
          // --- Chat exists: Update it --- 
          // console.log(`Updating existing chat ${chatId} for agent ${agentId}`);
          const existingChat = existingChats[chatIndex];

          // --- Granular Interaction Update Logic --- 
          let updatedPaginatedInteractions: PaginatedInteractionsWithMessagesResponseDto | undefined = existingChat.paginatedInteractions;

          // Only perform interaction update if the incoming chat has interactions data
          
          if (chat.paginatedInteractions && chat.paginatedInteractions.data && chat.paginatedInteractions.data.length > 0) {
            const incomingInteractionsData = chat.paginatedInteractions.data;
            const existingInteractions = existingChat.paginatedInteractions?.data || [];
            // Use existing meta as base, or default if none exists
            const baseInteractionMeta = existingChat.paginatedInteractions?.meta || { page: 1, pageSize: 10, total: 0, totalPages: 1 }; 

            // Map for efficient lookup and update of existing interactions
            const interactionsMap = new Map(existingInteractions.map(interaction => [interaction.id, interaction]));

            // Process incoming interactions: update existing or add new
            incomingInteractionsData.forEach(incomingInteraction => {
              // Update existing or add new interaction to the map
              interactionsMap.set(incomingInteraction.id, {
                ...(interactionsMap.get(incomingInteraction.id) || {}), // Keep old fields if updating
                ...incomingInteraction // Override with incoming fields
              });
            });

            // Get the final list of interactions from the map values
            const finalInteractionsData = Array.from(interactionsMap.values());

            // Update meta based on the final merged list
            const finalTotal = finalInteractionsData.length;
            const interactionPageSize = Math.max(1, baseInteractionMeta.pageSize);
            const finalTotalPages = Math.ceil(finalTotal / interactionPageSize);

            updatedPaginatedInteractions = {
              data: finalInteractionsData,
              meta: {
                ...baseInteractionMeta, // Keep existing page, pageSize from original state
                total: finalTotal,
                totalPages: finalTotalPages,
                // Optionally use meta from chat.paginatedInteractions if needed, e.g.:
                // page: chat.paginatedInteractions.meta?.page ?? baseInteractionMeta.page,
              }
            };
            // console.log(`Granularly updated interactions for chat ${chatId}. New total: ${finalTotal}`);
          } else {
            // If incoming chat has no interactions, keep the existing ones
            // console.log(`No interactions provided in update for chat ${chatId}. Keeping existing interactions.`);
          }
          // --- End Granular Interaction Update Logic --- 

          // Create the updated chat object
          const updatedChat: ChatDto = {
            ...existingChat, // Start with existing data
            ...chat, // Override with incoming chat data (like read status, latestMessage, etc.)
            paginatedInteractions: updatedPaginatedInteractions, // Assign the potentially updated interactions
          };

          // Replace the chat in the agent's chat list
          updatedAgentChatsData = [
            ...existingChats.slice(0, chatIndex),
            updatedChat,
            ...existingChats.slice(chatIndex + 1),
          ];
          // Meta total for chats doesn't change when updating a chat
          updatedAgentChatsMeta.total = existingChats.length;

        } else {
          // --- Chat does not exist: Add it --- 
          // console.log(`Adding new chat ${chatId} to agent ${agentId}`);
          // The new chat is added as is, including its paginatedInteractions if present
          updatedAgentChatsData = [...existingChats, chat];
          // Update meta total for chats
          updatedAgentChatsMeta.total = existingChats.length + 1;
        }

        // Recalculate totalPages for the chat list
        updatedAgentChatsMeta.totalPages = Math.ceil(updatedAgentChatsMeta.total / chatPageSize);

        // Create the updated agent object
        const updatedAgent: Agent = {
          ...agentWrapper.agent,
          paginatedChats: {
            data: updatedAgentChatsData,
            meta: updatedAgentChatsMeta,
          },
        };

        // Create the updated agent wrapper
        const updatedAgentWrapper: AgentWrapper = {
          ...agentWrapper,
          agent: updatedAgent,
        };

        // Create the new agents array for the state update
        const updatedAgentsArray = [
          ...prev.agents.slice(0, agentIndex),
          updatedAgentWrapper,
          ...prev.agents.slice(agentIndex + 1),
        ];

        updateApplied = true; // Mark that an update was made

        // Return the updated state structure
        return {
          ...prev,
          agents: updatedAgentsArray,
        };
      });

      return updateApplied;

    } catch (error) {
      console.error('Error in syncAgentMessageChatUpdateCorrected:', error);
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
    syncAgentMessageChatUpdate
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
