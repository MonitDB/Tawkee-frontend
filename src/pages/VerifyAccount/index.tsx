import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import env from '../../config/env';

import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AppTheme from '../../components/shared-theme/AppTheme';
import ColorModeSelect from '../../components/shared-theme/ColorModeSelect';
import { useAuth } from '../../context/AuthContext';


interface VerificationResult {
  success: boolean;
  message: string;
  userId?: string; // Opcional, conforme o backend
}

export default function VerifyAccount(props: { disableCustomTheme?: boolean }) {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();
  const location = useLocation();

  const { token, profile } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const hasVerificationAttemptedRef = useRef(false); // Inicializa a ref como false
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    if (!token) {
      setVerificationResult({
        success: false,
        message: 'Verification token not found in URL. Please use the link sent to your email.',
      });
      setIsLoading(false);
      return;
    }

    // Verifica e atualiza a ref de forma síncrona
    if (hasVerificationAttemptedRef.current) {
      return; // Se já tentou, não faz nada
    }
    hasVerificationAttemptedRef.current = true; // Marca que a tentativa vai começar

    const verifyToken = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${env.API_URL}/auth/verify-email?token=${token}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data: VerificationResult = await response.json();
            setVerificationResult(data);
        } catch (error) {
            console.error('Token verification error:', error);
            setVerificationResult({
                success: false,
                message: 'An error occurred while processing token verification. Check your internet connection and try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    verifyToken();

  }, [location.search]);

  useEffect(() => {
    const fetchProfile = async (token: string) => {
      await profile(token);
      navigate('/');
    }

    if (verificationResult?.success && countdown === 0) {
      if (token) fetchProfile(token);
      return;
    }

    if (verificationResult?.success) {
      const timerId = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    }
  }, [countdown, navigate, verificationResult?.success]);

  const commonStackStyles = [
    {
      p: 4,
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      backgroundColor: 'background.paper',
      minWidth: '300px',
      maxWidth: '500px',
    },
    (theme: any) => theme.applyStyles('dark', {
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    })
  ];

  const renderContent = () => {
    if (isLoading) {
      return (
        <Stack direction="column" alignItems="center" spacing={3} sx={commonStackStyles}>
          <CircularProgress size={60} />
          <Typography variant="h5">Verifying your account...</Typography>
          <Typography variant="body1" color="text.secondary">Please, wait a few seconds.</Typography>
        </Stack>
      );
    }

    if (!verificationResult) {
        return (
            <Stack direction="column" alignItems="center" spacing={3} sx={commonStackStyles}>
                <ErrorOutlineIcon sx={{ fontSize: 60, color: 'warning.main' }} />
                <Typography variant="h5" component="h1" gutterBottom>
                    Invalid State
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    An unexpected behavior happened. Please, try to load the page again.
                </Typography>
            </Stack>
        );
    }

    if (verificationResult.success) {
      return (
        <Stack direction="column" alignItems="center" spacing={3} sx={commonStackStyles}>
          <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main' }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Successfully Verified Your Account!
          </Typography>
          <Typography variant="body1">
            {verificationResult.message || 'Your account was verified and is ready for use.'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary">
              Redirecting in {countdown} seconds...
            </Typography>
          </Box>
        </Stack>
      );
    }

    // success === false
    return (
      <Stack direction="column" alignItems="center" spacing={3} sx={commonStackStyles}>
        <ErrorOutlineIcon sx={{ fontSize: 60, color: 'error.main' }} />
        <Typography variant="h4" component="h1" gutterBottom>
          Verification Failed
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {verificationResult.message || 'We could not verify your account. Please check the link sent via email and try again.'}
        </Typography>
      </Stack>
    );
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
      <Container
        component="main"
        maxWidth="sm"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          py: 4,
        }}
      >
        {renderContent()}
      </Container>
    </AppTheme>
  );
}