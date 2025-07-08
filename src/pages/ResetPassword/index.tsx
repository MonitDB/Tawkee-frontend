import { useState, FormEvent, useEffect, useRef } from 'react';

import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { Container, CssBaseline } from '@mui/material';
import AppTheme from '../../components/shared-theme/AppTheme';
import ColorModeSelect from '../../components/shared-theme/ColorModeSelect';
import TawkeeLogo from '../../components/TawkeeLogo';
import LoadingBackdrop from '../../components/LoadingBackdrop';
import env from '../../config/env';
import { useHttpResponse } from '../../context/ResponseNotifier';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

export default function ResetPassword(props: { disableCustomTheme?: boolean }) {
  const { notify } = useHttpResponse();
  const { resetPassword, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] =
    useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);

  const hasVerifiedResetToken = useRef(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (passwordError || confirmPasswordError) {
      return;
    }
    const data = new FormData(event.currentTarget);

    try {
      const response = await resetPassword({
        password: data.get('confirm-password') as string,
        resetToken: resetToken as string,
      });

      if (response.success) {
        navigate('/');
      }
    } catch (error) {
      return;
    }
  };

  const validateInputs = () => {
    const password = document.getElementById('password') as HTMLInputElement;
    const confirmPassword = document.getElementById(
      'confirm-password'
    ) as HTMLInputElement;

    let isValid = true;

    const passwordValue = password.value;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;

    if (!passwordValue || passwordValue.length < 8) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 8 characters long.');
      isValid = false;
    } else if (!passwordRegex.test(passwordValue)) {
      setPasswordError(true);
      setPasswordErrorMessage(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
      );
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    if (confirmPassword.value !== passwordValue) {
      setConfirmPasswordError(true);
      setConfirmPasswordErrorMessage('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError(false);
      setConfirmPasswordErrorMessage('');
    }

    return isValid;
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    if (!token) {
      return;
    }

    // Verifica e atualiza a ref de forma síncrona
    if (hasVerifiedResetToken.current) {
      return; // Se já tentou, não faz nada
    }
    hasVerifiedResetToken.current = true; // Marca que a tentativa vai começar

    const verifyResetToken = async () => {
      try {
        const response = await fetch(`${env.API_URL}/auth/verify-reset-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          } as const,
          body: JSON.stringify({ token }),
        });
        const data = await response.json();
        if (data.data.valid === true) {
          notify('Token still valid. Please continue.', 'success');
          setResetToken(token);
        } else {
          notify(
            'Invalid token. Please request a password reset again.',
            'error'
          );

          const timeoutId = setTimeout(() => {
            navigate('/');
          }, 1000);

          return () => clearTimeout(timeoutId);
        }
      } catch (error) {
        console.error('Token verification error:', error);
        notify(
          'An error occurred while processing token verification. Check your internet connection and try again.',
          'error'
        );
        navigate('/');
      }
    };

    verifyResetToken();
  }, [location.search]);

  const renderContent = () => {
    return (
      <Card variant="outlined">
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <TawkeeLogo />
        </Box>
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
        >
          Reset Your Password
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 2,
          }}
        >
          <FormControl>
            <TextField
              error={passwordError}
              helperText={passwordErrorMessage}
              id="password"
              type="password"
              name="password"
              placeholder="New Password *"
              autoComplete="current-password"
              autoFocus
              required
              fullWidth
              variant="outlined"
              color={passwordError ? 'error' : 'primary'}
            />
          </FormControl>
          <FormControl>
            <TextField
              error={confirmPasswordError}
              helperText={confirmPasswordErrorMessage}
              name="confirm-password"
              placeholder="Confirm New Password *"
              type="password"
              id="confirm-password"
              autoComplete="current-password"
              required
              fullWidth
              variant="outlined"
              color={confirmPasswordError ? 'error' : 'primary'}
            />
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant={loading ? 'outlined' : 'contained'}
            onClick={validateInputs}
            disabled={loading}
          >
            Update
          </Button>
        </Box>
      </Card>
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
      <LoadingBackdrop open={loading} />
    </AppTheme>
  );
}
