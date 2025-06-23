export interface StripeCheckoutSessionResponse {
  url: string;
}

export interface PurchaseCreditsRequest {
  workspaceId: string;
  credits: number;
}

export interface CreateCheckoutRequest {
  workspaceId: string;
  priceId: string;
}

export interface BillingStatusResponse {
  status: 'ACTIVE' | 'INACTIVE' | 'TRIALING' | 'PAST_DUE' | string;
  renewalDate?: string;
  credits?: number;
  currentPlan?: string;
}

export interface ProductWithPrices {
  product: any;
  prices: any;
  planDetails?: any;
  metadata: any;
}

export interface ChangeOrSubscribeResponse {
  url?: string;
  message?: string;
  subscriptionId?: string;
}

export interface UpdateSmartRechargeSettingDto {
  threshold?: number;
  rechargeAmount?: number;
  active?: boolean;
}

// Configuração do serviço Stripe

interface StripeServiceConfig {
  token: string;
  apiUrl: string;
}

export class StripeService {
  private token: string;
  private apiUrl: string;

  constructor(config: StripeServiceConfig) {
    this.token = config.token;
    this.apiUrl = config.apiUrl;
  }

  private get headers(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    };
  }

  /**
   * Cria uma sessão de checkout com assinatura recorrente ou faz upgrade/downgrade de plano existente
   */
  async changeOrSubscribePlan(
        data: CreateCheckoutRequest
    ): Promise<ChangeOrSubscribeResponse> {
        const response = await fetch(
        `${this.apiUrl}/stripe/billing/change-or-subscribe`,
        {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(data),
        }
        );

        return this.handleJsonResponse<ChangeOrSubscribeResponse>(response);
    }

  /**
   * Cria uma sessão de checkout com assinatura recorrente
   */
  async createCheckoutSession(
    data: CreateCheckoutRequest
  ): Promise<StripeCheckoutSessionResponse> {
    const response = await fetch(`${this.apiUrl}/stripe/checkout`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    });

    return this.handleJsonResponse<StripeCheckoutSessionResponse>(response);
  }

  /**
   * Cria uma sessão de compra avulsa de créditos
   */
  async createOneTimeCreditPurchaseSession(
    data: PurchaseCreditsRequest
  ): Promise<StripeCheckoutSessionResponse> {
    const response = await fetch(`${this.apiUrl}/stripe/purchase-credits`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    });

    return this.handleJsonResponse<StripeCheckoutSessionResponse>(response);
  }

  /**
   * Retorna produtos ativos e seus preços cadastrados no Stripe
   */
  async getProducts(): Promise<ProductWithPrices[]> {
    const response = await fetch(`${this.apiUrl}/stripe/products`, {
      method: 'GET',
      headers: this.headers,
    });

    return this.handleJsonResponse<ProductWithPrices[]>(response);
  }

  /**
   * Retorna o status de cobrança de um workspace
   */
  async getBillingStatus(workspaceId: string): Promise<BillingStatusResponse> {
    const response = await fetch(
      `${this.apiUrl}/stripe/billing/status/${workspaceId}`,
      {
        method: 'GET',
        headers: this.headers,
      }
    );

    return this.handleJsonResponse<BillingStatusResponse>(response);
  }

  /**
   * Cria uma URL para o portal de autoatendimento de billing (customer portal do Stripe)
   */
  async createCustomerPortal(
    workspaceId: string
  ): Promise<StripeCheckoutSessionResponse> {
    try {
        const response = await fetch(
          `${this.apiUrl}/stripe/billing/customer-portal/${workspaceId}`,
          {
            method: 'POST',
            headers: this.headers,
          }
        );
    
        return this.handleJsonResponse<StripeCheckoutSessionResponse>(response);
    } catch (error) {
        throw error;
    }
  }

  /**
   * Atualiza a configuração de recarga inteligente de créditos para um workspace
   */
  async updateSmartRechargeSetting(
    workspaceId: string,
    data: UpdateSmartRechargeSettingDto
  ): Promise<{ success: boolean }> {
    const response = await fetch(
      `${this.apiUrl}/credits/smart-recharge/${workspaceId}`,
      {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(data),
      }
    );

    return this.handleJsonResponse<{ success: boolean }>(response);
  }

  /**
   * Utilitário para tratar respostas JSON
   */
  private async handleJsonResponse<T>(response: Response): Promise<T> {
    try {
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const error = data.error || `HTTP error ${response.status}`;
        throw new Error(error);
      }

      const data = await response.json();
      return await data.data;
    } catch (err) {
      if (err instanceof Error && err.message.includes('Failed to fetch')) {
        throw new Error(
          'Network error. Please check your internet connection.'
        );
      }
      throw err instanceof Error
        ? err
        : new Error('An unexpected error occurred.');
    }
  }
}
