// Types/Interfaces for ElevenLabs Service

import { ElevenLabsSettings } from '../pages/AgentDetails/components/dialogs/ElevenLabsSettingsDialog';

// Voice category types
export type VoiceCategory = 'premade' | 'cloned' | 'generated' | 'professional';

// DTO for ElevenLabs Voice
export interface ElevenLabsVoiceDto {
  voice_id: string;
  name: string;
  category: VoiceCategory;
  labels?: Record<string, string>;
  description?: string;
  preview_url?: string;
  available_for_tiers?: string[];
  settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

export interface ElevenLabsUserDto {
  connected: boolean;
  userName: string;
  respondAudioWithAudio: boolean;
  alwaysRespondWithAudio: boolean;
  stability: number;
  similarityBoost: number;
  selectedElevenLabsVoiceId: string;
  subscriptionTier: string;
  characterCount: number;
  characterLimit: number;
}

export interface ElevenLabsDataResponseDto {
  data: {
    voices: { voices?: ElevenLabsVoiceDto[] };
    user?: ElevenLabsUserDto;
  };
}

export interface CompleteElevenLabsDto
  extends ElevenLabsUserDto,
    ElevenLabsDataResponseDto {}

// Parameters for activating ElevenLabs integration
export interface ActivateElevenLabsParams {
  apiKey: string;
}

// Parameters for fetching voices
export interface GetVoicesParams {
  agentId: string;
  category?: VoiceCategory;
}

// Parameters for updating selected voice
export interface UpdateSelectedVoiceParams {
  agentId: string;
  voiceId: string;
}

// Generic response for operations
export interface ElevenLabsOperationResponse {
  message: string;
}

// Configuration for ElevenLabs Service
interface ElevenLabsServiceConfig {
  token: string;
  apiUrl: string;
  userId: string;
}

// ElevenLabs Service Class
export class ElevenLabsService {
  private token: string;
  private apiUrl: string;

  constructor(config: ElevenLabsServiceConfig) {
    this.token = config.token;
    this.apiUrl = config.apiUrl;
  }

  /**
   * Activates ElevenLabs integration for a specific agent
   */
  async activateIntegration(
    agentId: string,
    params: ActivateElevenLabsParams
  ): Promise<ElevenLabsOperationResponse> {
    try {
      if (!agentId) {
        throw new Error('Agent ID is required.');
      }

      if (!params.apiKey) {
        throw new Error('API key is required.');
      }

      const url = `${this.apiUrl}/elevenlabs-activate/${agentId}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({ apiKey: params.apiKey }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Agent not found');
        } else if (response.status === 400) {
          const data = await response.json().catch(() => ({}));
          const errorMessage = data.error || 'Invalid API key or request data.';
          throw new Error(errorMessage);
        } else if (response.status >= 500) {
          throw new Error('Internal server error. Please try again later.');
        } else {
          const data = await response.json().catch(() => ({}));
          const errorMessage = data.error || 'A business rule error occurred.';
          throw new Error(errorMessage);
        }
      }

      const data: ElevenLabsOperationResponse = await response
        .json()
        .catch(() => {
          throw new Error('Invalid response from server.');
        });

      return data;
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred.';

      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage =
            'Network error. Please check your internet connection.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      } else {
        errorMessage = 'An unknown error occurred.';
      }

      throw errorMessage;
    }
  }

  /**
   * Deactivates ElevenLabs integration for a specific agent
   */
  async deactivateIntegration(
    agentId: string
  ): Promise<ElevenLabsOperationResponse> {
    try {
      if (!agentId) {
        throw new Error('Agent ID is required.');
      }

      const url = `${this.apiUrl}/elevenlabs-deactivate/${agentId}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Agent not found');
        } else if (response.status >= 500) {
          throw new Error('Internal server error. Please try again later.');
        } else {
          const data = await response.json().catch(() => ({}));
          const errorMessage = data.error || 'A business rule error occurred.';
          throw new Error(errorMessage);
        }
      }

      const data: ElevenLabsOperationResponse = await response
        .json()
        .catch(() => {
          throw new Error('Invalid response from server.');
        });

      return data;
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred.';

      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage =
            'Network error. Please check your internet connection.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      } else {
        errorMessage = 'An unknown error occurred.';
      }

      throw errorMessage;
    }
  }

  /**
   * Fetches available ElevenLabs voices for a specific agent with optional category filter
   */
  async getData(agentId: string): Promise<ElevenLabsDataResponseDto> {
    try {
      if (!agentId) {
        throw new Error('Agent ID is required.');
      }

      const response = await fetch(
        `${this.apiUrl}/elevenlabs-data/${agentId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          console.warn(
            `No data found for agent ${agentId} or agent does not exist.`
          );
          return {
            data: { voices: { voices: [] } },
          };
        } else if (response.status === 401) {
          throw new Error(
            'ElevenLabs integration not activated or invalid API key.'
          );
        } else if (response.status >= 500) {
          throw new Error('Internal server error. Please try again later.');
        } else {
          const data = await response.json().catch(() => ({}));
          const errorMessage = data.error || 'A business rule error occurred.';
          throw new Error(errorMessage);
        }
      }

      const data: ElevenLabsDataResponseDto = await response
        .json()
        .catch(() => {
          throw new Error('Invalid response from server.');
        });

      return data;
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred.';

      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage =
            'Network error. Please check your internet connection.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      } else {
        errorMessage = 'An unknown error occurred.';
      }

      throw errorMessage;
    }
  }

  /**
   * Updates the selected voice for a specific agent
   */
  async updateData(
    agentId: string,
    params: Partial<ElevenLabsSettings>
  ): Promise<ElevenLabsOperationResponse> {
    try {
      if (!agentId) {
        throw new Error('Agent ID is required.');
      }

      const importantParams = {
        respondAudioWithAudio: params.respondAudioWithAudio,
        alwaysRespondWithAudio: params.alwaysRespondWithAudio,
        selectedElevenLabsVoiceId: params.selectedElevenLabsVoiceId,
        similarityBoost: params.similarityBoost,
        stability: params.stability,
      };

      const response = await fetch(
        `${this.apiUrl}/elevenlabs-update-settings/${agentId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`,
          },
          body: JSON.stringify(importantParams),
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Agent or voice not found');
        } else if (response.status === 400) {
          const data = await response.json().catch(() => ({}));
          const errorMessage = data.error || 'Invalid agent ID or voice ID.';
          throw new Error(errorMessage);
        } else if (response.status >= 500) {
          throw new Error('Internal server error. Please try again later.');
        } else {
          const data = await response.json().catch(() => ({}));
          const errorMessage = data.error || 'A business rule error occurred.';
          throw new Error(errorMessage);
        }
      }

      const data: ElevenLabsOperationResponse = await response
        .json()
        .catch(() => {
          throw new Error('Invalid response from server.');
        });

      return data;
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred.';

      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage =
            'Network error. Please check your internet connection.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      } else {
        errorMessage = 'An unknown error occurred.';
      }

      throw errorMessage;
    }
  }
}
