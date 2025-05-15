import { useState, useCallback, useMemo } from 'react';
import { PrivateEmailService } from '../services/privateEmailService';
import { env } from '../config/env'; // adjust path as needed
import { useHttpResponse } from '../context/ResponseNotifier'; // adjust to your notification utility

export const usePrivateEmailService = (token: string) => {
  const { notify } = useHttpResponse();

  const [loading, setLoading] = useState(false);

  const privateService = useMemo(
    () => new PrivateEmailService({ token, apiUrl: env.API_URL }), [token, env.API_URL]
  );

  const resendVerificationEmail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await privateService.resendVerification()
      notify(response.message, response.success ? 'success' : 'error');

    } catch (error) {
      notify(error instanceof Error ? error.message : 'Unknown error', 'error');
      return [];
    } finally {
      setLoading(false);
    }
  }, [privateService]);

  return {
    loading,
    resendVerificationEmail
  };
};
