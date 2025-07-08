import { EmailResponse } from './publicEmailService';

interface EmailServiceConfig {
  token: string;
  apiUrl: string;
}

export class PrivateEmailService {
  private token: string;
  private apiUrl: string;

  constructor(config: EmailServiceConfig) {
    this.token = config.token;
    this.apiUrl = config.apiUrl;
  }

  async resendVerification(): Promise<EmailResponse> {
    const response = await fetch(`${this.apiUrl}/auth/resend-verification`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      } as const,
    });

    const data: EmailResponse = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message:
          data.message || `Request failed with status ${response.status}`,
      };
    }

    return data;
  }
}
