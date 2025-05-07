// ChannelService.ts
export type Channel = {
    id: string;
    name: string;
    type: string;
    connected: boolean;
    config: any
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

    async getChannelsForAgent(agentId: string): Promise<Channel[]> {
        try {
            const response = await fetch(`${this.apiUrl}/agent/${agentId}/search`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            return data.data || [];

        } catch (error) {
            return [];
        }
    }

    async createChannel(agentId: string, name: string, type: string): Promise<Channel | null> {
        try {
        const response = await fetch(`${this.apiUrl}/agent/${agentId}/create-channel`, {
            method: 'POST',
            headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, type })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error);
            return data.data || null;
        } catch {
            return null;
        }
    }

    async getQRCode(channelId: string): Promise<{ qrCode: string | null }> {
        try {
        const response = await fetch(`${this.apiUrl}/channel/${channelId}/qr-code`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${this.token}` }
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error);
            return { qrCode: data.data.qrCode || null };
        } catch {
            return { qrCode: null };
        }
    }

    async disconnectChannel(channelId: string): Promise<boolean> {
        try {
        const response = await fetch(`${this.apiUrl}/channel/${channelId}/disconnect`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${this.token}` }
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error);
            return data.success === true;
        } catch {
            return false;
        }
    }

    async deleteChannel(channelId: string): Promise<boolean> {
        try {
        const response = await fetch(`${this.apiUrl}/channel/${channelId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${this.token}` }
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error);
            return data.success === true;
        } catch {
            return false;
        }
    }
}
