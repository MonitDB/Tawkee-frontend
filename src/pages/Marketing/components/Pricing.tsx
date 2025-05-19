
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useNavigate } from 'react-router-dom';

const tiers = [
  {
    title: 'Basic Plan',
    description: 'For those taking their first steps with AI',
    price: '17',
    features: [
      '2,500 message credits',
      '5 available assistants',
      'Website widget',
      'Personalized responses',
      'API access',
    ],
    buttonText: 'Buy now',
    buttonVariant: 'outlined',
    buttonColor: 'primary',
  },
  {
    title: 'Standard',
    subheader: 'Recommended',
    description: 'Ideal for growing businesses',
    price: '77',
    features: [
      '11,500 message credits',
      '20 available assistants',
      'Website widget',
      'Personalized responses',
      'API access',
    ],
    buttonText: 'Buy now',
    buttonVariant: 'contained',
    buttonColor: 'secondary',
  },
  {
    title: 'Corporate',
    description: 'For scaling operations',
    price: '197',
    features: [
      '30,000 message credits',
      '50 available assistants',
      'Website widget',
      'Personalized responses',
      'API access',
    ],
    buttonText: 'Buy now',
    buttonVariant: 'outlined',
    buttonColor: 'primary',
  },
];

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <Container
      id="pricing"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: { xs: 3, sm: 6 },
      }}
    >
      <Box
        sx={{
          width: { sm: '100%', md: '60%' },
          textAlign: { sm: 'left', md: 'center' },
        }}
      >
        <Typography
          component="h2"
          variant="h4"
          gutterBottom
          sx={{ color: 'text.primary' }}
        >
          Simple, transparent pricing
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Choose the plan that best fits your needs
        </Typography>
      </Box>
      <Grid
        container
        spacing={3}
        sx={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}
      >
        {tiers.map((tier) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={tier.title}>
            <Card
              sx={[
                {
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  height: '100%',
                },
                tier.title === 'Standard' && {
                  background: 'linear-gradient(180deg, #E838FF 0%, #350641 100%)',
                  color: 'white',
                },
              ]}
            >
              <CardContent>
                <Box
                  sx={{
                    mb: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Typography component="h3" variant="h6">
                    {tier.title}
                  </Typography>
                  {tier.subheader && (
                    <Chip
                      icon={<AutoAwesomeIcon />}
                      label={tier.subheader}
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: 'inherit',
                      }}
                    />
                  )}
                </Box>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {tier.description}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'baseline',
                    mb: 2,
                  }}
                >
                  <Typography component="span" variant="h6">
                    €
                  </Typography>
                  <Typography component="h3" variant="h2">
                    {tier.price}
                  </Typography>
                  <Typography component="span" variant="h6">
                    /month
                  </Typography>
                </Box>
                <Divider sx={{ my: 2, opacity: 0.8, borderColor: 'divider' }} />
                {tier.features.map((feature) => (
                  <Box
                    key={feature}
                    sx={{
                      py: 1,
                      display: 'flex',
                      gap: 1.5,
                      alignItems: 'center',
                    }}
                    onClick={() => navigate('/sign-up')}
                  >
                    <CheckCircleRoundedIcon
                      sx={{
                        width: 20,
                        color: tier.title === 'Standard' ? 'white' : 'primary.main',
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: tier.title === 'Standard' ? 'white' : 'text.primary',
                      }}
                    >
                      {feature}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant={tier.buttonVariant as 'outlined' | 'contained'}
                  color={tier.buttonColor as 'primary' | 'secondary'}
                  sx={
                    tier.title === 'Standard'
                      ? {
                          borderColor: 'white',
                          color: 'white',
                          '&:hover': {
                            borderColor: 'white',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                          },
                        }
                      : {}
                  }
                  onClick={() => navigate('/sign-up')}
                >
                  {tier.buttonText}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
