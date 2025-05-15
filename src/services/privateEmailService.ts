import { EmailResponse } from "./publicEmailService";

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
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                }
            });

            const data: EmailResponse = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || `Request failed with status ${response.status}`,
                };
            }
            
            return data;

        } catch (error: any) {
            return {
                success: false,
                message: error.message || "An unexpected error occurred while trying to send the verification email.",
            };
        }
    }
}
