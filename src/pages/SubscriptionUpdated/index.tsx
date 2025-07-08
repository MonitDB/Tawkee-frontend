import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import {
  CssBaseline,
  Container,
  Stack,
  Typography,
  CircularProgress,
  Box,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import AppTheme from '../../components/shared-theme/AppTheme';
import ColorModeSelect from '../../components/shared-theme/ColorModeSelect';

export default function SubscriptionUpdated() {
  const [countdown, setCountdown] = useState(3);
  const navigate = useNavigate();
  const location = useLocation();

  const isCreditPurchase =
    new URLSearchParams(location.search).get('type') === 'credit-purchase';

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    if (countdown === 0) {
      clearInterval(timer);
      navigate('/billing');
    }

    return () => clearInterval(timer);
  }, [countdown, navigate]);

  return (
    <AppTheme>
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
        <Stack
          direction="column"
          alignItems="center"
          spacing={3}
          sx={{
            p: 4,
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            backgroundColor: 'background.paper',
            minWidth: '300px',
            maxWidth: '500px',
          }}
        >
          <CheckCircleOutlineIcon
            sx={{ fontSize: 60, color: 'success.main' }}
          />
          <Typography variant="h4" component="h1" gutterBottom>
            {isCreditPurchase
              ? 'Credits Purchased Successfully'
              : 'Subscription Updated Successfully'}
          </Typography>
          <Typography variant="body1">
            {isCreditPurchase
              ? 'Your credits have been added to your workspace.'
              : 'Your subscription was updated and is now active.'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary">
              Redirecting to Billing in {countdown} second
              {countdown > 1 ? 's' : ''}...
            </Typography>
          </Box>
        </Stack>
      </Container>
    </AppTheme>
  );
}
