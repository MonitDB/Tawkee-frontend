// Example React component - OAuthCallbackPage.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { useHttpResponse } from '../../context/ResponseNotifier';

import MarketingPage from '../Marketing';

export default function OAuthCallbackPage() {
  const { notify } = useHttpResponse();
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Remove the Facebook #_=_ hash if present
    if (window.location.hash === '#_=_') {
      // Try to extract token from URL before the hash
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (token) {
        // Clear the URL hash without refreshing the page
        if (history.replaceState) {
          const cleanUrl = window.location.href.split('#')[0];
          history.replaceState(null, 'null', cleanUrl);
        } else {
          // Fallback for older browsers
          window.location.hash = '';
        }

        // Store the token and continue with authentication
        localStorage.setItem('authToken', token);

        // If you're using a state management library like Redux or Context:
        // setAuthToken(token);
      }
    }

    // Get the token from URL query parameters
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    const handleFetchProfile = async (token: string) => {
      try {
        await profile(token);
        notify('Login successful!', 'success');
      } catch (error) {
        notify(error instanceof Error ? error.message : '', 'error');
      } finally {
        navigate('/');
      }
    };

    if (token) {
      handleFetchProfile(token);
    } else if (error) {
      notify('Autentication failed!', 'error');
    }
  }, [navigate]);

  return <MarketingPage />;
}
