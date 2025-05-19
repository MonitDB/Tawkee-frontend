import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SchoolIcon from '@mui/icons-material/School';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { newAgent } from '../../../assets';

const features = [
  {
    icon: <SmartToyIcon sx={{ fontSize: 32 }} />,
    title: 'Human-like service',
    description: 'Provide your customers with a natural, humanized service that’s available anytime.'
  },
  {
    icon: <AutorenewIcon sx={{ fontSize: 32 }} />,
    title: 'Automate repetitive tasks',
    description: 'Let the AI employee handle repetitive processes so your team can focus on what really matters.'
  },
  {
    icon: <PsychologyIcon sx={{ fontSize: 32 }} />,
    title: 'Learns about your business and processes',
    description: 'Responds to customers quickly and accurately, offering always up-to-date information about your company and operations.'
  },
  {
    icon: <SchoolIcon sx={{ fontSize: 32 }} />,
    title: 'Automate repetitive tasks',
    description: 'Let the AI employee handle repetitive processes so your team can focus on what really matters.'
  }
];

export default function Testimonials() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        width: '100%',
        background: 'linear-gradient(180deg, #0A0F23 0%, #0F172A 100%)',
        color: 'white',
        py: { xs: 8, md: 12 },
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ mb: 6 }}>
              <Chip
                icon={<SmartToyIcon />}
                label="Near-perfect employees"
                sx={{
                  mb: 4,
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.2)',
                  '& .MuiChip-icon': { color: 'white' },
                }}
                variant="outlined"
              />
              <Typography
                variant="h3"
                component="h2"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                }}
              >
                How will AI help me in my service?
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'grey.400',
                  mb: 4,
                }}
              >
                AI employees are like having a dedicated 'ChatGPT' for your business: they understand and respond to customers, perform tasks, and are available 24/7 for you.
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {features.map((feature, index) => (
                <Grid size={{ xs: 12, md: 6 }} key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderColor: 'rgba(255,255,255,0.1)',
                    }}
                  >
                    <CardContent>
                      <Box sx={{ mb: 2, color: 'primary.main' }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'grey.400' }}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Button 
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{ mt: 4 }}
              onClick={() => navigate('/sign-up')}
            >
              Build Your AI Employee
            </Button>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: '600px',
                  bgcolor: 'rgba(255,255,255,0.05)',
                  borderRadius: 4,
                }}
              >
                <img src={newAgent} style={{ width: '100%', padding: '1.0rem' }} />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}