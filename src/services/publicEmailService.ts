interface EmailServiceConfig {
  apiUrl: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
}

export class PublicEmailService {
  private apiUrl: string;

  constructor(config: EmailServiceConfig) {
    this.apiUrl = config.apiUrl;
  }

  async sendForgotPassword(email: string): Promise<EmailResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        } as const,
        body: JSON.stringify({ email }),
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
    } catch (error: unknown) {
      throw error;
    }
  }
}
