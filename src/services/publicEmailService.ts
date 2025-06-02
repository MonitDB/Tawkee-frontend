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
