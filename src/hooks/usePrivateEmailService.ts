import { useState, useCallback, useMemo } from 'react';
import { PrivateEmailService } from '../services/privateEmailService';
import { env } from '../config/env'; // adjust path as needed
import { useHttpResponse } from '../context/ResponseNotifier'; // adjust to your notification utility
import { useAuth } from '../context/AuthContext';

export const usePrivateEmailService = (token: string) => {
  const { handleTokenExpirationError } = useAuth();
  const { notify } = useHttpResponse(); // Destructure handleTokenExpirationError

  const [loading, setLoading] = useState(false);

  const privateService = useMemo(
    () => new PrivateEmailService({ token, apiUrl: env.API_URL }),
    [token, env.API_URL]
  );

  const resendVerificationEmail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await privateService.resendVerification();
      notify(response.message, response.success ? 'success' : 'error');
      return response.success;
    } catch (error) {
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

      handleTokenExpirationError(errorMessage); // Handle token expiration error
      notify(errorMessage, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [privateService, notify, handleTokenExpirationError]);

  return {
    loading,
    resendVerificationEmail,
  };
};
