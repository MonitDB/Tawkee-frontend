import { useState, useCallback, useMemo } from 'react';
import { StripeService } from '../services/stripeService';
import { env } from '../config/env';
import { useHttpResponse } from '../context/ResponseNotifier';

export const useStripeService = (token: string) => {
  const { notify } = useHttpResponse();

  const [stripeLoading, setStripeLoading] = useState<boolean>(false);

  const service = useMemo(
    () =>
      new StripeService({
        token,
        apiUrl: env.API_URL,
      }),
    [token, env.API_URL]
  );

  /**
   * Executa assinatura nova ou troca de plano
   */
  const subscribeOrChangePlan = useCallback(
    async ({ workspaceId, priceId }: { workspaceId: string; priceId: string }) => {
      try {
        setStripeLoading(true);
        const result = await service.changeOrSubscribePlan({ workspaceId, priceId });

        if (result.url) {
          notify('Redirecting to checkout...', 'info');
          window.location.href = result.url;
        } else {
          notify(result.message || 'Plan successfully updated!', 'success');
        }

        return result;
      } catch (error: unknown) {
        notify(error as string, 'error');
      } finally {
        setStripeLoading(false);
      }
    },
    [service, notify]
  );

  /**
   * Inicia compra avulsa de créditos
   */
  const purchaseCredits = useCallback(
    async ({ workspaceId, credits }: { workspaceId: string; credits: number }) => {
      try {
        setStripeLoading(true);
        const { url } = await service.createOneTimeCreditPurchaseSession({ workspaceId, credits });
        notify('Redirecting to purchase of credits...', 'info');
        window.location.href = url;
      } catch (error: unknown) {
        notify(error as string, 'error');
      } finally {
        setStripeLoading(false);
      }
    },
    [service, notify]
  );

  /**
   * Obtém produtos ativos e preços cadastrados
   */
  const getAvailableProducts = useCallback(async () => {
    try {
      setStripeLoading(true);
      const response = await service.getProducts();
      return response;
    } catch (error: unknown) {
      notify(error as string, 'error');
    } finally {
      setStripeLoading(false);
    }
  }, [service, notify]);

  /**
   * Obtém status atual de billing do workspace
   */
  const getBillingStatus = useCallback(async (workspaceId: string) => {
    try {
      setStripeLoading(true);
      const status = await service.getBillingStatus(workspaceId);
      return status;
    } catch (error: unknown) {
      notify(error as string, 'error');
    } finally {
      setStripeLoading(false);
    }
  }, [service, notify]);

  /**
   * Inicia sessão do portal do cliente (Stripe Customer Portal)
   */
  const openCustomerPortal = useCallback(async (workspaceId: string) => {
    try {
      setStripeLoading(true);
      notify('Opening billing management portal...', 'info');
      const { url } = await service.createCustomerPortal(workspaceId);
      window.location.href = url;
    } catch (error: any) {
      console.log(error);
      notify(error.message as string, 'error');
    } finally {
      setStripeLoading(false);
    }
  }, [service, notify]);

  return {
    stripeLoading,
    subscribeOrChangePlan,
    purchaseCredits,
    getAvailableProducts,
    getBillingStatus,
    openCustomerPortal,
  };
};
