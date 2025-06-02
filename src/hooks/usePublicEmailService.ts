import { useState, useCallback, useMemo } from 'react';
import { PublicEmailService } from '../services/publicEmailService';
import { env } from '../config/env'; // adjust path as needed
import { useHttpResponse } from '../context/ResponseNotifier'; // adjust to your notification utility

export const usePublicEmailService = () => {
  const { notify } = useHttpResponse();

  const [loading, setLoading] = useState(false);

  const publicService = useMemo(
    () => new PublicEmailService({ apiUrl: env.API_URL }),
    [env.API_URL]
  );

  const sendForgotPasswordEmail = useCallback(
    async (email: string) => {
      try {
        setLoading(true);
        const response = await publicService.sendForgotPassword(email);
        notify(response.message, response.success ? 'success' : 'error');

        return true;
      } catch (error) {
        notify(error as string, 'error');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [publicService]
  );

  return {
    loading,
    sendForgotPasswordEmail,
  };
};
