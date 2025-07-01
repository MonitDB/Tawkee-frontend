import { ScheduleSettingsDto } from '../pages/AgentDetails/components/dialogs/GoogleCalendarConfigDialog';

// Define DTOs and interfaces for Google Calendar service
export interface IntentionDto {
  id: string;
  type: string;
  agentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoogleAuthUrlResponseDto {
  authUrl: string;
  state: string;
}

export interface GoogleAuthStatusResponseDto {
  isAuthenticated: boolean;
  needsRefresh: boolean;
  expiresAt: number;
  scopes: string[];
}

export interface GoogleTokenRevokeResponseDto {
  success: boolean;
}

interface GoogleCalendarServiceConfig {
  token: string;
  apiUrl: string;
}

export class GoogleCalendarService {
  private token: string;
  private apiUrl: string;

  constructor(config: GoogleCalendarServiceConfig) {
    this.token = config.token;
    this.apiUrl = config.apiUrl;
  }

  async createScheduleMeetingIntention(agentId: string): Promise<IntentionDto> {
    try {
      const response = await fetch(
        `${this.apiUrl}/agent/${agentId}/intentions/google-calendar/schedule-meeting`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          } as const,
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMessage =
          data.error || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      return data as IntentionDto;
    } catch (error: unknown) {
      throw error;
    }
  }

  async getAuthUrl(agentId: string): Promise<GoogleAuthUrlResponseDto> {
    try {
      const response = await fetch(
        `${this.apiUrl}/google-calendar-oauth/auth-url/${agentId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.token}`,
          } as const,
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMessage =
          data.error || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      // Validate response structure
      if (
        data.data &&
        typeof data.data.authUrl === 'string' &&
        typeof data.data.state === 'string'
      ) {
        return data.data as GoogleAuthUrlResponseDto;
      } else {
        console.error('Invalid response structure for getAuthUrl:', data);
        throw new Error('Invalid response format');
      }
    } catch (error: unknown) {
      throw error;
    }
  }

  async getAuthStatus(agentId: string): Promise<GoogleAuthStatusResponseDto> {
    try {
      const response = await fetch(
        `${this.apiUrl}/google-calendar-oauth/auth-status/${agentId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.token}`,
          } as const,
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMessage =
          data.error || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      // Validate response structure
      if (
        data &&
        typeof data.isAuthenticated === 'boolean' &&
        typeof data.needsRefresh === 'boolean' &&
        typeof data.expiresAt === 'number' &&
        Array.isArray(data.scopes)
      ) {
        return data as GoogleAuthStatusResponseDto;
      } else {
        console.error('Invalid response structure for getAuthStatus:', data);
        throw new Error('Invalid response format');
      }
    } catch (error: unknown) {
      throw error;
    }
  }

  async revokeTokens(agentId: string): Promise<GoogleTokenRevokeResponseDto> {
    try {
      const response = await fetch(
        `${this.apiUrl}/google-calendar-oauth/revoke/${agentId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${this.token}`,
          } as const,
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMessage =
          data.error || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      // Validate response structure
      if (data && typeof data.success === 'boolean') {
        return data as GoogleTokenRevokeResponseDto;
      } else {
        console.error('Invalid response structure for revokeTokens:', data);
        throw new Error('Invalid response format');
      }
    } catch (error: unknown) {
      throw error;
    }
  }

  async getScheduleSettings(agentId: string): Promise<ScheduleSettingsDto> {
    try {
      const response = await fetch(
        `${this.apiUrl}/agents/${agentId}/schedule-settings`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.token}`,
          } as const,
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMessage =
          data.error || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      return data.data as ScheduleSettingsDto;
    } catch (error: unknown) {
      throw error;
    }
  }

  async updateScheduleSettings(
    agentId: string,
    scheduleSettings: ScheduleSettingsDto
  ): Promise<ScheduleSettingsDto> {
    try {
      const response = await fetch(
        `${this.apiUrl}/agents/${agentId}/schedule-settings`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`,
          } as const,
          body: JSON.stringify(scheduleSettings),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMessage =
          data.error || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      return data.data as ScheduleSettingsDto;
    } catch (error: unknown) {
      throw error;
    }
  }
}
