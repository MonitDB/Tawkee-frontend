import { useState, useCallback, useMemo } from 'react';
import { PublicEmailService } from '../services/publicEmailService';
import { env } from '../config/env'; // adjust path as needed
import { useHttpResponse } from '../context/ResponseNotifier'; // adjust to your notification utility
import { useAuth } from '../context/AuthContext';

export const usePublicEmailService = () => {
  const { handleTokenExpirationError } = useAuth();
  const { notify } = useHttpResponse(); // Destructure handleTokenExpirationError

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
    },
    [publicService, notify, handleTokenExpirationError]
  );

  return {
    loading,
    sendForgotPasswordEmail,
  };
};
