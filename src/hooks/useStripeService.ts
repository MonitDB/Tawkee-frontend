import { useState, useCallback, useMemo } from 'react';
import { StripeService, SubscriptionOverrideUpdateDto, UpdatePlanFromFormDto, UpdateSmartRechargeSettingDto } from '../services/stripeService';
import { env } from '../config/env';
import { useHttpResponse } from '../context/ResponseNotifier';
import { useAuth } from '../context/AuthContext';

export const useStripeService = (token: string) => {
  const { syncWorkspaceSmartRechargeUpdate } = useAuth();
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
        notify((error as Error).message, 'error');
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
      notify((error as Error).message, 'error');
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


  /**
   * Atualiza a configuração de recarga automática do workspace
   */
  const updateSmartRechargeSetting = useCallback(
    async (workspaceId: string, data: UpdateSmartRechargeSettingDto) => {
      try {
        setStripeLoading(true);
        const result = await service.updateSmartRechargeSetting(workspaceId, data);

        syncWorkspaceSmartRechargeUpdate(result);

        notify('Smart recharge settings updated successfully!', 'success');
        return result;
      } catch {
        notify('Failure to update smart recharge settings!', 'error');
        return { success: false };
      } finally {
        setStripeLoading(false);
      }
    },
    [service, notify]
  );

  /**
   * Cria um novo plano no Stripe + backend
  */
  const createPlanFromForm = useCallback(
    async (data: UpdatePlanFromFormDto) => {
      try {
        setStripeLoading(true);
        const response = await service.createPlanFromForm(data);
        notify('Plan created successfully!', 'success');
        return response;
      } catch (error: any) {
        notify((error as Error).message, 'error');
        throw error;
      } finally {
        setStripeLoading(false);
      }
    },
    [service, notify]
  );

  /**
   * Atualiza um plano existente no Stripe + backend
  */
  const updatePlanFromForm = useCallback(
    async (data: UpdatePlanFromFormDto) => {
      try {
        setStripeLoading(true);
        const response = await service.updatePlanFromForm(data);
        notify('Plan updated successfully!', 'success');
        return response;
      } catch (error: any) {
        notify((error as Error).message, 'error');
        throw error;
      } finally {
        setStripeLoading(false);
      }
    },
    [service, notify]
  );

  /**
   * Atualiza overrides (limites personalizados) de uma assinatura
   */
  const updateSubscriptionOverrides = useCallback(
    async (payload: SubscriptionOverrideUpdateDto) => {
      try {
        setStripeLoading(true);
        const result = await service.updateSubscriptionOverrides(payload);
        notify('Subscription overrides updated successfully!', 'success');
        return result;
      } catch (error: unknown) {
        notify((error as Error).message || 'Error updating subscription overrides', 'error');
        return { success: false };
      } finally {
        setStripeLoading(false);
      }
    },
    [service, notify]
  );


  return {
    stripeLoading,
    subscribeOrChangePlan,
    purchaseCredits,
    getAvailableProducts,
    getBillingStatus,
    openCustomerPortal,
    updateSmartRechargeSetting,
    createPlanFromForm,
    updatePlanFromForm,
    updateSubscriptionOverrides
  };
};
