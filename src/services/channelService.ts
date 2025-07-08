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
      const errorMessage =
        data.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    return data.data || null;
  }

  async getQRCode(channelId: string): Promise<{ qrCode: string | null }> {
    const response = await fetch(
      `${this.apiUrl}/channel/${channelId}/refresh-qr-code`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${this.token}` } as const,
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

    return { qrCode: data.data.qrCode || null };
  }

  async disconnectChannel(channelId: string): Promise<boolean> {
    const response = await fetch(
      `${this.apiUrl}/channel/${channelId}/disconnect`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${this.token}` } as const,
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

    return data.success === true;
  }

  async deleteChannel(channelId: string): Promise<boolean> {
    const response = await fetch(`${this.apiUrl}/channel/${channelId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${this.token}` } as const,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const errorMessage =
        data.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    return data.success === true;
  }
}
