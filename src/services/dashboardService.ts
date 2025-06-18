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
  topModels: ModelConsumptionDto[];
}

interface DashboardServiceConfig {
  token: string;
  apiUrl: string;
}

interface DashboardMetricsParams {
  workspaceId: string;
  startDate: string;
  endDate: string;
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

    console.log(
      `GET ${this.apiUrl}/workspaces/${workspaceId}/dashboard-metrics?startDate=${startDate}&endDate=${endDate}...`
    );
    const url = `${this.apiUrl}/workspaces/${workspaceId}/dashboard-metrics?startDate=${startDate}&endDate=${endDate}`;

    try {
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
          errorPayload.error || 'Failed to fetch dashboard metrics';
        throw new Error(message);
      }

      const data = await response.json();
      return data.data as DashboardMetricsDto;
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          throw new Error(
            'Network error. Please check your internet connection.'
          );
        }
        throw new Error(error.message);
      }

      throw new Error(
        'Unexpected error occurred while fetching dashboard metrics'
      );
    }
  }
}
