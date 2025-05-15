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
}

export interface AgentWrapper {
  agent: Agent;
  settings: AgentSettings;
  webhooks: AgentWebhooks;
}

export interface AgentInput
  extends Omit<Agent, 'id' | 'workspaceId' | 'isActive'> {}

interface AgentsContextType {
  agents: AgentWrapper[];
  loading: boolean;
  getAgentById: (id: string) => Promise<Agent | null>;
  createAgent: (input: AgentInput) => Promise<boolean>;
  updateAgent: (id: string, input: AgentInput) => Promise<boolean>;
  deleteAgent: (id: string) => Promise<boolean>;
  activateAgent: (id: string) => Promise<boolean>;
  deactivateAgent: (id: string) => Promise<boolean>;
  getAgentSettings: (id: string) => Promise<AgentSettings | null>;
  updateAgentSettings: (
    id: string,
    settings: AgentSettings
  ) => Promise<boolean>;
  refreshAgents: () => Promise<void>;
}

interface AgentsProviderProps {
  children: ReactNode;
}

const AgentsContext = createContext<AgentsContextType | null>(null);

export function AgentsProvider({ children }: AgentsProviderProps) {
  const { user, token } = useAuth();
  const { notify } = useHttpResponse();

  const [agents, setAgents] = useState<AgentWrapper[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${env.API_URL}/workspace/${user?.workspaceId}/agents`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          } as const,
        }
      );
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setAgents(data.data || []);
    } catch (error) {
      notify(error instanceof Error ? error.message : '', 'error');
    } finally {
      setLoading(false);
    }
  };

  const refreshAgents = async () => {
    await fetchAgents();
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

  const createAgent = async (input: AgentInput): Promise<boolean> => {
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

      notify('Agent created successfully!', 'success');

      if (data.data) {
        setAgents((prev) => [...prev, data.data]);
      }

      return true;
    } catch (error) {
      notify(error instanceof Error ? error.message : '', 'error');
      return false;
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

      notify('Agent updated successfully!', 'success');

      if (data.data) {
        setAgents((prev) =>
          prev.map((agent) =>
            agent.agent.id === id ? { ...agent, ...data.data } : agent
          )
        );
      }

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

      notify('Agent deleted successfully!', 'success');
      setAgents((prev) => prev.filter((agent) => agent.agent.id !== id));
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

      notify('Agent activated!', 'success');
      setAgents((prev) =>
        prev.map((wrapper) =>
          wrapper.agent.id === id
            ? { ...wrapper, agent: { ...wrapper.agent, isActive: true } }
            : wrapper
        )
      );

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
      setAgents((prev) =>
        prev.map((wrapper) =>
          wrapper.agent.id === id
            ? { ...wrapper, agent: { ...wrapper.agent, isActive: false } }
            : wrapper
        )
      );

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

      notify('Settings updated successfully!', 'success');

      // Atualiza o agente no estado
      setAgents((prev) =>
        prev.map((wrapper) =>
          wrapper.agent.id === id ? { ...wrapper, settings } : wrapper
        )
      );

      return true;
    } catch (error) {
      notify(error instanceof Error ? error.message : '', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchAgents();
  }, [user]);

  const contextValue: AgentsContextType = {
    agents,
    loading,
    getAgentById,
    createAgent,
    updateAgent,
    deleteAgent,
    activateAgent,
    deactivateAgent,
    getAgentSettings,
    updateAgentSettings,
    refreshAgents,
  };

  return (
    <AgentsContext.Provider value={contextValue}>
      {children}
    </AgentsContext.Provider>
  );
}

// Hook
export const useAgents = (): AgentsContextType => {
  const context = useContext(AgentsContext);
  if (!context) {
    throw new Error('useAgents must be used within an AgentsProvider');
  }
  return context;
};
