import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { useHttpResponse } from '../../context/ResponseNotifier';

import MarketingPage from '../Marketing';

export default function OAuthCallbackPage() {
  const { notify } = useHttpResponse();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [isCalendarSuccess, setIsCalendarSuccess] = useState(false);
  const [calendarEmail, setCalendarEmail] = useState('');

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

    // Check for Google Calendar success
    if (token && token.startsWith('google-calendar-')) {
      // Parse the token format: google-calendar-<email>&<agentId>
      const email = token.replace('google-calendar-', '');
      setCalendarEmail(email);
      setIsCalendarSuccess(true);
      window.close();
      // Close the window after 5 seconds
      // const timer = setTimeout(() => {
      //   window.close();
      // }, 5000);

      // Cleanup timer if component unmounts
      // return () => clearTimeout(timer);
    } else if (token) {
      handleFetchProfile(token);
    } else if (error) {
      notify('Authentication failed!', 'error');
    }
  }, [navigate, notify, profile]);

  // Show calendar success confirmation
  if (isCalendarSuccess) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          padding: '20px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            background: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '400px',
            width: '100%',
          }}
        >
          <div
            style={{
              fontSize: '48px',
              color: '#155724',
              marginBottom: '16px',
            }}
          >
            ✅
          </div>
          <h2
            style={{
              color: '#155724',
              marginBottom: '16px',
              fontSize: '24px',
            }}
          >
            Calendar Authorization Granted
          </h2>
          <p
            style={{
              color: '#155724',
              fontSize: '16px',
              marginBottom: '20px',
            }}
          >
            <strong>{calendarEmail}</strong> granted access to your Google
            Calendar.
          </p>
          <p
            style={{
              color: '#155724',
              fontSize: '18px',
              fontWeight: 'bold',
            }}
          >
            You can close this page now.
          </p>
          <p
            style={{
              color: '#6c757d',
              fontSize: '14px',
              marginTop: '16px',
            }}
          >
            This page will close automatically in 5 seconds.
          </p>
        </div>
      </div>
    );
  }

  return <MarketingPage />;
}
