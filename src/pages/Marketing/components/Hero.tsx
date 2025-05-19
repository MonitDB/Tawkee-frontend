import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useColorScheme } from '@mui/material';
import { tawkeeDesktop, tawkeeDesktopLight } from '../../../assets';


export default function Hero() {
  const navigate = useNavigate();

  const { mode, systemMode } = useColorScheme();
  const resolvedMode = (systemMode || mode) as 'light' | 'dark';

  const handleNavigateToSignUp = () => {
    navigate('/sign-up');
  };

  return (
    <Box
      sx={{
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        minHeight: '100vh',
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          opacity: 0.1,
          background: 'radial-gradient(circle at 50% 50%, rgba(100, 150, 255, 0.2) 0%, transparent 50%)',
        }}
      />

      <Container maxWidth="lg" sx={{ pt: { xs: 8, sm: 12, md: 16 }, pb: 8 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={3}>
              <Chip
                icon={<SmartToyIcon />}
                label="FAST SUPPORT"
                color='success'
                sx={{ width: 'fit-content' }}
              />

              <Typography
                component="h1"
                variant="h2"
                color="text.primary"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                  letterSpacing: '-0.02em',
                }}
              >
                Automate support and sales with AI agents that work for you!
              </Typography>

              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 600 }}
              >
                AI agents ready to scale your sales, customer support, and manage your schedule — answering questions and helping automate service with customizable AIs.
              </Typography>

              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={handleNavigateToSignUp}
                sx={{
                  width: 'fit-content',
                  fontSize: '1.1rem',
                  py: 1.5,
                  px: 3,
                  borderRadius: 2,
                }}
              >
                Get 1,000 credits to try it now
              </Button>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                position: 'relative',
                height: { xs: 400, md: 600 },
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {/* Placeholder for the main app screenshot */}
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  bgcolor: 'background.paper',
                  borderRadius: 4,
                  boxShadow: (theme) => theme.shadows[20],
                  overflow: 'hidden',
                }}
              >
                <img src={ resolvedMode == 'dark'
                  ? tawkeeDesktop
                  : tawkeeDesktopLight
                } />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}