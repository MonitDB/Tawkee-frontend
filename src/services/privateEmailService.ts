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
    try {
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
    } catch (error: unknown) {
      let errorMessage = 'A unexpected error occurred.';

      // Check if error is an instance of Error to safely access the message
      if (error instanceof Error) {
        // Handling network failures or fetch-specific errors
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
