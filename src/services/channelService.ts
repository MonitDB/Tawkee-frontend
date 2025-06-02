export enum ChannelType {
  WHATSAPP,
}

export type Channel = {
  id: string;
  name: string;
  type: ChannelType;
  connected: boolean;
  createdAt: string;
  updatedAt: string;
  config: {
    wahaApi?: object;
  };
};

interface ChannelServiceConfig {
  token: string;
  apiUrl: string;
}

export class ChannelService {
  private token: string;
  private apiUrl: string;

  constructor(config: ChannelServiceConfig) {
    this.token = config.token;
    this.apiUrl = config.apiUrl;
  }

  async createChannel(
    agentId: string,
    name: string,
    type: string
  ): Promise<Channel | null> {
    try {
      const response = await fetch(
        `${this.apiUrl}/agent/${agentId}/create-channel`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          } as const,
          body: JSON.stringify({ name, type }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMessage = data.error || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      return data.data || null;
    } catch (error: unknown) {
        let errorMessage = 'A unexpected error occurred.';

        // Check if error is an instance of Error to safely access the message
        if (error instanceof Error) {
            // Handling network failures or fetch-specific errors
            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Network error. Please check your internet connection.';
            } else {
                errorMessage = `Error: ${error.message}`;
            }
        } else {
            errorMessage = 'An unknown error occurred.';
        }

        throw errorMessage;
    }
  }

  async getQRCode(channelId: string): Promise<{ qrCode: string | null }> {
    try {
      const response = await fetch(
        `${this.apiUrl}/channel/${channelId}/refresh-qr-code`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${this.token}` } as const,
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMessage = data.error || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      return { qrCode: data.data.qrCode || null };
    } catch (error: unknown) {
        let errorMessage = 'A unexpected error occurred.';

        // Check if error is an instance of Error to safely access the message
        if (error instanceof Error) {
            // Handling network failures or fetch-specific errors
            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Network error. Please check your internet connection.';
            } else {
                errorMessage = `Error: ${error.message}`;
            }
        } else {
            errorMessage = 'An unknown error occurred.';
        }

        throw errorMessage;
    }
  }

  async disconnectChannel(channelId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.apiUrl}/channel/${channelId}/disconnect`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${this.token}` } as const,
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMessage = data.error || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      return data.success === true;
    } catch (error: unknown) {
        let errorMessage = 'A unexpected error occurred.';

        // Check if error is an instance of Error to safely access the message
        if (error instanceof Error) {
            // Handling network failures or fetch-specific errors
            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Network error. Please check your internet connection.';
            } else {
                errorMessage = `Error: ${error.message}`;
            }
        } else {
            errorMessage = 'An unknown error occurred.';
        }

        throw errorMessage;
    }
  }

  async deleteChannel(channelId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/channel/${channelId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${this.token}` } as const,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMessage = data.error || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      return data.success === true;
    } catch (error: unknown) {
        let errorMessage = 'A unexpected error occurred.';

        // Check if error is an instance of Error to safely access the message
        if (error instanceof Error) {
            // Handling network failures or fetch-specific errors
            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Network error. Please check your internet connection.';
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
