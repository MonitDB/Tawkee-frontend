import { Workspace } from '../pages/Workspaces';

export interface TimeSeriesItemDto {
  date: string;
  total: number;
  byAI: number;
  byHuman: number;
}

export interface ResolvedTrendDto {
  total: number;
  byAI: number;
  byHuman: number;
}

export interface ResolvedMetricsDto {
  total: number;
  byAI: number;
  byHuman: number;
  timeSeries: TimeSeriesItemDto[];
  trend: ResolvedTrendDto;
}

export interface RunningInteractionDto {
  id: string;
  userName: string | null;
  whatsappPhone: string | null;
  isWaiting: boolean;
}

export interface RunningMetricsDto {
  total: number;
  waiting: number;
  interactions: RunningInteractionDto[];
}

export interface CreditByAgentDto {
  agentId: string;
  agentName: string;
  credits: number;
}

export interface CreditPerDayDto {
  date: string;
  totalCredits: number;
  creditsByAgent: CreditByAgentDto[];
}

export interface AgentConsumptionDto {
  agentId: string;
  name: string | null;
  jobName: string | null;
  avatar: string | null;
  totalCredits: number;
}

export interface WorkspaceConsumptionDto {
  workspaceId: string;
  name: string | null;
  totalCredits: number;
}

export interface ModelConsumptionDto {
  model: string;
  credits: number;
}

export interface DashboardMetricsDto {
  resolved: ResolvedMetricsDto;
  running: RunningMetricsDto;
  avgInteractionTimeMs: number;
  avgTimeTrend: number;
  creditsPerDay: CreditPerDayDto[];
  topAgents: AgentConsumptionDto[];
  topWorkspaces: WorkspaceConsumptionDto[];
  topModels: ModelConsumptionDto[];
}

interface DashboardServiceConfig {
  token: string;
  apiUrl: string;
}

interface DashboardMetricsParams {
  workspaceId: string | null;
  startDate: string;
  endDate: string;
}

export interface DailyCreditBalanceItem {
  date: string;
  planCreditsRemaining: number;
  extraCreditsRemaining: number;
}

export class DashboardService {
  private token: string;
  private apiUrl: string;

  constructor(config: DashboardServiceConfig) {
    this.token = config.token;
    this.apiUrl = config.apiUrl;
  }

  async getDashboardMetrics(
    params: DashboardMetricsParams
  ): Promise<DashboardMetricsDto> {
    const { workspaceId, startDate, endDate } = params;

    const url = `${this.apiUrl}/workspaces/${workspaceId ? workspaceId : 'all'}/dashboard-metrics?startDate=${startDate}&endDate=${endDate}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      const message = errorPayload.error || 'Failed to fetch dashboard metrics';
      throw new Error(message);
    }

    const data = await response.json();
    return data.data as DashboardMetricsDto;
  }

  async listWorkspaces({ page = 1 }: { page?: number }): Promise<{
    data: Workspace[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const url = new URL(`${this.apiUrl}/workspaces`);
    url.searchParams.append('page', String(page));

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      const message = errorPayload.error || 'Failed to fetch workspace list';
      throw new Error(message);
    }

    const data = await response.json();

    return {
      data: data.data as Workspace[],
      total: data.meta.total,
      page: data.meta.page,
      pageSize: data.meta.pageSize,
      totalPages: data.meta.totalPages,
    };
  }

  async listAllWorkspacesBasicInfo(): Promise<
    { id: string; name: string; isActive: boolean; email: string | null }[]
  > {
    const url = new URL(`${this.apiUrl}/workspaces/basic`);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      const message =
        errorPayload.error || 'Failed to fetch workspace basic info list';
      throw new Error(message);
    }

    const data = await response.json();

    return data.data as {
      id: string;
      name: string;
      isActive: boolean;
      email: string | null;
    }[];
  }

  async getDetailedWorkspace(workspaceId: string): Promise<Workspace> {
    const url = `${this.apiUrl}/workspaces/${workspaceId}/detailed`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      const message =
        errorPayload.error || 'Failed to fetch detailed workspace';
      throw new Error(message);
    }

    const data = await response.json();
    return data.data as Workspace;
  }

  async getDailyCreditBalance(
    workspaceId: string,
    startDate?: string,
    endDate?: string
  ): Promise<DailyCreditBalanceItem[]> {
    const url = new URL(`${this.apiUrl}/credits/daily-balance/${workspaceId}`);
    if (startDate) url.searchParams.append('startDate', startDate);
    if (endDate) url.searchParams.append('endDate', endDate);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      const message =
        errorPayload.error || 'Failed to fetch daily credit balance';
      throw new Error(message);
    }

    const data = await response.json();
    return data.data as DailyCreditBalanceItem[];
  }

  async updateUserPermissions({
    userId,
    userPermissions,
  }: {
    userId: string;
    userPermissions: {
      allowed?: boolean;
      resource: string;
      action: string;
    }[];
  }): Promise<{ success: boolean }> {
    const url = `${this.apiUrl}/auth/${userId}/permissions`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ permissions: userPermissions }),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      const message = errorPayload.error || 'Failed to update user permissions';
      throw new Error(message);
    }

    const data = await response.json();
    return data.data as { success: boolean };
  }
}
